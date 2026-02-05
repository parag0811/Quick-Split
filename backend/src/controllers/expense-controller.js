import dotenv from "dotenv";
dotenv.config();

import Group from "../models/group.js";
import Expense from "../models/expense.js";
import Settlement from "../models/settlement.js";

const getAllExpense = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const group_id = req.params.id;

    const group = await Group.findById(group_id);

    if (!group) {
      const error = new Error("Group not found");
      error.statusCode = 404;
      throw error;
    }
    const isMember = group.members.some((m) => m.user.toString() === user_id);

    if (!isMember) {
      const error = new Error("You are not a member of this group.");
      error.statusCode = 403;
      throw error;
    }

    const expenses = await Expense.find({ group: group_id })
      .populate("paidBy", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json({
        message: "All Expenses fetched.",
        count: expenses.length,
        expenses,
      });
  } catch (error) {
    next(error);
  }
};

const addExpense = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const group_id = req.params.id;

    const group = await Group.findById(group_id);

    if (!group) {
      const error = new Error("Group not found");
      error.statusCode = 404;
      throw error;
    }
    const isMember = group.members.some((m) => m.user.toString() === user_id);

    if (!isMember) {
      const error = new Error("You are not a member of this group.");
      error.statusCode = 403;
      throw error;
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
      const error = new Error("No participants provided.");
      error.statusCode = 400;
      throw error;
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
          const error = new Error(
            "Manual Splits required amounts for each user.",
          );
          error.statusCode = 400;
          throw error;
        }

        sum += p.value;
        return {
          user: p.userId,
          amount: p.share,
          isPaid: false,
        };
      });

      if (Number(sum.toFixed(2)) !== Number(totalAmount.toFixed(2))) {
        const error = new Error(
          "Manual split total does not match expense amount",
        );
        error.statusCode = 400;
        throw error;
      }
    } else if (splitType === "percentage") {
      let percentSum = 0;

      involvedUsers.forEach((p) => {
        if (typeof p.value !== "number") {
          const error = new Error(
            "Percentage Splits required value for each user.",
          );
          error.statusCode = 400;
          throw error;
        }
        percentSum += p.value;
      });

      if (percentSum !== 100) {
        const error = new Error("Total Percentage must equal 100%");
        error.statusCode = 400;
        throw error;
      }
      finalSplits = involvedUsers.map((p) => ({
        user: p.userId,
        amount: Number(((p.value / 100) * totalAmount).toFixed(2)),
      }));
    } else {
      const error = new Error("Invalid Split Type.");
      error.statusCode = 400;
      throw error;
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
  } catch (error) {
    next(error);
  }
};

const balance = async (req, res, next) => {
  try {
    const group_id = req.params.id;
    const user_id = req.user.id;

    const group = await Group.findById(group_id);
    if (!group) {
      const error = new Error("Group not found");
      error.statusCode = 404;
      throw error;
    }
    const isMember = group.members.some((m) => m.user.toString() === user_id);

    if (!isMember) {
      const error = new Error("Not Authorized.");
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

    const settlements = await Settlement.find({
      group: group_id,
      isSettled: true,
    });

    settlements.forEach((s) => {
      const from = s.from.toString();
      const to = s.to.toString();
      balance[from] += s.amount;
      balance[to] -= s.amount;
    });

    const finalBalance = Object.entries(balance).map(([userId, amount]) => ({
      user: userId,
      netAmount: Number(amount.toFixed(2)),
    }));

    return res.status(200).json({
      message: "Group balances calculated successfully",
      finalBalance,
    });
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const expense_id = req.params.expenseId;

    const expense = await Expense.findById(expense_id);

    if (!expense) {
      const error = new Error("Expense not found");
      error.statusCode = 404;
      throw error;
    }

    const group = await Group.find(expense.group);
    if (!group) {
      const error = new Error("Group not found");
      error.statusCode = 404;
      throw error;
    }

    const isMember = group.members.some((m) => m.user.toString() === user_id);

    if (!isMember) {
      const error = new Error("Not Authorized.");
      error.statusCode = 403;
      throw error;
    }

    const isExpenseCreator = expense.createdBy.toString() === user_id;

    const isGroupCreator = group.createdBy.toString() === user_id;

    if (!isExpenseCreator && !isGroupCreator) {
      const error = new Error(
        "Only expense creator or group creator can delete this expense",
      );
      error.statusCode = 403;
      throw error;
    }

    await Expense.findByIdAndDelete(expense_id);

    return res.status(200).json({ message: "Deleted expense Successfully." });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllExpense,
  addExpense,
  balance,
  deleteExpense,
};
