import Expense from "../../models/expense.js"

// ML microcservice call for anomaly detection
const detectAnomaly = async (userId, currentAmount) => {
  const now = new Date();

  const stats = await Expense.aggregate([
    {
      $match: {
        paidBy: userId,
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
  const amount_minus_user_avg = currentAmount - user_avg_amount;

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
    amount_minus_user_avg,
    time_gap_minutes,
    hour,
    day_of_week,
  };

  // Calling fastAPi microservice
  try {
    const response = await fetch.post(process.env.ML_SERVICE_URL, {
      payload,
    });

    return {
      isAnomalous: response.data.isAnomalous,
      anomalyScore: response.data.score,
    };
  } catch (error) {
    console.error("ML Service Error:", error.message);

    return {
      isAnomalous: false,
      anomalyScore: 0,
    };
  }
};

export default {
  detectAnomaly
}
