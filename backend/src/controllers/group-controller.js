import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";

import Group from "../models/group.js";
import Expense from "../models/expense.js";
import Settlement from "../models/settlement.js";
import updateGroupActivity from "../helper/group-activity.js";
import { s3 } from "../config/s3.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { generateAIInsights } from "../features/ai/ai-insights-service.js";

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

    const group = await Group.findOne({ inviteToken, isDeleted: false });
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
        "Invite link is expired. Ask admin to generate new link.",
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

    await updateGroupActivity(group._id);

    await group.save();

    const io = req.app.get("io");
    io.to(group._id.toString()).emit("member-joined", {
      userId: user_id.toString(),
    });

    return res
      .status(200)
      .json({ message: "User added Successfully.", groupId: group._id });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const generateNewToken = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const group = req.group;
    const group_id = group._id;

    const fullGroup = await Group.findById(group_id);

    if (user_id.toString() !== fullGroup.createdBy.toString()) {
      const error = new Error(
        "Only group creator can re-generate invite token.",
      );
      error.statusCode = 403;
      throw error;
    }

    if (
      fullGroup.inviteTokenExpiresAt &&
      Date.now() < fullGroup.inviteTokenExpiresAt
    ) {
      const error = new Error(
        "Current invite link is still active. You can regenerate after it expires.",
      );
      error.statusCode = 429;
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

    const inviteToken = generateInviteToken(fullGroup.name);

    const INVITE_EXPIRY_HOURS = 24;
    const duration = INVITE_EXPIRY_HOURS * 60 * 60 * 1000;
    const inviteTokenExpiresAt = new Date(Date.now() + duration);

    fullGroup.inviteToken = inviteToken;
    fullGroup.inviteTokenExpiresAt = inviteTokenExpiresAt;

    await updateGroupActivity(fullGroup._id);

    await fullGroup.save();

    const inviteLink = `${process.env.CLIENT_URL}/join/${fullGroup.inviteToken}`;

    return res.status(200).json({
      message: "Invite token regenerated successfully.",
      inviteLink,
      inviteTokenExpiresAt: fullGroup.inviteTokenExpiresAt,
    });
  } catch (error) {
    next(error);
  }
};

const getGroups = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const groups = await Group.find({
      "members.user": user_id,
      isDeleted: false,
    })
      .select("name description members createdBy")
      .sort({ lastActivityAt: -1 });

    const formattedGroupData = groups.map((group) => ({
      groupId: group._id,
      name: group.name,
      description: group.description,
      memberCount: group.members.length,
      isOwner: group.createdBy.toString() === user_id.toString(),
      ownerId: group.createdBy,
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
    const group = req.group;
    const group_id = group._id;
    const user_id = req.user.id;

    const fullGroup = await Group.findById(group_id).populate(
      "members.user",
      "name email image imageKey",
    );

    const rawMembers = fullGroup.members.filter((m) => m.user);

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

    const expenses = await Expense.find({ group: group_id, isDeleted: false });

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

    const inviteLink = fullGroup.inviteToken
      ? `${process.env.CLIENT_URL}/join/${fullGroup.inviteToken}`
      : null;

    return res.status(200).json({
      message: "Group Summary fetched successfully.",
      group: {
        id: group_id,
        name: group.name,
        description: group.description,
        createdBy: group.createdBy.toString(),
      },
      members,
      totalExpenses,
      expenseCount: expenses.length,
      isSettled,
      yourBalance,
      inviteLink,
      inviteTokenExpiresAt: fullGroup.inviteTokenExpiresAt,
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

    const group = req.group;

    if (user_id !== group.createdBy.toString()) {
      const error = new Error("Only group admin can delete the group.");
      error.statusCode = 403;
      throw error;
    }

    await Expense.deleteMany({ group: group._id });
    await Settlement.deleteMany({ group: group._id });

    await Group.findByIdAndDelete(group._id);

    return res.status(200).json({ message: "Group deleted successfully." });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const member_id = req.params.memberId;

    const group = req.group;

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

    const expenses = await Expense.find({ group: group._id, isDeleted: false });

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

    await updateGroupActivity(group._id);

    await group.save();

    const io = req.app.get("io");
    io.to(group._id.toString()).emit("member-removed", {
      memberId: member_id.toString(),
    });

    return res.status(200).json({
      message: "Member removed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const groupAnalytics = async (req, res, next) => {
  try {
    const group = req.group;
    const objectGroupId = group._id;

    //  OVERVIEW
    const overviewAgg = await Expense.aggregate([
      { $match: { group: objectGroupId, isDeleted: false } },
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

    // OWED
    const memberStats = await Expense.aggregate([
      { $match: { group: objectGroupId, isDeleted: false } },
      { $unwind: "$splits" },
      {
        $group: {
          _id: "$splits.user",
          totalOwed: { $sum: "$splits.amount" },
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
          totalOwed: { $round: ["$totalOwed", 2] },
        },
      },
    ]);

    // PAID
    const paidAgg = await Expense.aggregate([
      { $match: { group: objectGroupId, isDeleted: false } },
      {
        $group: {
          _id: "$paidBy",
          totalPaid: { $sum: "$totalAmount" },
        },
      },
    ]);

    const paidMap = {};
    paidAgg.forEach((p) => {
      paidMap[p._id.toString()] = p.totalPaid;
    });

    // MERGE
    const finalMemberStats = memberStats.map((m) => {
      const paid = paidMap[m.userId.toString()] || 0;
      const netBalance = paid - m.totalOwed;

      return {
        ...m,
        totalPaid: Number(paid.toFixed(2)),
        netBalance: Number(netBalance.toFixed(2)),
      };
    });

    // CATEGORY
    const categoryBreakdown = await Expense.aggregate([
      { $match: { group: objectGroupId, isDeleted: false } },
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

    // TREND
    const dailyTrend = await Expense.aggregate([
      { $match: { group: objectGroupId, isDeleted: false } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
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
        },
      },
    ]);

    const latestExpense = await Expense.findOne({
      group: objectGroupId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .select("currency")
      .lean();
    const currency = latestExpense?.currency || "INR";

    // AI INPUT
    const aiInput = {
      groupName: group.name,
      totalExpenses: overview.expenseCount,
      totalAmount: overview.totalSpent,
      currency,
      members: finalMemberStats.map((m) => ({
        name: m.name,
        paid: m.totalPaid,
        owed: m.totalOwed,
        net: m.netBalance,
      })),
    };

    // AI CALL
    let aiInsights = "Not enough data for insights";

    if (finalMemberStats.length >= 2 && overview.expenseCount > 0) {
      try {
        aiInsights = await generateAIInsights(aiInput);
      } catch (err) {
        console.log("AI failed, fallback used");
      }
    }

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
      memberStats: finalMemberStats,
      categoryBreakdown,
      dailyTrend,
      aiInsights,
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
