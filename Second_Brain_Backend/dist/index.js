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
// Load environment variables first
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./db"));
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const utils_1 = require("./utils");
const validation_1 = require("./validation");
const linkCategorizer_1 = require("./linkCategorizer");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Prisma error handler utility
function handlePrismaError(error, res) {
    var _a, _b;
    if (error.code === 'P2002') {
        // Unique constraint violation
        res.status(409).json({
            success: false,
            message: `${((_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b[0]) || 'Field'} already exists`
        });
    }
    else if (error.code === 'P2025') {
        // Record not found
        res.status(404).json({
            success: false,
            message: 'Resource not found'
        });
    }
    else if (error.code === 'P2003') {
        // Foreign key constraint violation
        res.status(400).json({
            success: false,
            message: 'Invalid reference'
        });
    }
    else {
        res.status(500).json({
            success: false,
            message: 'Database error occurred'
        });
    }
}
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
        const existingUser = yield db_1.default.user.findUnique({
            where: { username }
        });
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
        yield db_1.default.user.create({
            data: {
                username,
                password: hashedPassword,
            }
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
        if (e.code && e.code.startsWith('P')) {
            handlePrismaError(e, res);
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
        const user = yield db_1.default.user.findUnique({
            where: { username }
        });
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
        const token = jsonwebtoken_1.default.sign({ id: user.id }, config_1.JWT_SECRET, { expiresIn: "7d" });
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
        const content = yield db_1.default.content.create({
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
            }
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
        if (e.code && e.code.startsWith('P')) {
            handlePrismaError(e, res);
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
        // Build where clause
        const where = {
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
        const [content, total] = yield Promise.all([
            db_1.default.content.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
            }),
            db_1.default.content.count({ where })
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
        const result = yield db_1.default.content.deleteMany({
            where: {
                id: contentId,
                //@ts-ignore
                userId: req.userId,
            }
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
        if (e.code && e.code.startsWith('P')) {
            handlePrismaError(e, res);
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
            const existingLink = yield db_1.default.link.findUnique({
                where: {
                    //@ts-ignore
                    userId: req.userId,
                }
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
            const hash = (0, utils_1.random)(10);
            const newLink = yield db_1.default.link.create({
                data: {
                    //@ts-ignore
                    userId: req.userId,
                    hash: hash,
                }
            });
            res.json({
                success: true,
                message: "Share link created successfully",
                hash: newLink.hash,
            });
        }
        else {
            // Remove share link
            yield db_1.default.link.deleteMany({
                where: {
                    //@ts-ignore
                    userId: req.userId,
                }
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
        if (e.code && e.code.startsWith('P')) {
            handlePrismaError(e, res);
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
        // Find link by hash with user and content
        const link = yield db_1.default.link.findUnique({
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
        const content = yield db_1.default.content.findMany({
            where: { userId: link.userId },
            orderBy: { createdAt: 'desc' },
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
            }
        });
        res.json({
            success: true,
            username: link.user.username,
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
        const categories = yield db_1.default.content.groupBy({
            by: ['category'],
            where: {
                //@ts-ignore
                userId: req.userId
            },
            _count: {
                category: true,
            },
            orderBy: {
                _count: {
                    category: 'desc',
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
