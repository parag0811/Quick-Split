export const validateSplitSuggestion = (req, res, next) => {
  const { amount, participants } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be greater than 0",
    });
  }

  if (!participants || participants.length < 2) {
    return res.status(400).json({
      success: false,
      message: "At least 2 participants required",
    });
  }

  next();
};
