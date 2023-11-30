import express from "express";
import dotenv from "dotenv";
import chalk from "chalk";
import mongoose from "mongoose";
import userRoute from "./src/routes/userRouter.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import postRoute from "./src/routes/postRouter.js";
import detectPort from "detect-port";
import bodyParser from "body-parser";

dotenv.config();

const app = express();

const MONGO_URI = `mongodb+srv://e759ksh:${process.env.MONGO_PASSWORD}@cluster0.x86fylx.mongodb.net/?retryWrites=true&w=majority`;

const server = async () => {
  try {
    try {
      await mongoose.connect(MONGO_URI);
    } catch (error) {
      console.log(chalk.bgRedBright("Failed to connect to MongoDB"));
    }
    mongoose.set("debug", true);
    console.log(chalk.bgRedBright("Connected to MongoDB"));

    app.use(
      cors({
        origin: true,
        credentials: true,
      })
    );
    app.use(cookieParser("secret"));
    app.use(bodyParser.json());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    function checkAdminRedirect(req, res, next) {
      const jwt = req.cookies.jwt;
      if (!jwt) {
        history.push("/login");
      }
      next();
    }

    app.use("/user", userRoute);
    app.use("/post", postRoute);
    app.use("/admin", checkAdminRedirect);

    app.set("port", process.env.PORT || 3000);

    app.listen(app.get("port"), async () => {
      console.log(
        chalk.bgGreen(`Server is running on port ${app.get("port")}`)
      );
    });
  } catch (error) {
    console.log(error);
  }
};

server();
