import dotenv from "dotenv";
dotenv.config();

import Expense from "../models/expense.js";
import Settlement from "../models/settlement.js";
import { detectAnomaly } from "../services/ml/anomalyService.js";
import updateGroupActivity from "../helper/group-activity.js";

const getAllExpense = async (req, res, next) => {
  try {
    const group = req.group;
    const group_id = group._id;

    const expenses = await Expense.find({ group: group_id , isDeleted : false})
      .populate("paidBy", "name email")
      .populate("createdBy", "name email")
      .populate("splits.user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
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
    const group = req.group;
    const group_id = group._id;

    const {
      title,
      totalAmount,
      currency,
      category,
      paidBy,
      notes,
      splitType,
      participants,
    } = req.body;

    const amountNumber = Number(totalAmount);

    if (isNaN(amountNumber) || amountNumber <= 0) {
      const error = new Error("Invalid total amount.");
      error.statusCode = 400;
      throw error;
    }

    const isValidPayer = group.members.some(
      (m) => m.user.toString() === paidBy,
    );

    if (!isValidPayer) {
      const error = new Error("Payer must be a valid group member.");
      error.statusCode = 400;
      throw error;
    }

    let finalSplits = [];

    const involvedUsers =
      participants && participants.length > 0
        ? participants
        : group.members.map((m) => ({ userId: m.user.toString() }));

    const numberOfUsers = involvedUsers.length;

    if (numberOfUsers === 0) {
      const error = new Error("No participants provided.");
      error.statusCode = 400;
      throw error;
    }

    involvedUsers.forEach((p) => {
      const isValidParticipant = group.members.some(
        (m) => m.user.toString() === p.userId,
      );

      if (!isValidParticipant) {
        const error = new Error("Invalid participant in split.");
        error.statusCode = 400;
        throw error;
      }
    });

    //   Equal Type
    if (splitType === "equal") {
      const eachShare = Number((amountNumber / numberOfUsers).toFixed(2));

      finalSplits = involvedUsers.map((p) => ({
        user: p.userId,
        amount: eachShare,
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
          amount: p.value,
        };
      });
      const totalAmountNum = Number(totalAmount);

      if (Number(sum.toFixed(2)) !== Number(totalAmountNum.toFixed(2))) {
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
        percentage: p.value,
      }));
    } else {
      const error = new Error("Invalid Split Type.");
      error.statusCode = 400;
      throw error;
    }

    const { isAnomalous, anomalyScore, anomalyReason } = await detectAnomaly(
      paidBy,
      amountNumber,
    );

    await updateGroupActivity(group_id);

    const expense = await Expense.create({
      group: group_id,
      title,
      totalAmount,
      paidBy,
      currency,
      category,
      notes,
      splitType,
      splits: finalSplits,
      createdBy: user_id,
      isAnomalous,
      anomalyScore,
      anomalyReason,
    });

    const io = req.app.get("io");
    io.to(group_id.toString()).emit("expense-added", {
      message: "New expense added",
      expense,
    });

    return res
      .status(201)
      .json({ message: "Expense added to the group.", expense });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const editExpense = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const expense_id = req.params.expenseId;

    const group = req.group;
    const group_id = group._id;

    const expense = await Expense.findById(expense_id);
    if (!expense) {
      const error = new Error("Expense not found");
      error.statusCode = 404;
      throw error;
    }

    const {
      title,
      totalAmount,
      currency,
      category,
      notes,
      splitType,
      participants,
      paidBy,
    } = req.body;

    const amountNumber = Number(totalAmount);

    if (isNaN(amountNumber) || amountNumber <= 0) {
      const error = new Error("Invalid total amount.");
      error.statusCode = 400;
      throw error;
    }

    const isValidPayer = group.members.some(
      (m) => m.user.toString() === paidBy,
    );

    if (!isValidPayer) {
      const error = new Error("Payer must be valid group member.");
      error.statusCode = 400;
      throw error;
    }

    let finalSplits = [];

    const involvedUsers =
      participants && participants.length > 0
        ? participants
        : group.members.map((m) => ({
            userId: m.user.toString(),
          }));

    const numberOfUsers = involvedUsers.length;

    if (numberOfUsers === 0) {
      const error = new Error("No participants provided.");
      error.statusCode = 400;
      throw error;
    }

    // Validate participants
    involvedUsers.forEach((p) => {
      const valid = group.members.some((m) => m.user.toString() === p.userId);
      if (!valid) {
        const error = new Error("Invalid participant.");
        error.statusCode = 400;
        throw error;
      }
    });

    // Split logic
    if (splitType === "equal") {
      const eachShare = Number((amountNumber / numberOfUsers).toFixed(2));

      finalSplits = involvedUsers.map((p) => ({
        user: p.userId,
        amount: eachShare,
      }));
    } else if (splitType === "manual") {
      let sum = 0;

      finalSplits = involvedUsers.map((p) => {
        if (typeof p.value !== "number") {
          throw new Error("Manual split requires amounts.");
        }
        sum += p.value;

        return {
          user: p.userId,
          amount: p.value,
        };
      });

      if (Number(sum.toFixed(2)) !== Number(amountNumber.toFixed(2))) {
        const error = new Error(
          "Manual split total does not match expense amount.",
        );
        error.statusCode = 400;
        throw error;
      }
    } else if (splitType === "percentage") {
      let percentSum = 0;

      involvedUsers.forEach((p) => {
        if (typeof p.value !== "number") {
          throw new Error("Percentage split requires values.");
        }
        percentSum += p.value;
      });

      if (percentSum !== 100) {
        const error = new Error("Total percentage must equal 100%.");
        error.statusCode = 400;
        throw error;
      }

      finalSplits = involvedUsers.map((p) => ({
        user: p.userId,
        amount: Number(((p.value / 100) * amountNumber).toFixed(2)),
        percentage: p.value,
      }));
    } else {
      const error = new Error("Invalid split type.");
      error.statusCode = 400;
      throw error;
    }
    // re-run anomaly detection, exclude current expense from stats
    const { isAnomalous, anomalyScore, anomalyReason } = await detectAnomaly(
      paidBy,
      amountNumber,
      expense._id,
    );
    // update expense
    expense.title = title;
    expense.totalAmount = amountNumber;
    expense.currency = currency;
    expense.category = category;
    expense.notes = notes;
    expense.splitType = splitType;
    expense.paidBy = paidBy;
    expense.splits = finalSplits;
    expense.isAnomalous = isAnomalous;
    expense.anomalyScore = anomalyScore;
    expense.anomalyReason = anomalyReason;
    expense.updatedBy = user_id;

    await updateGroupActivity(group_id);

    await expense.save();

    const io = req.app.get("io");
    io.to(group._id.toString()).emit("expense-updated", {
      expense,
    });

    return res.status(200).json({
      message: "Expense updated successfully.",
      expense,
    });
  } catch (error) {
    next(error);
  }
};

const balance = async (req, res, next) => {
  try {
    const group = req.group;
    const group_id = group._id;

    const expenses = await Expense.find({ group: group_id, isDeleted : false });

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
      isDeleted : false
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
    const group = req.group;

    const expense = await Expense.findById(expense_id);

    if (!expense) {
      const error = new Error("Expense not found");
      error.statusCode = 404;
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

    const io = req.app.get("io");
    io.to(group._id.toString()).emit("expense-deleted", {
      expenseId: expense._id.toString(),
    });

    return res.status(200).json({ message: "Deleted expense Successfully." });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllExpense,
  addExpense,
  editExpense,
  balance,
  deleteExpense,
};
