import Expense from "../../models/expense.js";
import mongoose from "mongoose";

// ML microservice call for anomaly detection
export const detectAnomaly = async (userId, currentAmount, excludeExpenseId = null) => {
  const now = new Date();

  const matchFilter = {
    paidBy: new mongoose.Types.ObjectId(userId),
  };

  if (excludeExpenseId) {
    matchFilter._id = { $ne: new mongoose.Types.ObjectId(excludeExpenseId) };
  }

  const stats = await Expense.aggregate([
    {
      $match: matchFilter,
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

  if (!stats.length) {
    return {
      isAnomalous: false,
      anomalyScore: 0,
      anomalyReason: "",
    };
  }

  const { count, avgAmount, lastExpenseDate } = stats[0];

  if (count < 3) {
    return {
      isAnomalous: false,
      anomalyScore: 0,
      anomalyReason: "",
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

  // Calling fastAPi microservice
  const baseUrl = process.env.ANOMALY_ML_SERVICE_URL;
  try {
    const response = await fetch(`${baseUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = new Error("Anomaly ML response is not valid.");
      error.statusCode = 500;
      throw error;
    }

    const data = await response.json();

    const isAnomalous = data.is_suspicious ?? false;
    const anomalyScore = data.anomaly_score ?? 0;

    let anomalyReason = "";
    if (isAnomalous) {
      const ratio = user_avg_amount > 0 ? Number((currentAmount / user_avg_amount).toFixed(1)) : 0;
      const avgFormatted = Math.round(user_avg_amount);

      if (currentAmount > user_avg_amount * 5) {
        anomalyReason = `This amount is ${ratio}x higher than your average spend of ₹${avgFormatted} — unusually large.`;
      } else if (currentAmount > user_avg_amount * 2) {
        anomalyReason = `This amount is ${ratio}x your average spend of ₹${avgFormatted}.`;
      } else if (currentAmount < user_avg_amount * 0.2) {
        anomalyReason = `This amount is unusually low — only ${ratio}x of your average spend of ₹${avgFormatted}.`;
      } else if (currentAmount < user_avg_amount * 0.5) {
        anomalyReason = `This amount is lower than usual — ${ratio}x of your average spend of ₹${avgFormatted}.`;
      } else if (time_gap_minutes < 2) {
        anomalyReason = "Added within seconds of your last expense — possible duplicate.";
      } else if (time_gap_minutes < 5) {
        anomalyReason = "Added very shortly after your last expense.";
      } else if (hour >= 0 && hour < 5) {
        anomalyReason = "Expense logged at an unusual hour (late night).";
      } else {
        anomalyReason = `Spending pattern flagged as unusual (score: ${anomalyScore.toFixed(2)}).`;
      }
    }

    return {
      isAnomalous: anomalyReason.length > 0,
      anomalyScore: anomalyReason.length > 0 ? anomalyScore : 0,
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
