import dotenv from "dotenv";
dotenv.config();

import Group from "../models/group.js";
import Expense from "../models/expense.js";
import Settlement from "../models/settlement.js";

const getSettlement = async (req, res, next) => {
  try {
    const group_id = req.params.groupId;
    const user_id = req.user.id;

    const group = await Group.findById(group_id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some((m) => m.user.toString() === user_id);

    if (!isMember) {
      return res.status(403).json({ message: "Not authorized" });
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

    const savedSettlements = await Settlement.insertMany(settlements);

    return res.status(201).json({
      message: "Settlements Created.",
      settlements: savedSettlements,
    });
  } catch (error) {
      next(error);
  }
};

export default {
  getSettlement,
};
