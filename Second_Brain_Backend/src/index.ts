import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors";
import { userModel, contentModel, linkModel } from "./db";
import { JWT_SECRET, PORT } from "./config";
import { auth } from "./middleware";
import { random } from "./utils";
import {
  signupSchema,
  signinSchema,
  createContentSchema,
  contentIdSchema,
  shareLinkSchema,
  contentFilterSchema
} from "./validation";
import {
  categorizeLink,
  isValidUrl,
  normalizeUrl
} from "./linkCategorizer";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
    const existingUser = await userModel.findOne({ username });
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
    await userModel.create({
      username,
      password: hashedPassword,
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
    const user = await userModel.findOne({ username });
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
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

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

app.post("/api/v1/content", auth, async (req, res) => {
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
    const content = await contentModel.create({
      link,
      type: finalType,
      category,
      domain,
      title,
      description,
      thumbnail,
      tags: [],
      //@ts-ignore
      userId: req.userId,
    });

    res.status(201).json({
      success: true,
      message: "Content added successfully",
      content: {
        id: content._id,
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
    res.status(500).json({
      success: false,
      message: "Failed to add content",
      error: e.message,
    });
  }
});

app.get("/api/v1/content", auth, async (req, res) => {
  try {
    // Parse query parameters
    const filters = contentFilterSchema.parse(req.query);
    const { type, category, limit = 100, offset = 0 } = filters;

    // Build query
    const query: any = {
      //@ts-ignore
      userId: req.userId,
    };

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    // Fetch content with pagination
    const content = await contentModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .select("-__v");

    // Get total count for pagination
    const total = await contentModel.countDocuments(query);

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
});

app.delete("/api/v1/content", auth, async (req, res) => {
  try {
    // Validate input
    const validatedData = contentIdSchema.parse(req.body);
    const { contentId } = validatedData;

    // Delete content (only if it belongs to the user)
    const result = await contentModel.deleteOne({
      _id: contentId,
      //@ts-ignore
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
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
    res.status(500).json({
      success: false,
      message: "Failed to delete content",
      error: e.message,
    });
  }
});

// ============= SHARING ENDPOINTS =============

app.post("/api/v1/brain/share", auth, async (req, res) => {
  try {
    const validatedData = shareLinkSchema.parse(req.body);
    const { share } = validatedData;

    if (share) {
      // Check if share link already exists
      const existingLink = await linkModel.findOne({
        //@ts-ignore
        userId: req.userId,
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
      const hash = await linkModel.create({
        //@ts-ignore
        userId: req.userId,
        hash: random(10),
      });

      res.json({
        success: true,
        message: "Share link created successfully",
        hash: hash.hash,
      });
    } else {
      // Remove share link
      await linkModel.deleteOne({
        //@ts-ignore
        userId: req.userId,
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
    res.status(500).json({
      success: false,
      message: "Failed to update share link",
      error: e.message,
    });
  }
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  try {
    const hash = req.params.shareLink;

    // Find link by hash
    const link = await linkModel.findOne({ hash });

    if (!link) {
      res.status(404).json({
        success: false,
        message: "Invalid share link",
      });
      return;
    }

    // Fetch user's content
    const content = await contentModel
      .find({ userId: link.userId })
      .sort({ createdAt: -1 })
      .select("-userId -__v");

    // Fetch user info
    const user = await userModel.findOne({ _id: link.userId }).select("username");

    res.json({
      success: true,
      username: user?.username,
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
app.get("/api/v1/content/categories", auth, async (req, res) => {
  try {
    const categories = await contentModel.aggregate([
      {
        //@ts-ignore
        $match: { userId: req.userId },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      success: true,
      categories: categories.map((cat) => ({
        category: cat._id,
        count: cat.count,
      })),
    });
  } catch (e: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: e.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API: http://localhost:${PORT}/api/v1`);
  console.log(`💓 Health: http://localhost:${PORT}/health`);
});
