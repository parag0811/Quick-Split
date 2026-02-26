import Settlement from "../../models/settlement.js";

export const predictSettlementRisk = async (userId, currentAmount) => {
  const DELAY_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;

  const settlements = await Settlement.find({
    from: userId,
    isSettled: true,
  }).sort({ createdAt: -1 });

  if (settlements.length < 3) {
    return {
      delay_probability: 0,
      risk_level: "Low",
    };
  }

  const past_total_settlements = settlements.length;

  let delayedCount = 0;
  let totalSettlementTime = 0;
  let totalAmount = 0;

  settlements.forEach((s) => {
    const settlementTime = new Date(s.updatedAt) - new Date(s.createdAt);

    totalSettlementTime += settlementTime;
    totalAmount += s.amount;

    if (settlementTime > DELAY_THRESHOLD_MS) {
      delayedCount++;
    }
  });

  const past_delay_rate = delayedCount / past_total_settlements;

  const avg_settlement_time = totalSettlementTime / past_total_settlements;

  const past_avg_amount = totalAmount / past_total_settlements;

  const amount_vs_user_avg = currentAmount - past_avg_amount;

  // Last 5 settlements
  const lastFive = settlements.slice(0, 5);

  let totalDelayLast5 = 0;

  lastFive.forEach((s) => {
    const settlementTime = new Date(s.updatedAt) - new Date(s.createdAt);

    if (settlementTime > DELAY_THRESHOLD_MS) {
      totalDelayLast5 += settlementTime;
    }
  });

  const avg_delay_last_5 =
    lastFive.length > 0 ? totalDelayLast5 / lastFive.length : 0;

  const payload = {
    amount: currentAmount,
    past_total_settlements,
    past_delay_rate,
    avg_settlement_time,
    past_avg_amount,
    amount_vs_user_avg,
    avg_delay_last_5,
  };

  const baseUrl = process.env.ML_SERVICE_URL;

  try {
    const response = await fetch(`${baseUrl}/risk-predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    return {
      delay_probability: data.delay_probability,
      risk_level: data.risk_level,
    };
  } catch (error) {
    console.error("Settlement ML Error:", error.message);

    return {
      delay_probability: 0,
      risk_level: "Low",
    };
  }
};
