import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";

import Group from "../models/group.js";
import Expense from "../models/expense.js";
import Settlement from "../models/settlement.js";
import { s3 } from "../config/s3.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import mongoose from "mongoose";

const createGroup = async (req, res, next) => {
  try {
    const creator_id = req.user.id;

    const { name, description } = req.body;

    const generateInviteToken = (groupName) => {
      const slug = groupName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const randomString = crypto.randomBytes(16).toString("hex");
      return `${slug}_${randomString}`;
    };

    const inviteToken = generateInviteToken(name);
    const INVITE_EXPIRY_HOURS = 24;

    const duration = INVITE_EXPIRY_HOURS * 60 * 60 * 1000;
    const inviteTokenExpiresAt = new Date(Date.now() + duration);

    const members = [
      {
        user: creator_id,
        joinedAt: Date.now(),
      },
    ];

    const group = await Group.create({
      name,
      description,
      createdBy: creator_id,
      members,
      inviteToken: inviteToken,
      inviteTokenExpiresAt,
    });

    const inviteLink = `${process.env.CLIENT_URL}/join/${group.inviteToken}`;

    return res.status(201).json({
      message: "Group Created Successfully.",
      groupId: group._id,
      inviteLink,
      inviteTokenExpiresAt: group.inviteTokenExpiresAt,
    });
  } catch (error) {
    next(error);
  }
};

const joinGroup = async (req, res, next) => {
  try {
    const { inviteToken } = req.body;
    const user_id = req.user.id;

    const group = await Group.findOne({ inviteToken });
    if (!group) {
      const error = new Error("Group does not exist.");
      error.statusCode = 404;
      throw error;
    }

    if (
      !group.inviteTokenExpiresAt ||
      Date.now() > group.inviteTokenExpiresAt
    ) {
      const error = new Error(
        "Invite Token is expired. Ask admin to generate new token.",
      );
      error.statusCode = 403;
      throw error;
    }

    const alreadyMember = group.members.some(
      (member) => member.user.toString() === user_id.toString(),
    );

    if (alreadyMember) {
      return res.status(200).json({
        message: "User already a member of the group.",
        groupId: group._id,
      });
    }

    group.members.push({
      user: user_id,
      joinedAt: Date.now(),
    });

    await group.save();

    const io = req.app.get("io");
    io.to(group_id.toString()).emit("member-joined", {
      userId: user_id.toString(),
    });

    return res
      .status(200)
      .json({ message: "User added Successfully.", groupId: group._id });
  } catch (error) {
    next(error);
  }
};

const generateNewToken = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const group_id = req.params.groupId;

    const group = await Group.findById(group_id);

    if (!group) {
      const error = new Error("Group does not exist.");
      error.statusCode = 404;
      throw error;
    }

    if (user_id.toString() !== group.createdBy.toString()) {
      const error = new Error(
        "Only group creator can re-generate invite token.",
      );
      error.statusCode = 403;
      throw error;
    }

    const generateInviteToken = (groupName) => {
      const slug = groupName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const randomString = crypto.randomBytes(16).toString("hex");
      return `${slug}_${randomString}`;
    };

    const inviteToken = generateInviteToken(group.name);

    const INVITE_EXPIRY_HOURS = 24;
    const duration = INVITE_EXPIRY_HOURS * 60 * 60 * 1000;
    const inviteTokenExpiresAt = new Date(Date.now() + duration);

    group.inviteToken = inviteToken;
    group.inviteTokenExpiresAt = inviteTokenExpiresAt;

    await group.save();

    const inviteLink = `${process.env.CLIENT_URL}/join/${group.inviteToken}`;

    return res.status(200).json({
      message: "Invite token regenerated successfully.",
      inviteLink,
      inviteTokenExpiresAt: group.inviteTokenExpiresAt,
    });
  } catch (error) {
    next(error);
  }
};

const getGroups = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const groups = await Group.find({ "members.user": user_id }).select(
      "name description members",
    );

    const formattedGroupData = groups.map((group) => ({
      groupId: group._id,
      name: group.name,
      description: group.description,
      memberCount: group.members.length,
    }));

    return res.status(200).json({
      groups: formattedGroupData,
    });
  } catch (error) {
    next(error);
  }
};

