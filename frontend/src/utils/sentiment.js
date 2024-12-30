// src/utils/nlp.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GPT_KEY,
});

export async function analyzeUserText(userText) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful mood classifier. When the user says how they feel, you respond with a single word describing that mood (e.g., 'happy', 'sad', 'heartbreak', 'energetic').",
        },
        {
          role: "user",
          content: `User said: "${userText}". Classify the user's mood in one word, or a short phrase if needed.`,
        },
      ],
      max_tokens: 50,
      temperature: 0.7,
      // You can also set top_p, n, etc. if you like
    });

    const classification = completion.choices[0].message.content.trim();
    return classification;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return "neutral";
  }
}
