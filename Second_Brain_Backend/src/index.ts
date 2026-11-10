// Load environment variables first
import { config } from "dotenv";
config();

import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors";
import prisma from "./db.js";
import { JWT_SECRET, PORT } from "./config.js";
import { auth } from "./middleware.js";
import { random } from "./utils.js";
import {
  signupSchema,
  signinSchema,
  createContentSchema,
  contentIdSchema,
  shareLinkSchema,
  contentFilterSchema,
  searchQuerySchema,
  sourceTextSchema,
} from "./validation.js";
import { categorizeLink, isValidUrl, normalizeUrl } from "./linkCategorizer.js";
import {
  prepareBookmark,
  embeddingUpdateQuery,
} from "./services/bookmarkPreparation.js";
import { searchLibrary } from "./services/search.js";

// Extend Express Request type to include userId from auth middleware
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "512kb" }));

// Prisma error handler utility
function handlePrismaError(error: any, res: Response): void {
  if (error.code === "P2002") {
    // Unique constraint violation
    res.status(409).json({
      success: false,
      message: `${error.meta?.target?.[0] || "Field"} already exists`,
    });
  } else if (error.code === "P2025") {
    // Record not found
    res.status(404).json({
      success: false,
      message: "Resource not found",
    });
  } else if (error.code === "P2003") {
    // Foreign key constraint violation
    console.error("[Prisma P2003] Foreign key constraint failed:", error.meta);
    res.status(400).json({
      success: false,
      message: "User authentication error. Please sign in again.",
    });
  } else {
    res.status(500).json({
      success: false,
      message: "Database error occurred",
    });
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Second Brain API is running" });
});

// ============= AUTHENTICATION ENDPOINTS =============

app.post("/api/v1/signup", async (req, res) => {
  try {
    // Validate input with Zod
    const validatedData = signupSchema.parse(req.body);
    const { username, password } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "Username already exists",
      });
      return;
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (e: any) {
    if (e.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: e.errors,
      });
      return;
    }
    if (e.code && e.code.startsWith("P")) {
      handlePrismaError(e, res);
      return;
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: e.message,
    });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  try {
    // Validate input with Zod
    const validatedData = signinSchema.parse(req.body);
    const { username, password } = validatedData;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Signed in successfully",
      token: token,
      username: user.username,
    });
  } catch (e: any) {
    if (e.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: e.errors,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: e.message,
    });
  }
});

// ============= CONTENT ENDPOINTS =============

app.post(
  "/api/v1/content",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("[POST /api/v1/content] userId from auth:", req.userId);

      // Ensure userId exists
      if (!req.userId) {
        res.status(401).json({
          success: false,
          message: "User authentication failed",
        });
        return;
      }

      // Validate input with Zod
      const validatedData = createContentSchema.parse(req.body);
      let { link, title, type, description, thumbnail, sourceText } =
        validatedData;

      // Normalize URL
      link = normalizeUrl(link);

      // Validate URL
      if (!isValidUrl(link)) {
        res.status(400).json({
          success: false,
          message: "Invalid URL format",
        });
        return;
      }

      // Auto-categorize link if type not provided
      const linkInfo = categorizeLink(link);
      const finalType = type || linkInfo.type;
      const category = linkInfo.category;
      const domain = linkInfo.domain;

      const prepared = await prepareBookmark({
        link,
        title,
        description,
        thumbnail,
        sourceText,
      });

      const savedContent = await prisma.$transaction(async (tx) => {
        const content = await tx.content.create({
          data: {
            link,
            type: finalType,
            category,
            domain,
            title: prepared.title,
            description: prepared.description,
            thumbnail: prepared.thumbnail,
            extractedContent: prepared.extractedContent,
            contentSource: prepared.contentSource,
            userId: req.userId!,
          },
        });

        console.log(`[Database] Content created with ID: ${content.id}`);

        await tx.$executeRaw(embeddingUpdateQuery(content.id, prepared.vector));

        return content;
      });
      res.status(201).json({
        success: true,
        message: "Content added successfully",
        processing: prepared.processing,
        content: {
          id: savedContent.id,
          link: savedContent.link,
          type: savedContent.type,
          category: savedContent.category,
          domain: savedContent.domain,
          title: savedContent.title,
          description: savedContent.description,
          thumbnail: savedContent.thumbnail,
          createdAt: savedContent.createdAt,
          updatedAt: savedContent.updatedAt,
        },
      });
    } catch (e: any) {
      console.error("[POST /api/v1/content] Error:", e);

      if (e.name === "ZodError") {
        console.error(
          "[POST /api/v1/content] Zod validation errors:",
          e.errors,
        );
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: e.errors,
        });
        return;
      }
      if (e.code && e.code.startsWith("P")) {
        console.error(
          "[POST /api/v1/content] Prisma error:",
          e.code,
          e.message,
        );
        handlePrismaError(e, res);
        return;
      }
      res.status(500).json({
        success: false,
        message: "Failed to add content",
        error: e.message,
      });
    }
  },
);

