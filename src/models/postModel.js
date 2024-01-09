import mongoose, { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "제목을 입력해주세요."],
    },
    content: {
      type: String,
      required: [true, "내용을 입력해주세요."],
    },
    user: {
      _id: { type: mongoose.Schema.ObjectId, required: true, ref: "user" },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    tags: [String],
    featured: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: [true, "설명을 입력해주세요."],
    },
    thumbnail: String,
    slug: {
      type: String,
      required: [true, "슬러그를 입력해주세요."],
      unique: true,
    },
  },
  { timestamps: true }
);

const Post = model("post", postSchema);

export { Post };
