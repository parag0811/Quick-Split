import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

import User from "../models/user.js";

const authUser = async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const image = req.body.image;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        image,
      });
    }

    if (!process.env.JWT_SECRET) {
      const error = new Error("JWT secret not configured");
      error.statusCode = 500;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
    });

    return res.status(200).json({
      message: "Login Successfull",
    });
  } catch (error) {
    next(error);
  }
};

const authLogout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? "None" : "Lax",
      sameSite: "None",
      path: "/",
    });

    return res.status(200).json({ message: "Successfully Logged Out" });
  } catch (error) {
    next(error);
  }
};

export default {
  authUser,
  authLogout,
};
