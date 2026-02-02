import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";

import Group from "../models/group.js";
import Expense from "../models/expense.js";
import Settlement from "../models/settlement.js";

const createGroup = async (req, res, next) => {
  try {
    const creator_id = req.user.id;

    const { name, description, isPrivate } = req.body;

    const generateInviteToken = (groupName) => {
      const slug = groupName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const randomString = crypto.randomBytes(16).toString("hex");
      return `${slug}_${randomString}`;
    };

    const inviteToken = generateInviteToken(name);

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
      isPrivate,
    });

    return res.status(201).json({
      message: "Group Created Successfully.",
      groupId: group._id,
      inviteToken: group.inviteToken,
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
      error.statusCode = 410;
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

    return res.status(200).json({ message: "User added Successfully." });
  } catch (error) {
    next(error);
  }
};

const getGroups = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const groups = await Group.find({ "members.user": user_id }).select(
      "name description isPrivate members",
    );

    const formattedGroupData = groups.map((group) => ({
      groupId: group._id,
      name: group.name,
      description: group.description,
      isPrivate: group.isPrivate,
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

    const group = await Group.findById(group_id);
    if (!group) {
      const error = new Error("Group not found.");
      error.statusCode = 404;
      throw error;
    }

    const isMember = group.members.some((m) => m.user.toString() === user_id);

    if (!isMember) {
      const error = new Error("Not Authorized");
      error.statusCode = 403;
      throw error;
    }

    const expenses = await Expense.find({ group: group_id });

    const settlements = await Settlement.find({
      group: group_id,
      isSettled: false,
    }).populate("from to", "name email");

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

    const yourBalance = Number(balance[user_id].toFixed(2));

    let youOwe = [];
    let youGet = [];

    settlements.forEach((s) => {
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

    return res.status(200).json({
      message: "Group Summary fetched successfully.",
      group: {
        id: group_id,
        name: group.name,
        description: group.description,
      },
      yourBalance,
      youOwe,
      youGet,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createGroup,
  joinGroup,
  getGroups,
  getGroupSummary,
};
