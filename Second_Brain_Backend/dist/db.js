"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkModel = exports.contentModel = exports.userModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ObjectId = mongoose_1.default.Types.ObjectId;
// Use environment variable for MongoDB connection
const mongoUrl = process.env.MONGO_URL || "mongodb+srv://shubhsamaiya7:shubh7777@cluster0.m2yueto.mongodb.net/second-brain";
mongoose_1.default.connect(mongoUrl);
// Expanded content types for all platforms
const contentTypes = [
    // Social
    "twitter", "instagram", "linkedin", "facebook", "tiktok", "reddit",
    // Video
    "youtube", "vimeo", "twitch", "dailymotion",
    // Code
    "github", "gitlab", "codepen", "codesandbox", "stackoverflow", "replit",
    // Article
    "medium", "dev", "hashnode", "substack", "article",
    // Audio
    "spotify", "soundcloud", "apple-music",
    // Image
    "imgur", "pinterest", "flickr", "image",
    // Document
    "google-docs", "notion", "dropbox", "document",
    // Video/Audio generic
    "video", "audio",
    // Other
    "other"
];
const userSchema = new mongoose_1.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});
const contentSchema = new mongoose_1.Schema({
    link: { type: String, required: true },
    type: { enum: contentTypes, type: String, required: true },
    category: { type: String, required: true }, // social, video, code, article, audio, image, document, other
    domain: { type: String }, // Extracted domain (e.g., "twitter.com")
    title: { type: String, required: true },
    description: { type: String }, // Optional description
    thumbnail: { type: String }, // Optional thumbnail URL
    tags: [{ type: ObjectId, ref: "Tag" }],
    userId: { type: ObjectId, ref: "User", required: true },
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});
// const tagSchema = new Schema({
//   title: { type: String, required: true, unique: true },
// });
const linkSchema = new mongoose_1.Schema({
    hash: { type: String, required: true },
    userId: { type: ObjectId, ref: "User", unique: true, required: true },
});
exports.userModel = (0, mongoose_1.model)("User", userSchema);
exports.contentModel = (0, mongoose_1.model)("Content", contentSchema);
exports.linkModel = (0, mongoose_1.model)("Link", linkSchema);
// export const tagModel = model("Tag", tagSchema);
