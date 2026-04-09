import { callGemini } from "../helpers/groq-helper.js";

export const suggestSplitService = async (data) => {
  const { amount, participants, context } = data;

  const names = participants.map((p) => p.name).join(", ");

  const prompt = `
You are a smart expense splitting assistant.

Split ₹${amount} among: ${names}

Context: ${context?.description || "No special context"}

Rules:
- Return ONLY JSON
- Total must equal 100%
- Include all participants

Format:
{
  "splits": [
    { "name": "A", "percentage": 40 },
    { "name": "B", "percentage": 30 }
  ],
  "reason": "short explanation"
}
`;

  const raw = await callGemini(prompt);

  let parsed;

  try {
    // Remove markdown if present
    const clean = raw.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(clean);
  } catch (err) {
    throw new Error("Invalid AI response");
  }

  // 🔧 Normalize (ensure all users included)
  const suggestions = participants.map((p) => {
    const found = parsed.splits.find((s) => s.name === p.name);

    return {
      userId: p.userId,
      name: p.name,
      percentage: found ? found.percentage : 0,
    };
  });

  // 🔧 Fix sum (optional simple normalization)
  const total = suggestions.reduce((sum, s) => sum + s.percentage, 0);

  if (total !== 100 && total > 0) {
    suggestions.forEach((s) => {
      s.percentage = Number(((s.percentage / total) * 100).toFixed(2));
    });
  }

  return {
    suggestions,
    reason: parsed.reason || "AI generated split",
  };
};
