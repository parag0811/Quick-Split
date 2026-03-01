import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

import User from "../models/user.js";
import Group from "../models/group.js";
import Expense from "../models/expense.js";
import Settlement from "../models/settlement.js";

import { s3 } from "../config/s3.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

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

    return res.status(200).json({
      message: "Login Successfull",
      token,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const user = await User.findById(user_id).select(
      "name email image imageKey",
    );
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    let profileImage = user.image || null;
    if (user.imageKey) {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: user.imageKey,
      });
      profileImage = await getSignedUrl(s3, command, { expiresIn: 3600 });
    }

    const groups = await Group.find({ "members.user": user_id }).select("_id");

    const expenses = await Expense.find({
      $or: [{ paidBy: user_id }, { "splits.user": user_id }],
    });

    let youPaidFor = 0; 
    let totalSpent = 0; 

    expenses.forEach((exp) => {
      if (exp.paidBy.toString() === user_id) {
        youPaidFor += exp.totalAmount;
      }

      exp.splits.forEach((split) => {
        if (split.user.toString() === user_id) {
          totalSpent += split.amount;
        }
      });
    });

    const settlements = await Settlement.find({
      $or: [{ from: user_id }, { to: user_id }],
      isSettled: true,
    });

    let settledReceived = 0; 
    let settledPaid = 0;     

    settlements.forEach((s) => {
      if (s.to.toString() === user_id) {
        settledReceived += s.amount;
      }
      if (s.from.toString() === user_id) {
        settledPaid += s.amount;
      }
    });

    const totalSettled = Number((settledPaid + settledReceived).toFixed(2));

    const outstandingBalance = Number(
      ((youPaidFor - totalSpent) - settledReceived + settledPaid).toFixed(2)
    );

    return res.status(200).json({
      message: "User profile fetched successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: profileImage,
      },
      stats: {
        totalGroups: groups.length,
        totalSpent: Number(totalSpent.toFixed(2)),
        youPaidFor: Number(youPaidFor.toFixed(2)),
        totalSettled,
        outstandingBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { name } = req.body;

    const user = await User.findById(user_id);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (req.file) {
      console.log("File received:", req.file.originalname, req.file.size, "bytes");
      const newKey = `profile-images/${user_id}_${Date.now()}`;

      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: newKey,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
          }),
        );
      } catch (s3Error) {
        throw new Error(`S3 upload failed: ${s3Error.message}`);
      }

      if (user.imageKey) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: user.imageKey,
            }),
          );
        } catch (deleteError) {
          console.warn("Failed to delete old image:", deleteError);
        }
      }
      user.imageKey = newKey;
    } else {
      console.log("No file received in request");
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

    const user = await User.findById(user_id).select("name email image imageKey");
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    let profileImage = user.image || null;
    if (user.imageKey) {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: user.imageKey,
      });
      profileImage = await getSignedUrl(s3, command, { expiresIn: 3600 });
    }

    // Get all groups user is in
    const userGroups = await Group.find({ "members.user": user_id }).select("_id members");

    let totalSpent = 0;
    let youOwe = 0;
    let youAreOwed = 0;

    for (const group of userGroups) {
      const groupId = group._id.toString();
      const memberIds = group.members.map((m) => m.user.toString());

      const balance = {};
      memberIds.forEach((id) => { balance[id] = 0; });

      const groupExpenses = await Expense.find({ group: groupId });

      groupExpenses.forEach((exp) => {
        const payerId = exp.paidBy.toString();
        if (balance[payerId] !== undefined) balance[payerId] += exp.totalAmount;

        exp.splits.forEach((split) => {
          const splitUserId = split.user.toString();
          if (balance[splitUserId] !== undefined) balance[splitUserId] -= split.amount;

          if (splitUserId === user_id) {
            totalSpent += split.amount;
          }
        });
      });

      const settledInGroup = await Settlement.find({
        group: groupId,
        isSettled: true,
      });

      settledInGroup.forEach((s) => {
        const from = s.from.toString();
        const to = s.to.toString();
        if (balance[from] !== undefined) balance[from] += s.amount;
        if (balance[to] !== undefined) balance[to] -= s.amount;
      });

      // Current user's balance in this group
      const myBalance = balance[user_id] || 0;
      if (myBalance > 0) {
        youAreOwed += myBalance; // others owe me
      } else if (myBalance < 0) {
        youOwe += Math.abs(myBalance); // I owe others
      }
    }

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
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: profileImage,
      },
      stats: {
        totalGroups: userGroups.length,
        totalSpent: Number(totalSpent.toFixed(2)),
        youOwe: Number(youOwe.toFixed(2)),
        youAreOwed: Number(youAreOwed.toFixed(2)),
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
