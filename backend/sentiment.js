// src/utils/nlp.js
import axios from "axios";
const dotenv = require("dotenv");

/**
 * This function calls the OpenAI /v1/completions endpoint
 * to classify the user's mood based on the text they provide.
 *
 * @param {string} userText - The user's free-form text about their mood or what they want.
 * @returns {string} - A single word (or short phrase) representing the user's mood.
 */
export async function analyzeUserText(userText) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "text-davinci-003", // <-- The model you want to use
        prompt: `User said: "${userText}". 
Classify the user's mood in one word like 'happy', 'sad', 'energetic', etc...`,
        max_tokens: 50, // Limit the length of the response
        temperature: 0.7, // Controls the "creativity" of the output
        top_p: 1.0, // Another sampling parameter
        n: 1, // Number of completions to generate
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GPT_KEY}`,
        },
      }
    );

    // OpenAI returns an array of choices; we pick the first
    const classification = response.data.choices[0].text.trim();
    return classification;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    // Return a fallback mood or handle the error in your app
    return "";
  }
}
