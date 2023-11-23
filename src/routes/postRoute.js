import { Router } from "express";
import { Post } from "../Model/Post.js";
import { isLoggedIn } from "./userRoute.js";

const postRoute = Router();

postRoute.post("/", isLoggedIn, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).send({ error: "제목과 내용을 입력해주세요." });
    }
    if (typeof title !== "string" || typeof content !== "string") {
      return res
        .status(400)
        .send({ error: "제목과 내용은 문자열이어야 합니다." });
    }
    const post = new Post(req.body);

    await post.save();
    return res.status(201).json({
      status: "success",
      data: post,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

postRoute.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    return res.status(200).json({
      status: "success",
      data: posts,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

export default postRoute;
