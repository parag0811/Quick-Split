import Expense from "../models/expense.js";
import Settlement from "../models/settlement.js";
import Group from "../models/group.js";
import { s3 } from "../config/s3.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { predictSettlementRisk } from "../services/ml/settlementRiskService.js";

const getGroupBalances = async (req, res, next) => {
  try {
    const group = req.group;
    const group_id = group._id;

    const fullGroup = await Group.findById(group_id).populate(
      "members.user",
      "name email image imageKey",
    );

    const members = await Promise.all(
      fullGroup.members.map(async (m) => {
        let image = m.user.image || null;
        if (m.user.imageKey) {
          const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: m.user.imageKey,
          });
          image = await getSignedUrl(s3, command, { expiresIn: 3600 });
        }
        return {
          _id: m.user._id,
          name: m.user.name,
          email: m.user.email,
          image,
        };
      }),
    );

    if (members.length === 0) {
      return res.status(200).json({
        message: "No members in group",
        balances: {},
        suggestions: [],
        members: [],
      });
    }

    const expenses = await Expense.find({ group: group_id, isDeleted: false });

    const settlements = await Settlement.find({
      group: group_id,
      isDeleted: false,
    });

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

    settlements.forEach((s) => {
      const from = s.from.toString();
      const to = s.to.toString();

      balance[from] += s.amount;
      balance[to] -= s.amount;
    });

    Object.keys(balance).forEach((userId) => {
      balance[userId] = Number(balance[userId].toFixed(2));
    });

    let creditors = [];
    let debtors = [];

    for (const [userId, amount] of Object.entries(balance)) {
      if (amount > 0) {
        creditors.push({ user: userId, amount });
      } else if (amount < 0) {
        debtors.push({ user: userId, owed: Math.abs(amount) });
      }
    }

    let suggestions = [];

    let i = 0,
      j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const payAmount = Math.min(debtor.owed, creditor.amount);

      if (payAmount > 0) {
        suggestions.push({
          from: debtor.user,
          to: creditor.user,
          amount: Number(payAmount.toFixed(2)),
        });
      }

      debtor.owed -= payAmount;
      creditor.amount -= payAmount;

      if (debtor.owed === 0) i++;
      if (creditor.amount === 0) j++;
    }

    const memberMap = {};
    members.forEach((m) => {
      memberMap[m._id.toString()] = m;
    });

    const formattedSuggestions = await Promise.all(
      suggestions.map(async (s) => ({
        from: memberMap[s.from],
        to: memberMap[s.to],
        amount: s.amount,
        risk: await predictSettlementRisk(s.from, s.amount),
      })),
    );

    return res.status(200).json({
      message: "Group balances calculated successfully",
      balance,
      suggestions: formattedSuggestions,
      members,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getGroupBalances,
};
