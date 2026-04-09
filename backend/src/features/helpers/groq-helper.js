import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const callGemini = async (prompt) => {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Free, very capable
      messages: [
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error("Groq Error:", error);
    throw new Error("AI service failed");
  }
};