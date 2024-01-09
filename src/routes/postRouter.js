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
        slug: req.params.id,
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

// pagenaition 구현
postRoute.get("/page", async (req, res) => {
  const perPage = req.query.perPage;
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((req.query.page - 1) * perPage)
      .limit(perPage);
    return res.status(200).json({
      status: "success",
      data: posts,
      totalPage: Math.ceil((await Post.countDocuments()) / perPage),
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

postRoute.get("/newest", async (req, res) => {
  try {
    const post = await Post.find().sort({ createdAt: -1 });
    return res.status(200).json({
      status: "success",
      data: post[0],
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

// 페이지네이션
postRoute.get("/featured", async (req, res) => {
  const perPage = req.query.perPage;
  try {
    const posts = await Post.find({ featured: true })
      .sort({ createdAt: -1 })
      .skip((req.query.page - 1) * perPage)
      .limit(perPage);
    return res.status(200).json({
      status: "success",
      data: posts,
      totalPage: Math.ceil(
        (await Post.countDocuments({ featured: true })) / perPage
      ),
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

postRoute.get("/tag", async (req, res) => {
  try {
    const posts = await Post.find();
    const tagList = [];
    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        if (!tagList.includes(tag)) {
          tagList.push(tag);
        }
      });
    });
    return res.status(201).json({
      status: "success",
      data: tagList,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

postRoute.get("/:id", async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.id });
    return res.status(200).json({
      status: "success",
      data: post,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

postRoute.get("/tag/:tag", async (req, res) => {
  try {
    const posts = await Post.find({ tags: req.params.tag }).sort({
      createdAt: -1,
    });
    return res.status(200).json({
      status: "success",
      data: posts,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

postRoute.get("/search/:search", async (req, res) => {
  try {
    const posts = await Post.find({
      $or: [
        { title: { $regex: req.params.search, $options: "i" } },
        { tags: { $regex: req.params.search, $options: "i" } },
      ],
    });
    return res.status(200).json({
      status: "success",
      data: posts,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

export default postRoute;
