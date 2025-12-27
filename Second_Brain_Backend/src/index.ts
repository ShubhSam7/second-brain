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
} from "./validation.js";
import { categorizeLink, isValidUrl, normalizeUrl } from "./linkCategorizer.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
    res.status(400).json({
      success: false,
      message: "Invalid reference",
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
      // Validate input with Zod
      const validatedData = createContentSchema.parse(req.body);
      let { link, title, type, description, thumbnail } = validatedData;

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

      // Create content
      const content = await prisma.content.create({
        data: {
          link,
          type: finalType,
          category,
          domain,
          title,
          description,
          thumbnail,
          //@ts-ignore
          userId: req.userId,
        },
      });

      res.status(201).json({
        success: true,
        message: "Content added successfully",
        content: {
          id: content.id,
          link: content.link,
          type: content.type,
          category: content.category,
          domain: content.domain,
          title: content.title,
          description: content.description,
          thumbnail: content.thumbnail,
          createdAt: content.createdAt,
        },
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
        message: "Failed to add content",
        error: e.message,
      });
    }
  }
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
        //@ts-ignore
        userId: req.userId,
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
  }
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
          //@ts-ignore
          userId: req.userId,
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
  }
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
            //@ts-ignore
            userId: req.userId,
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
            //@ts-ignore
            userId: req.userId,
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
            //@ts-ignore
            userId: req.userId,
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
  }
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
          //@ts-ignore
          userId: req.userId,
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
  }
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
