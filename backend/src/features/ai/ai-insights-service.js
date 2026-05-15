import { callGroq } from "../helpers/groq-helper.js";

export const generateAIInsights = async (data) => {
  const currencyCode = data.currency || "INR";
  const prompt = `
You are a financial assistant.

Analyze this group expense data:

${JSON.stringify(data)}

Return a short insight including:
- who is overpaying
- who is underpaying
- fairness of group
- one suggestion

Formatting rules:
- Use only the ${currencyCode} currency for all amounts.
- Do not mention any other currency symbols or codes.

Keep it short and clean.
`;

  try {
    const response = await callGroq(prompt);
    return response;
  } catch (err) {
    return "AI insights unavailable";
  }
};