app.get(
  "/api/v1/content",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Parse query parameters
      const filters = contentFilterSchema.parse(req.query);
      const { type, category, limit = 100, offset = 0 } = filters;

      // Build where clause
      const where: any = {
        userId: req.userId!,
      };

      if (type) {
        where.type = type;
      }

      if (category) {
        where.category = category;
      }

      // Fetch content with pagination
      const [content, total] = await Promise.all([
        prisma.content.findMany({
          where,
          select: {
            id: true,
            link: true,
            title: true,
            description: true,
            type: true,
            category: true,
            domain: true,
            thumbnail: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limit,
        }),
        prisma.content.count({ where }),
      ]);

      res.json({
        success: true,
        content: content,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      });
    } catch (e: any) {
      if (e.name === "ZodError") {
        res.status(400).json({
          success: false,
          message: "Invalid query parameters",
          errors: e.errors,
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: "Failed to fetch content",
        error: e.message,
      });
    }
  },
);

app.patch(
  "/api/v1/content/:contentId",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    const validated = sourceTextSchema.safeParse(req.body);
    if (!validated.success) {
      res
        .status(400)
        .json({
          success: false,
          message: "Add post text between 20 and 80,000 characters",
          errors: validated.error.issues,
        });
      return;
    }
    try {
      const existing = await prisma.content.findFirst({
        where: { id: req.params.contentId, userId: req.userId! },
      });
      if (!existing) {
        res.status(404).json({ success: false, message: "Bookmark not found" });
        return;
      }
      const prepared = await prepareBookmark({
        link: existing.link,
        title: validated.data.title || existing.title,
        sourceText: validated.data.sourceText,
        thumbnail: existing.thumbnail || undefined,
      });
      const content = await prisma.$transaction(async (tx) => {
        const updated = await tx.content.updateMany({
          where: {
            id: existing.id,
            userId: req.userId!,
            updatedAt: existing.updatedAt,
          },
          data: {
            title: prepared.title,
            description: prepared.description,
            extractedContent: prepared.extractedContent,
            contentSource: "provided",
          },
        });
        if (!updated.count) return null;
        await tx.$executeRaw(
          embeddingUpdateQuery(existing.id, prepared.vector),
        );
        return tx.content.findUnique({
          where: { id: existing.id },
          select: {
            id: true,
            title: true,
            link: true,
            description: true,
            thumbnail: true,
            type: true,
            category: true,
            domain: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      });
      if (!content) {
        res
          .status(409)
          .json({
            success: false,
            message:
              "This bookmark changed while saving. Please reopen it and try again.",
          });
        return;
      }
      res.json({
        success: true,
        content,
        processing: prepared.processing,
        message: "Post text saved and search updated",
      });
    } catch {
      res
        .status(500)
        .json({
          success: false,
          message: "Could not update this bookmark. Please try again.",
        });
    }
  },
);

app.delete(
  "/api/v1/content",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate input
      const validatedData = contentIdSchema.parse(req.body);
      const { contentId } = validatedData;

      // Delete content (only if it belongs to the user)
      const result = await prisma.content.deleteMany({
        where: {
          id: contentId,
          userId: req.userId!,
        },
      });

      if (result.count === 0) {
        res.status(404).json({
          success: false,
          message: "Content not found or unauthorized",
        });
        return;
      }

      res.json({
        success: true,
        message: "Content deleted successfully",
      });
    } catch (e: any) {
      if (e.name === "ZodError") {
        res.status(400).json({
          success: false,
          message: "Invalid content ID",
          errors: e.errors,
        });
        return;
      }
      if (e.code && e.code.startsWith("P")) {
        handlePrismaError(e, res);
        return;
      }
      res.status(500).json({
        success: false,
        message: "Failed to delete content",
        error: e.message,
      });
    }
  },
);

