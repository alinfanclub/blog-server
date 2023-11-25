import { Router } from "express";
import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import { promisify } from "util";

const userRoute = Router();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

export const protect = async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
};

userRoute.get("/auth", async (req, res) => {
  try {
    let token = req.cookies.jwt;
    console.log(req.cookies);
    if (!token) {
      return false;
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    return res.status(200).json({
      status: "success",
      user: currentUser,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

userRoute.post("/signup", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ error: "이메일을 입력해주세요." });
    }

    const user = new User(req.body);

    await user.save();
    return res.status(201).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

userRoute.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email)
      return res.status(400).send({ error: "이메일을 입력해주세요." });

    if (!password)
      return res.status(400).send({ error: "비밀번호를 입력해주세요." });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    const token = signToken(user._id);

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      sameSite: "Lax",
      httpOnly: true,
      secure: true,
      path: "/",
    });

    return res.status(200).json({
      status: "success",
      data: user,
      token: token,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

userRoute.get("/logout", async (req, res) => {
  try {
    res.clearCookie("jwt");
    return res.status(200).json({
      status: "success",
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

export default userRoute;
