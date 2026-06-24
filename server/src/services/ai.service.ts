import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

// Initialize APIs
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const analyzeCode = async (
  code: string, 
  retries = 3, 
  delay = 5000
): Promise<string> => {
  try {
    // 1. Primary: Try Gemini 3.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const result = await model.generateContent(`Analyze this code: ${code}. Provide feedback on correctness and complexity.`);
    return result.response.text();
    
  } catch (error: any) {
    // 2. Handle Rate Limits (429) or Server Busy (503) with Retry Logic
    if ((error.status === 429 || error.status === 503) && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return analyzeCode(code, retries - 1, delay * 2);
    }

    // 3. Failover: If Gemini fails, fallback to Groq
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: `Analyze this code: ${code}. Provide feedback on correctness and complexity.` }],
        model: "llama-3.3-70b-versatile",
      });
      return chatCompletion.choices[0]?.message?.content || "No feedback generated.";
    } catch (groqError) {
      throw error; // Throw the original Gemini error if both fail
    }
  }
};