import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";

import Group from "../models/group.js";

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
  } catch (error) {}
};

const joinGroup = async (req, res, next) => {
  try {
    const { inviteToken } = req.body;
    const user_id = req.user.id;

    const group = await Group.findOne({ inviteToken });
    if (!group) {
      return res
        .status(410)
        .json({ message: "No group exists or Invalid Token." });
    }

    const alreadyMember = group.members.some(
      (member) => member.user.toString() === user_id.toString()
    );

    if (alreadyMember) {
      return res.status(200).json({
        message: " User already a member of the group.",
        groupId: group._id,
      });
    }

    group.members.push({
      user: user_id,
      joinedAt: Date.now(),
    });

    await group.save();

    return res.status(200).json({ message: "User added Successfully." });
  } catch (error) {}
};

const getGroups = async (req, res, next) => {
  try {
    const user_id = req.body.id;

    const groups = await Group.find({ "members.user": user_id }).select(
      "name description isPrivate members"
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
  } catch (error) {}
};

export default {
  createGroup,
  joinGroup,
  getGroups
};
