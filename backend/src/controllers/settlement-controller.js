import dotenv from "dotenv";
dotenv.config();

import Group from "../models/group.js";
import Expense from "../models/expense.js";
import Settlement from "../models/settlement.js";

const getAllSettlement = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const group_id = req.params.groupId;

    if (!mongoose.Types.ObjectId.isValid(group_id)) {
      const error = new Error("Invalid group id");
      error.statusCode = 400;
      throw error;
    }

    const group = await Group.findById(group_id);
    if (!group) {
      const error = new Error("Group not found");
      error.statusCode = 404;
      throw error;
    }

    const isMember = group.members.some((m) => m.user.toString() === user_id);

    if (!isMember) {
      const error = new Error("Not Authorized");
      error.statusCode = 403;
      throw error;
    }

    const settlements = await Settlement.find({ group: group_id })
      .populate("from", "name email")
      .populate("to", "name email")
      .sort({ createdAt: -1 });

    let pendingSettlements = [];
    let completedSettlements = [];

    settlements.forEach((s) => {
      if (s.isSettled === true) {
        completedSettlements.push(s);
      } else {
        pendingSettlements.push(s);
      }
    });

    return res.status(200).json({
      message: "Fetched Settlements successfully.",
      settlements,
      pendingSettlement,
      completedSettlement,
    });
  } catch (error) {
    next(error);
  }
};

const getSettlement = async (req, res, next) => {
  try {
    const group_id = req.params.groupId;
    const user_id = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(group_id)) {
      const error = new Error("Invalid group id");
      error.statusCode = 400;
      throw error;
    }

    const group = await Group.findById(group_id);
    if (!group) {
      const error = new Error("Group not found");
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

    let creditors = [];
    let debtors = [];

    for (const [user, amount] of Object.entries(balance)) {
      if (amount > 0) {
        creditors.push({ user, amount });
      } else if (amount < 0) {
        debtors.push({ user, owed: Math.abs(amount) });
      }
    }

    // Settlement
    let settlements = [];
    let i = 0,
      j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const payAmount = Math.min(debtor.owed, creditor.amount);

      settlements.push({
        group: group_id,
        from: debtor.user,
        to: creditor.user,
        amount: payAmount,
      });

      debtor.owed -= payAmount;
      creditor.amount -= payAmount;

      if (debtor.owed === 0) i++;
      if (creditor.amount === 0) j++;
    }

    await Settlement.deleteMany({ group: group_id });

    const savedSettlements =
      settlements.length > 0 ? await Settlement.insertMany(settlements) : [];

    return res.status(200).json({
      message: "Settlements Created.",
      settlements: savedSettlements,
    });
  } catch (error) {
    next(error);
  }
};

const settlementPaid = async (req, res, next) => {
  try {
    const settlement_id = req.params.settlementId;
    const user_id = req.user.id;

    const settlement = await Settlement.findById(settlement_id);

    if (!settlement) {
      const error = new Error(
        "Settlements not found. Please generate settlement first.",
      );
      error.statusCode = 404;
      throw error;
    }

    if (user_id.toString() !== settlement.from.toString()) {
      const error = new Error("Sorry only payers can mark settlement as paid.");
      error.statusCode = 403;
      throw error;
    }

    if (settlement.isSettled) {
      const error = new Error("The due is already paid.");
      error.statusCode = 409;
      throw error;
    }

    settlement.isSettled = true;
    await settlement.save();

    return res
      .status(200)
      .json({ message: "Settlement marked as paid successfully.", settlement });
  } catch (error) {
    next(error);
  }
};

export default {
  getSettlement,
  settlementPaid,
  getAllSettlement,
};