// ============= SEMANTIC SEARCH ENDPOINT =============

app.get(
  "/api/v1/brain/search",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const validated = searchQuerySchema.safeParse(req.query);
      if (!validated.success) {
        res.status(400).json({
          success: false,
          message:
            "Enter a search query of 1–500 characters and a limit of 1–50",
          errors: validated.error.issues,
        });
        return;
      }
      const { q, limit } = validated.data;
      const search = await searchLibrary(req.userId!, q, limit, {
        query: (query) => prisma.$queryRaw(query),
      });
      res.json({ success: true, query: q, ...search });
    } catch (e: any) {
      console.error("[Semantic Search] Error:", e.message);
      res.status(500).json({
        success: false,
        message: "Search failed",
        error: e.message,
      });
    }
  },
);

// ============= SHARING ENDPOINTS =============

app.post(
  "/api/v1/brain/share",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = shareLinkSchema.parse(req.body);
      const { share } = validatedData;

      if (share) {
        // Check if share link already exists
        const existingLink = await prisma.link.findUnique({
          where: {
            userId: req.userId!,
          },
        });

        if (existingLink) {
          res.json({
            success: true,
            message: "Share link already exists",
            hash: existingLink.hash,
          });
          return;
        }

        // Create new share link
        const hash = random(10);
        const newLink = await prisma.link.create({
          data: {
            userId: req.userId!,
            hash: hash,
          },
        });

        res.json({
          success: true,
          message: "Share link created successfully",
          hash: newLink.hash,
        });
      } else {
        // Remove share link
        await prisma.link.deleteMany({
          where: {
            userId: req.userId!,
          },
        });

        res.json({
          success: true,
          message: "Share link removed successfully",
        });
      }
    } catch (e: any) {
      if (e.name === "ZodError") {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: e.errors,
        });
        return;
      }
      if (e.code && e.code.startsWith("P")) {
        handlePrismaError(e, res);
        return;
      }
      res.status(500).json({
        success: false,
        message: "Failed to update share link",
        error: e.message,
      });
    }
  },
);

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  try {
    const hash = req.params.shareLink;

    // Find link by hash with user and content
    const link = await prisma.link.findUnique({
      where: { hash },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!link) {
      res.status(404).json({
        success: false,
        message: "Invalid share link",
      });
      return;
    }

    // Fetch user's content
    const content = await prisma.content.findMany({
      where: { userId: link.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        link: true,
        type: true,
        category: true,
        domain: true,
        title: true,
        description: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      username: link.user.username,
      content: content,
    });
  } catch (e: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch shared brain",
      error: e.message,
    });
  }
});

// ============= UTILITY ENDPOINTS =============

// Get content grouped by category
app.get(
  "/api/v1/content/categories",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await prisma.content.groupBy({
        by: ["category"],
        where: {
          userId: req.userId!,
        },
        _count: {
          category: true,
        },
        orderBy: {
          _count: {
            category: "desc",
          },
        },
      });

      res.json({
        success: true,
        categories: categories.map((cat) => ({
          category: cat.category,
          count: cat._count.category,
        })),
      });
    } catch (e: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch categories",
        error: e.message,
      });
    }
  },
);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Second Brain Backend is Running!",
    version: "1.0.0",
  });
});

// IMPORTANT: Only listen on port if NOT running on Vercel
// Vercel sets 'process.env.VERCEL' to '1' automatically
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 API: http://localhost:${PORT}/api/v1`);
    console.log(`💓 Health: http://localhost:${PORT}/health`);
  });
}

// CRITICAL: Export the app for Vercel serverless functions
export default app;
