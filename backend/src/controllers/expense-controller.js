import dotenv from "dotenv";
dotenv.config();

import Group from "../models/group.js";
import Expense from "../models/expense.js";

const addExpense = async (req, res, next) => {
  const user_id = req.user.id;
  const group_id = req.params.id;

  const group = await Group.findById(group_id);

  if (!group.members.toString().includes(user_id)) {
    return res
      .status(403)
      .json({ message: "You are not a member of this group." });
  }

  const {
    title,
    totalAmount,
    paidBy,
    category,
    notes,
    splitType,
    participants,
  } = req.body;

  let finalSplits = [];

  const involvedUsers =
    participants && participants.length > 0
      ? participants
      : group.members.map((m) => ({ userId: m.toString() }));

  const numberOfUsers = involvedUsers.length;

  if (numberOfUsers === 0) {
    return res.status(400).json({ message: "No participants provided." });
  }

  //   Equal Type
  if (splitType === "equal") {
    const eachShare = Number((totalAmount / numberOfUsers).toFixed(2));

    finalSplits = involvedUsers.map((p) => ({
      user: p.userId,
      amount: eachShare,
      isPaid: false,
    }));
  }
  // Manual Split up by amount 
  else if (splitType === "manual") {
    let sum = 0;

    finalSplits = involvedUsers.map((p) => {
      if (typeof p.value !== "number") {
        throw new Error("Manual Splits required amounts for each user.");
      }

      sum += p.value;
      return {
        user: p.userId,
        amount: p.share,
        isPaid: false,
      };
    });

    if (Number(sum.toFixed(2)) !== Number(totalAmount.toFixed(2))) {
      return res.status(400).json({
        message: "Manual split total does not match expense amount",
      });
    }
  } else if (splitType === "percentage") {
    let percentSum = 0;

    involvedUsers.forEach((p) => {
      if (typeof p.value !== "number") {
        throw new Error("Percentage Splits required value for each user.");
      }
      percentSum += p.value;
    });

    if (percentSum !== 100) {
      return res
        .status(400)
        .json({ message: "Total Percentage must equal 100%" });
    }
    finalSplits = involvedUsers.map((p) => ({
      user: p.userId,
      amount: Number(((p.value / 100) * totalAmount).toFixed(2)),
    }));
  } else {
    return res.status(400).json({ message: "Invalid Split Type." });
  }

  const expense = await Expense.create({
    group: group_id,
    title,
    totalAmount,
    paidBy,
    category,
    notes,
    splitType,
    splits: finalSplits,
    createdBy: user_id,
  });

  return res
    .status(201)
    .json({ message: "Expense added to the group.", expense });
};

export default {
  addExpense,
};


