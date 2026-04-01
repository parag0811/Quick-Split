import dotenv from "dotenv";
dotenv.config();
import Settlement from "../models/settlement.js";
import updateGroupActivity from "../helper/group-activity.js";
import { s3 } from "../config/s3.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const createSettlement = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const group = req.group;
    const group_id = group._id;

    const { from, to, amount, method, notes } = req.body;

    if (!from || !to || !amount) {
      const error = new Error("Payer, Receiver and amount are required.");
      error.statusCode = 400;
      throw error;
    }

    if (from === to) {
      const error = new Error("Sender and receiver cannot be the same.");
      error.statusCode = 400;
      throw error;
    }

    const amountNumber = Number(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      const error = new Error("Amount must be a positive number.");
      error.statusCode = 400;
      throw error;
    }

    const isFromValid = group.members.some(
      (m) => m.user.toString() === from.toString(),
    );

    const isToValid = group.members.some(
      (m) => m.user.toString() === to.toString(),
    );

    if (!isFromValid || !isToValid) {
      const error = new Error("Both users must be members of the group.");
      error.statusCode = 400;
      throw error;
    }

    const settlement = await Settlement.create({
      group: group_id,
      from,
      to,
      amount: amountNumber,
      paidAt: new Date(),
      currency: group.currency,
      createdBy: user_id,
      method,
      notes,
    });

    await updateGroupActivity(group_id);

    const io = req.app.get("io");
    if (io) {
      io.to(group_id.toString()).emit("settlement-added", {
        settlement,
      });
    }

    return res.status(201).json({
      message: "Settlement recorded successfully.",
      settlement,
    });
  } catch (error) {
    next(error);
  }
};

const getAllSettlement = async (req, res, next) => {
  try {
    const group = req.group;
    const group_id = group._id;

    const settlements = await Settlement.find({
      group: group_id,
      isDeleted: false,
    })
      .populate("from", "name email image imageKey")
      .populate("to", "name email image imageKey")
      .populate("createdBy", "name email")
      .sort({ paidAt: -1 });

    const formattedSettlements = await Promise.all(
      settlements.map(async (s) => {
        let fromImage = s.from.image || null;
        let toImage = s.to.image || null;

        if (s.from.imageKey) {
          const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s.from.imageKey,
          });
          fromImage = await getSignedUrl(s3, command, { expiresIn: 3600 });
        }

        if (s.to.imageKey) {
          const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s.to.imageKey,
          });
          toImage = await getSignedUrl(s3, command, { expiresIn: 3600 });
        }

        return {
          _id: s._id,
          amount: s.amount,
          paidAt: s.paidAt,
          method: s.method,
          currency : s.currency,
          notes: s.notes,
          from: {
            _id: s.from._id,
            name: s.from.name,
            email: s.from.email,
            image: fromImage,
          },
          to: {
            _id: s.to._id,
            name: s.to.name,
            email: s.to.email,
            image: toImage,
          },
          createdBy: s.createdBy,
        };
      }),
    );

    return res.status(200).json({
      message: "Settlements fetched successfully.",
      count: formattedSettlements.length,
      settlements: formattedSettlements,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createSettlement,
  getAllSettlement,
};
