import { GoogleGenAI } from "@google/genai";
import { Task } from "../types";

// Initialize Gemini API
// Note: process.env.GEMINI_API_KEY is injected by Vite config
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateTaskInsight(task: Task): Promise<string> {
  try {
    const prompt = `
      You are an expert productivity coach. The user has just created a new task:
      Title: "${task.title}"
      Subtasks: ${task.subtasks.map(s => s.title).join(', ')}
      Priority: ${task.priority}
      ${task.deadline ? `Deadline: ${task.deadline}` : ''}
      ${task.notes ? `Notes: ${task.notes}` : ''}

      Provide a short, encouraging, and highly actionable insight (max 2 sentences) on how to tackle this task effectively. 
      Focus on the structure of their subtasks or their priority.
      Keep it simple, non-technical, and motivating.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a friendly, concise productivity assistant.",
        temperature: 0.7,
      }
    });

    return response.text || "Break this down into smaller steps and tackle them one by one. You've got this!";
  } catch (error) {
    console.error("Error generating insight:", error);
    return "Great start! Focus on completing the first subtask to build momentum.";
  }
}

export { ai };
