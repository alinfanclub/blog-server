import { Router } from "express";
import { Post } from "../models/postModel.js";
import { isLoggedIn } from "./userRouter.js";

const postRoute = Router();

postRoute.post("/", isLoggedIn, async (req, res) => {
  try {
    const { title, content, description } = req.body;
    if (!title || !content || !description) {
      return res.status(400).send({ error: "제목과 내용을 입력해주세요." });
    }
    if (
      typeof title !== "string" ||
      typeof content !== "string" ||
      typeof description !== "string"
    ) {
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

postRoute.put("/:id", isLoggedIn, async (req, res) => {
  try {
    const { title, content, description } = req.body;
    if (!title || !content || !description) {
      return res.status(400).send({ error: "제목과 내용을 입력해주세요." });
    }
    if (
      typeof title !== "string" ||
      typeof content !== "string" ||
      typeof description !== "string"
    ) {
      return res
        .status(400)
        .send({ error: "제목과 내용은 문자열이어야 합니다." });
    }

    const post = await Post.findOneAndUpdate(
      {
        title: req.params.id,
      },
      req.body,
      {
        new: true,
      }
    );
    return res.status(201).json({
      status: "success",
      data: post,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

postRoute.delete("/:id", isLoggedIn, async (req, res) => {
  try {
    await Post.findOneAndDelete({
      _id: req.params.id,
    });
    return res.status(201).json({
      status: "success",
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

postRoute.get("/featured", async (req, res) => {
  try {
    const posts = await Post.find({ featured: true });
    return res.status(200).json({
      status: "success",
      data: posts,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

postRoute.get("/:id", async (req, res) => {
  try {
    const post = await Post.findOne({ title: req.params.id });
    return res.status(200).json({
      status: "success",
      data: post,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

export default postRoute;
