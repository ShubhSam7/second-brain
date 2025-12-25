"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const utils_1 = require("./utils");
const validation_1 = require("./validation");
const linkCategorizer_1 = require("./linkCategorizer");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Second Brain API is running" });
});
// ============= AUTHENTICATION ENDPOINTS =============
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate input with Zod
        const validatedData = validation_1.signupSchema.parse(req.body);
        const { username, password } = validatedData;
        // Check if user already exists
        const existingUser = yield db_1.userModel.findOne({ username });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: "Username already exists",
            });
            return;
        }
        // Hash password with bcrypt
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create new user
        yield db_1.userModel.create({
            username,
            password: hashedPassword,
        });
        res.status(201).json({
            success: true,
            message: "User created successfully",
        });
    }
    catch (e) {
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
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate input with Zod
        const validatedData = validation_1.signinSchema.parse(req.body);
        const { username, password } = validatedData;
        // Find user
        const user = yield db_1.userModel.findOne({ username });
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
            return;
        }
        // Compare password with bcrypt
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
            return;
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, config_1.JWT_SECRET, { expiresIn: "7d" });
        res.json({
            success: true,
            message: "Signed in successfully",
            token: token,
            username: user.username,
        });
    }
    catch (e) {
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
}));
// ============= CONTENT ENDPOINTS =============
app.post("/api/v1/content", middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate input with Zod
        const validatedData = validation_1.createContentSchema.parse(req.body);
        let { link, title, type, description, thumbnail } = validatedData;
        // Normalize URL
        link = (0, linkCategorizer_1.normalizeUrl)(link);
        // Validate URL
        if (!(0, linkCategorizer_1.isValidUrl)(link)) {
            res.status(400).json({
                success: false,
                message: "Invalid URL format",
            });
            return;
        }
        // Auto-categorize link if type not provided
        const linkInfo = (0, linkCategorizer_1.categorizeLink)(link);
        const finalType = type || linkInfo.type;
        const category = linkInfo.category;
        const domain = linkInfo.domain;
        // Create content
        const content = yield db_1.contentModel.create({
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
    }
    catch (e) {
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
}));
app.get("/api/v1/content", middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Parse query parameters
        const filters = validation_1.contentFilterSchema.parse(req.query);
        const { type, category, limit = 100, offset = 0 } = filters;
        // Build query
        const query = {
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
        const content = yield db_1.contentModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(offset)
            .select("-__v");
        // Get total count for pagination
        const total = yield db_1.contentModel.countDocuments(query);
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
    }
    catch (e) {
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
}));
app.delete("/api/v1/content", middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate input
        const validatedData = validation_1.contentIdSchema.parse(req.body);
        const { contentId } = validatedData;
        // Delete content (only if it belongs to the user)
        const result = yield db_1.contentModel.deleteOne({
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
    }
    catch (e) {
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
}));
// ============= SHARING ENDPOINTS =============
app.post("/api/v1/brain/share", middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = validation_1.shareLinkSchema.parse(req.body);
        const { share } = validatedData;
        if (share) {
            // Check if share link already exists
            const existingLink = yield db_1.linkModel.findOne({
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
            const hash = yield db_1.linkModel.create({
                //@ts-ignore
                userId: req.userId,
                hash: (0, utils_1.random)(10),
            });
            res.json({
                success: true,
                message: "Share link created successfully",
                hash: hash.hash,
            });
        }
        else {
            // Remove share link
            yield db_1.linkModel.deleteOne({
                //@ts-ignore
                userId: req.userId,
            });
            res.json({
                success: true,
                message: "Share link removed successfully",
            });
        }
    }
    catch (e) {
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
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hash = req.params.shareLink;
        // Find link by hash
        const link = yield db_1.linkModel.findOne({ hash });
        if (!link) {
            res.status(404).json({
                success: false,
                message: "Invalid share link",
            });
            return;
        }
        // Fetch user's content
        const content = yield db_1.contentModel
            .find({ userId: link.userId })
            .sort({ createdAt: -1 })
            .select("-userId -__v");
        // Fetch user info
        const user = yield db_1.userModel.findOne({ _id: link.userId }).select("username");
        res.json({
            success: true,
            username: user === null || user === void 0 ? void 0 : user.username,
            content: content,
        });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch shared brain",
            error: e.message,
        });
    }
}));
// ============= UTILITY ENDPOINTS =============
// Get content grouped by category
app.get("/api/v1/content/categories", middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield db_1.contentModel.aggregate([
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
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
            error: e.message,
        });
    }
}));
// Start server
app.listen(config_1.PORT, () => {
    console.log(`🚀 Server running on port ${config_1.PORT}`);
    console.log(`📝 API: http://localhost:${config_1.PORT}/api/v1`);
    console.log(`💓 Health: http://localhost:${config_1.PORT}/health`);
});
