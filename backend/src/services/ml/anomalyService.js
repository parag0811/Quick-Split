import Expense from "../../models/expense.js";
import mongoose from "mongoose";

// ML microcservice call for anomaly detection
export const detectAnomaly = async (userId, currentAmount) => {
  const now = new Date();

  const stats = await Expense.aggregate([
    {
      $match: {
        paidBy: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: "$paidBy",
        count: { $sum: 1 },
        avgAmount: { $avg: "$totalAmount" },
        lastExpenseDate: { $first: "$createdAt" },
      },
    },
  ]);
  console.log("Stats returned:", stats);

  if (!stats.length) {
    return {
      isAnomalous: false,
      anomalyScore: 0,
    };
  }

  const { count, avgAmount, lastExpenseDate } = stats[0];

  if (count < 3) {
    return {
      isAnomalous: false,
      anomalyScore: 0,
    };
  }

  const past_transaction_count = count;
  const user_avg_amount = avgAmount || currentAmount;

  let time_gap_minutes = 0;
  if (lastExpenseDate) {
    const diffMs = now - new Date(lastExpenseDate);
    time_gap_minutes = diffMs / (1000 * 60);
  }

  const hour = now.getHours();
  const day_of_week = now.getDay();

  const payload = {
    amount: currentAmount,
    past_transaction_count,
    user_avg_amount,
    time_gap_minutes,
    hour,
    day_of_week,
  };

  console.log("Payload:", JSON.stringify(payload, null, 2));
  // Calling fastAPi microservice
  const baseUrl = process.env.ANOMALY_ML_SERVICE_URL;
  try {
    const response = await fetch(`${baseUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    console.log("ML response:", data);

    const isAnomalous = data.is_suspicious ?? false;
    const anomalyScore = data.anomaly_score ?? 0;

    let anomalyReason = "";
    if (isAnomalous) {
      const ratio = user_avg_amount > 0 ? (currentAmount / user_avg_amount).toFixed(1) : 0;
      const reasons = [];
      if (currentAmount > user_avg_amount * 2) {
        reasons.push(`This amount is ${ratio}x your average spend of ₹${Math.round(user_avg_amount)}`);
      }
      if (time_gap_minutes < 5) {
        reasons.push("Made very shortly after your last expense");
      }
      anomalyReason = reasons.length > 0 ? reasons.join(". ") + "." : "Flagged by spending pattern analysis.";
    }

    return {
      isAnomalous,
      anomalyScore,
      anomalyReason,
    };
  } catch (error) {
    console.error("ML Service Error:", error.message);

    return {
      isAnomalous: false,
      anomalyScore: 0,
      anomalyReason: "",
    };
  }
};
