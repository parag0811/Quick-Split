import { callGroq } from "../helpers/groq-helper.js";

export const generateAIInsights = async (data) => {
  const prompt = `
You are a financial assistant.

Analyze this group expense data:

${JSON.stringify(data)}

Return a short insight including:
- who is overpaying
- who is underpaying
- fairness of group
- one suggestion

Keep it short and clean.
`;

  try {
    const response = await callGroq(prompt);
    return response;
  } catch (err) {
    return "AI insights unavailable";
  }
};
