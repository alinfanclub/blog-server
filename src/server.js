import express from "express";
import { config } from "dotenv";
import chalk from "chalk";
import mongoose from "mongoose";
import userRoute from "./routes/UserRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import postRoute from "./routes/postRoute.js";

config();

const app = express();

const MONGO_URI = `mongodb+srv://e759ksh:${process.env.MONGO_PASSWORD}@cluster0.x86fylx.mongodb.net/?retryWrites=true&w=majority`;
const server = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    mongoose.set("debug", true);
    console.log(chalk.bgRedBright("Connected to MongoDB"));

    app.use(
      cors({
        origin: true,
        credentials: true,
      })
    );
    app.use(cookieParser("secret"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use("/user", userRoute);
    app.use("/post", postRoute);

    app.listen(8000, async () => {
      console.log(chalk.bgGreen("Server is running on port 8000"));
    });
  } catch (error) {}
};

server();
