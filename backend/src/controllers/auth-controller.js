import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

import cloudinary from "../../config/cloudinary.js";
import User from "../models/user.js";
import Group from "../models/group.js";
import Expense from "../models/expense.js";
import Settlement from "../models/settlement.js";

const authUser = async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const image = req.body.image;
    const googleId = req.body.googleId;

    if (!email || !googleId) {
      const error = new Error("Invalid oAuth Data");
      error.statusCode = 400;
      throw error;
    }

    let user = await User.findOne({ email });
    if (!user) {
      let uploadedImageUrl = image;

      if (image) {
        const upload = await cloudinary.uploader.upload(image, {
          folder: "quicksplit/profile",
        });
        uploadedImageUrl = upload.secure_url;
      }
      user = await User.create({
        name,
        email,
        image: uploadedImageUrl,
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

    return res.status(200).json({
      message: "Login Successfull",
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const user = await User.findById(user_id).select("name email image");
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    const groups = await Group.find({ "members.user": user_id }).select("_id");

    const expenses = await Expense.find({
      $or: [{ paidBy: user_id }, { "splits.user": user_id }],
    });

    let totalPaid = 0;
    let totalOwed = 0;

    expenses.forEach((exp) => {
      if (exp.paidBy.toString() === user_id) {
        totalPaid += exp.totalAmount;
      }

      exp.splits.forEach((split) => {
        if (split.user.toString() === user_id) {
          totalOwed += split.amount;
        }
      });
    });

    const netBalance = Number((totalPaid - totalOwed).toFixed(2));

    return res.status(200).json({
      message: "User profile fetched successfully.",
      user,
      stats: {
        totalGroups: groups.length,
        totalPaid: Number(totalPaid.toFixed(2)),
        totalOwed: Number(totalOwed.toFixed(2)),
        netBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { name, image } = req.body;

    const user = await User.findById(user_id);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (image) {
      const uploaded = await cloudinary.uploader.upload(image, {
        folder: "quicksplit/profile",
      });

      user.image = uploaded.secure_url;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserSummary = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const user = await User.findById(user_id).select("name email image");
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    const totalGroups = await Group.countDocuments({
      "members.user": user_id,
    });

    const expenses = await Expense.find({
      $or: [{ paidBy: user_id }, { "splits.user": user_id }],
    });

    let totalPaid = 0;
    let totalOwed = 0;

    expenses.forEach((exp) => {
      if (exp.paidBy.toString() === user_id) {
        totalPaid += exp.totalAmount;
      }

      exp.splits.forEach((split) => {
        if (split.user.toString() === user_id) {
          totalOwed += split.amount;
        }
      });
    });

    const netBalance = Number((totalPaid - totalOwed).toFixed(2));

    const recentSettlements = await Settlement.find({
      $or: [{ from: user_id }, { to: user_id }],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("from to", "name");

    const formattedSettlements = recentSettlements.map((s) => ({
      id: s._id,
      amount: s.amount,
      isSettled: s.isSettled,
      direction:
        s.from._id.toString() === user_id ? "you_paid" : "you_received",
      from: s.from.name,
      to: s.to.name,
      createdAt: s.createdAt,
    }));

    return res.status(200).json({
      message: "User summary fetched successfully.",
      user,
      stats: {
        totalGroups,
        totalPaid: Number(totalPaid.toFixed(2)),
        totalOwed: Number(totalOwed.toFixed(2)),
        netBalance,
      },
      recentSettlements: formattedSettlements,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  authUser,
  getMyProfile,
  updateMyProfile,
  getUserSummary,
};
