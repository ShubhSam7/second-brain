import mongoose, { model, Schema } from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
mongoose.connect(
  "mongodb+srv://shubhsamaiya7:shubh7777@cluster0.m2yueto.mongodb.net/second-brain"
);

const contentTypes = ["image", "video", "article", "audio", "other"];

const userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const contentSchema = new Schema({
  link: { type: String, required: true },
  type: { enum: contentTypes, type: String, required: true },
  title: { type: String, required: true },
  tags: [{ type: ObjectId, ref: "Tag" }],
  userId: { type: ObjectId, ref: "User", required: true },
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