const getGroupSummary = async (req, res, next) => {
  try {
    const group_id = req.params.groupId;
    const user_id = req.user.id;

    const group = await Group.findById(group_id).populate(
      "members.user",
      "name email image imageKey",
    );
    if (!group) {
      const error = new Error("Group not found.");
      error.statusCode = 404;
      throw error;
    }

    const isMember = group.members.some(
      (m) => m.user && m.user._id.toString() === user_id,
    );

    if (!isMember) {
      const error = new Error("Not Authorized");
      error.statusCode = 403;
      throw error;
    }

    const rawMembers = group.members.filter((m) => m.user);

    const members = await Promise.all(
      rawMembers.map(async (m) => {
        let image = m.user.image || null;
        if (m.user.imageKey) {
          const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: m.user.imageKey,
          });
          image = await getSignedUrl(s3, command, { expiresIn: 3600 });
        }
        return {
          _id: m.user._id,
          name: m.user.name,
          email: m.user.email,
          image,
        };
      }),
    );

    const expenses = await Expense.find({ group: group_id });

    const settledSettlements = await Settlement.find({
      group: group_id,
      isSettled: true,
    });

    let balance = {};

    members.forEach((m) => {
      balance[m._id.toString()] = 0;
    });

    expenses.forEach((expense) => {
      const payerId = expense.paidBy.toString();
      balance[payerId] += expense.totalAmount;

      expense.splits.forEach((split) => {
        const splitUserId = split.user.toString();
        balance[splitUserId] -= split.amount;
      });
    });
    settledSettlements.forEach((s) => {
      const from = s.from.toString();
      const to = s.to.toString();

      if (balance[from] !== undefined) {
        balance[from] += s.amount;
      }

      if (balance[to] !== undefined) {
        balance[to] -= s.amount;
      }
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.totalAmount, 0);

    const yourBalance = Number((balance[user_id] || 0).toFixed(2));

    const memberMap = {};
    members.forEach((m) => {
      memberMap[m._id.toString()] = m;
    });

    let creditors = [];
    let debtors = [];

    for (const [userId, amount] of Object.entries(balance)) {
      const rounded = Number(amount.toFixed(2));
      if (rounded > 0) {
        creditors.push({ user: userId, amount: rounded });
      } else if (rounded < 0) {
        debtors.push({ user: userId, owed: Math.abs(rounded) });
      }
    }

    let youOwe = [];
    let youGet = [];

    let i = 0,
      j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const payAmount = Number(
        Math.min(debtor.owed, creditor.amount).toFixed(2),
      );

      if (debtor.user === user_id && payAmount > 0) {
        youOwe.push({
          to: memberMap[creditor.user] || {
            _id: creditor.user,
            name: "Unknown",
          },
          amount: payAmount,
        });
      }
      if (creditor.user === user_id && payAmount > 0) {
        youGet.push({
          from: memberMap[debtor.user] || { _id: debtor.user, name: "Unknown" },
          amount: payAmount,
        });
      }

      debtor.owed = Number((debtor.owed - payAmount).toFixed(2));
      creditor.amount = Number((creditor.amount - payAmount).toFixed(2));

      if (debtor.owed === 0) i++;
      if (creditor.amount === 0) j++;
    }

    const isSettled =
      yourBalance === 0 && creditors.length === 0 && debtors.length === 0;

    return res.status(200).json({
      message: "Group Summary fetched successfully.",
      group: {
        id: group_id,
        name: group.name,
        description: group.description,
      },
      members,
      totalExpenses,
      expenseCount: expenses.length,
      isSettled,
      yourBalance,
      youOwe,
      youGet,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteGroup = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const group_id = req.params.groupId;

    const group = await Group.findById(group_id);

    if (!group) {
      const error = new Error("Group does not exist or already deleted.");
      error.statusCode = 404;
      throw error;
    }

    if (user_id !== group.createdBy.toString()) {
      const error = new Error("Only group admin can delete the group.");
      error.statusCode = 403;
      throw error;
    }

    await Expense.deleteMany({ group: group_id });
    await Settlement.deleteMany({ group: group_id });

    await Group.findByIdAndDelete(group_id);

    return res.status(200).json({ message: "Group deleted successfully." });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const group_id = req.params.groupId;
    const member_id = req.params.memberId;

    const group = await Group.findById(group_id);
    if (!group) {
      const error = new Error("Group not found.");
      error.statusCode = 404;
      throw error;
    }

    if (group.members.length === 1) {
      const error = new Error("Can not remove the last member.");
      error.statusCode = 403;
      throw error;
    }

    const isRequesterMember = group.createdBy.toString() === user_id.toString();

    if (!isRequesterMember) {
      const error = new Error("Only creator can remove the members.");
      error.statusCode = 403;
      throw error;
    }

    const isTargetMember = group.members.some(
      (m) => m.user.toString() === member_id.toString(),
    );

    if (!isTargetMember) {
      const error = new Error("Member not found in this group.");
      error.statusCode = 404;
      throw error;
    }

    const hasPendingSettlement = await Settlement.findOne({
      group: group_id,
      isSettled: false,
      $or: [{ from: member_id }, { to: member_id }],
    });

    if (hasPendingSettlement) {
      const error = new Error(
        "Member has active settlements. Settle them first.",
      );
      error.statusCode = 403;
      throw error;
    }

    const expenses = await Expense.find({ group: group_id });

    let balance = {};

    group.members.forEach((m) => {
      balance[m.user.toString()] = 0;
    });

    expenses.forEach((expense) => {
      const payerId = expense.paidBy.toString();
      balance[payerId] += expense.totalAmount;

      expense.splits.forEach((split) => {
        const splitUserId = split.user.toString();
        balance[splitUserId] -= split.amount;
      });
    });

    const completedSettlements = await Settlement.find({
      group: group_id,
      isSettled: true,
    });

    completedSettlements.forEach((s) => {
      const from = s.from.toString();
      const to = s.to.toString();
      balance[from] += s.amount;
      balance[to] -= s.amount;
    });

    if (balance[member_id.toString()] !== 0) {
      const error = new Error(
        "Member has non-zero balance. Clear all dues before removal.",
      );
      error.statusCode = 403;
      throw error;
    }

    group.members = group.members.filter(
      (m) => m.user.toString() !== member_id.toString(),
    );

    await group.save();

    const io = req.app.get("io");
    io.to(group_id.toString()).emit("member-removed", {
      memberId: isTargetMember.toString(),
    });

    return res.status(200).json({
      message: "Member removed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const groupAnalytics = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const group_id = req.params.groupId;

    const group = await Group.findById(group_id);
    if (!group) {
      const error = new Error("Group not found.");
      error.statusCode = 404;
      throw error;
    }

    const isMember = group.members.some(
      (m) => m.user._id.toString() === user_id,
    );

    if (!isMember) {
      const error = new Error("Not Authorized");
      error.statusCode = 403;
      throw error;
    }

    const objectGroupId = new mongoose.Types.ObjectId(group_id);

    const overviewAgg = await Expense.aggregate([
      { $match: { group: objectGroupId } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$totalAmount" },
          expenseCount: { $sum: 1 },
          avgExpense: { $avg: "$totalAmount" },
          maxExpense: { $max: "$totalAmount" },
        },
      },
    ]);

    const overview = overviewAgg[0] || {
      totalSpent: 0,
      expenseCount: 0,
      avgExpense: 0,
      maxExpense: 0,
    };

    const memberContribution = await Expense.aggregate([
      { $match: { group: objectGroupId } },
      {
        $group: {
          _id: "$paidBy",
          totalPaid: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          totalPaid: 1,
          count: 1,
        },
      },
      { $sort: { totalPaid: -1 } },
    ]);

    const categoryBreakdown = await Expense.aggregate([
      { $match: { group: objectGroupId } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: { $ifNull: ["$_id", "other"] },
          total: { $round: ["$total", 2] },
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    const dailyTrend = await Expense.aggregate([
      { $match: { group: objectGroupId } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%b %d",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day",
                },
              },
            },
          },
          total: { $round: ["$total", 2] },
          count: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Group analytics fetched successfully.",
      group: {
        id: group._id,
        name: group.name,
      },
      overview: {
        totalSpent: Number((overview.totalSpent || 0).toFixed(2)),
        expenseCount: overview.expenseCount || 0,
        avgExpense: Number((overview.avgExpense || 0).toFixed(2)),
        maxExpense: Number((overview.maxExpense || 0).toFixed(2)),
      },
      memberContribution,
      categoryBreakdown,
      dailyTrend,
    });
  } catch (error) {
    console.log("Error in group analytics: ", error);
    next(error);
  }
};

export default {
  createGroup,
  joinGroup,
  generateNewToken,
  getGroups,
  getGroupSummary,
  deleteGroup,
  removeMember,
  groupAnalytics,
};
