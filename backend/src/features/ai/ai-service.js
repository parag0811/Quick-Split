import { callGroq } from "../helpers/groq-helper.js";

export const suggestSplitService = async (data) => {
  const { amount, participants, context } = data;

  const names = participants.map((p) => p.name).join(", ");

  // Prompt (strict for Groq)
  const prompt = `
You are an API that returns ONLY valid JSON.

Task:
Split ₹${amount} among these participants: ${names}

Context:
${context?.description || "No special context"}

STRICT RULES:
- Output ONLY valid JSON (no text outside JSON)
- Total percentage MUST equal 100
- Include ALL participants exactly as given
- Percentages must be numbers

FORMAT:
{
  "splits": [
    { "name": "You", "percentage": 33.33 },
    { "name": "Rahul", "percentage": 33.33 }
  ],
  "reason": "short reason"
}

DO NOT:
- add markdown
- add explanation outside JSON
- change names
`;

  // fallback (safe system)
  const fallbackSplit = (participants) => {
    const equal = Number((100 / participants.length).toFixed(2));

    return {
      suggestions: participants.map((p) => ({
        userId: p.userId,
        name: p.name,
        percentage: equal,
      })),
      reason: "Equal split (AI unavailable)",
    };
  };

  let raw;
  try {
    raw = await callGroq(prompt);
  } catch (err) {
    return fallbackSplit(participants);
  }

  let parsed;

  // SAFE PARSING
  try {
    const clean = raw
      .replace(/```json|```/g, "")
      .replace(/\n/g, "")
      .trim();

    const jsonMatch = clean.match(/\{.*\}/);

    if (!jsonMatch) throw new Error("No JSON found");

    parsed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("RAW AI RESPONSE:", raw);
    return fallbackSplit(participants);
  }

  // Ensure splits exist
  if (!parsed.splits || !Array.isArray(parsed.splits)) {
    return fallbackSplit(participants);
  }

  // Map safely + convert to number
  let suggestions = participants.map((p) => {
    const found = parsed.splits.find((s) => s.name === p.name);

    return {
      userId: p.userId,
      name: p.name,
      percentage: found ? Number(found.percentage) || 0 : 0,
    };
  });

  // Normalize
  let total = suggestions.reduce((sum, s) => sum + s.percentage, 0);

  if (total <= 0) {
    return fallbackSplit(participants);
  }

  suggestions = suggestions.map((s) => ({
    ...s,
    percentage: Number(((s.percentage / total) * 100).toFixed(2)),
  }));

  // Fix rounding drift
  total = suggestions.reduce((sum, s) => sum + s.percentage, 0);
  const diff = Number((100 - total).toFixed(2));

  if (Math.abs(diff) > 0) {
    suggestions[0].percentage += diff;
  }

  return {
    suggestions,
    reason: parsed.reason || "AI generated split",
  };
};
