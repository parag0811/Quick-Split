import dotenv from "dotenv";
dotenv.config();

import Group from "../models/group.js";
import Expense from "../models/expense.js";
import Settlement from "../models/settlement.js";

const getAllSettlement = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const group_id = req.params.groupId;
    const { status, page = 1, limit = 20 } = req.query;

    const group = await Group.findById(group_id);
    if (!group) {
      const error = new Error("Group is not found");
      error.statusCode = 404;
      throw error;
    }

    const isMember = group.members.some((m) => m.user.toString() === user_id);

    if (!isMember) {
      const error = new Error("Not a member of this group.");
      error.statusCode = 403;
      throw error;
    }

    let filter = { group: group_id };

    if (status === "pending") {
      filter.isSettled = false;
    }

    if (status === "completed") {
      filter.isSettled = true;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const settlements = await Settlement.find(filter)
      .populate("from", "name email image")
      .populate("to", "name email image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const totalCount = await Settlement.countDocuments(filter);

    return res.status(200).json({
      message: "Fetched Settlements successfully.",
      settlements,
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const createSettlement = async (req, res, next) => {
  try {
    const group_id = req.params.groupId;
    const user_id = req.user.id;

    const group = await Group.findById(group_id);
    if (!group) {
      const error = new Error("Group is not found");
      error.statusCode = 404;
      throw error;
    }

    const isMember = group.members.some((m) => m.user.toString() === user_id);

    if (!isMember) {
      const error = new Error("Not a member of the group.");
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

    const settledSettlements = await Settlement.find({
      group: group_id,
      isSettled: true,
    });

    settledSettlements.forEach((s) => {
      const from = s.from.toString();
      const to = s.to.toString();
      balance[from] += s.amount;
      balance[to] -= s.amount;
    });

    const nonSettledSettlements = await Settlement.find({
      group: group_id,
      isSettled: false,
    });

    if (nonSettledSettlements.length > 0) {
      const error = new Error(
        "Unsettled settlements already exist for the group. Settle them first.",
      );
      error.statusCode = 409;
      throw error;
    }

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

      const risk = await predictSettlementRisk(debtor.user, payAmount);

      const onTimeProbability = 1 - risk.delay_probability;
      let riskMessage = "";

      if (risk.risk_level === "High") {
        riskMessage = `High delay risk. Only ${(onTimeProbability * 100).toFixed(1)}% chance of paying within 3 days.`;
      } else if (risk.risk_level === "Medium") {
        riskMessage = `Moderate delay risk. ${(onTimeProbability * 100).toFixed(1)}% chance of paying within 3 days.`;
      } else {
        riskMessage = `Low delay risk. ${(onTimeProbability * 100).toFixed(1)}% chance of paying within 3 days.`;
      }

      settlements.push({
        group: group_id,
        from: debtor.user,
        to: creditor.user,
        amount: payAmount,
        delay_probability: risk.delay_probability,
        risk_level: risk.risk_level,
        risk_message: riskMessage,
      });

      debtor.owed -= payAmount;
      creditor.amount -= payAmount;

      if (debtor.owed === 0) i++;
      if (creditor.amount === 0) j++;
    }

    if (settlements.length === 0) {
      const error = new Error("No new expenses to settle.");
      error.statusCode = 400;
      throw error;
    }

    const savedSettlements =
      settlements.length > 0 ? await Settlement.insertMany(settlements) : [];

    const io = req.app.get("io");
    io.to(group_id.toString()).emit("settlement-generated", {
      settlements: savedSettlements,
    });

    return res.status(201).json({
      message: "Settlements Created.",
      settlements: savedSettlements,
    });
  } catch (error) {
    console.log(error);
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

    const io = req.app.get("io");
    io.to(settlement.group.toString()).emit("settlement-paid", {
      settlementId: settlement._id.toString(),
    });

    return res
      .status(200)
      .json({ message: "Settlement marked as paid successfully.", settlement });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export default {
  createSettlement,
  settlementPaid,
  getAllSettlement,
};
