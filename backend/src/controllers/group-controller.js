import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";

import Group from "../models/group.js";
import Expense from "../models/expense.js";
import Settlement from "../models/settlement.js";

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
      "name email image",
    );
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

    const members = group.members.map((m) => ({
      _id: m.user._id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
    }));

    const expenses = await Expense.find({ group: group_id });

    const settledSettlements = await Settlement.find({
      group: group_id,
      isSettled: true,
    });

    const unsettledSettlements = await Settlement.find({
      group: group_id,
      isSettled: false,
    }).populate("from to", "name email");

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

    let youOwe = [];
    let youGet = [];

    unsettledSettlements.forEach((s) => {
      if (s.from._id.toString() === user_id) {
        youOwe.push({
          to: s.to,
          amount: s.amount,
        });
      }

      if (s.to._id.toString() === user_id) {
        youGet.push({
          from: s.from,
          amount: s.amount,
        });
      }
    });

    const isSettled = unsettledSettlements.length === 0;

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

    return res.status(200).json({
      message: "Member removed successfully.",
    });
  } catch (error) {
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
};
