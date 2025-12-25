import mongoose, { model, Schema } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const ObjectId = mongoose.Types.ObjectId;

// Use environment variable for MongoDB connection
const mongoUrl = process.env.MONGO_URL || "mongodb+srv://shubhsamaiya7:shubh7777@cluster0.m2yueto.mongodb.net/second-brain";
mongoose.connect(mongoUrl);

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

const userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const contentSchema = new Schema({
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

const linkSchema = new Schema({
  hash: { type: String, required: true },
  userId: { type: ObjectId, ref: "User", unique: true, required: true },
});

export const userModel = model("User", userSchema);
export const contentModel = model("Content", contentSchema);
export const linkModel = model("Link", linkSchema);
// export const tagModel = model("Tag", tagSchema);