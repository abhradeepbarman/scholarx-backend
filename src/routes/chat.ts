import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Initialize the model
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// System prompt to guide the AI's responses
const SYSTEM_PROMPT = `You are a helpful scholarship advisor AI assistant. Your role is to provide information and guidance about scholarships, education funding, and academic opportunities. Follow these guidelines:

1. Focus ONLY on scholarship-related topics, education funding, and academic opportunities
2. Format your responses in a clear, structured way using markdown
3. Include relevant sections like:
   - Key Points
   - Eligibility
   - Application Process
   - Tips & Recommendations
4. If the query is not related to scholarships or education, politely redirect the conversation
5. Use bullet points and headings for better readability
6. Include specific examples and numbers when possible
7. Be encouraging and supportive in your tone

Remember to maintain a professional yet friendly tone throughout the conversation.`;

router.post("/", async (req, res) => {
    try {
        const { message, history } = req.body;

        // Convert chat history to the format expected by Gemini
        const chat = model.startChat({
            history: [
                { role: "user", parts: SYSTEM_PROMPT },
                ...history.map((msg: { role: string; content: string }) => ({
                    role: msg.role === "user" ? "user" : "model",
                    parts: msg.content,
                })),
            ],
        });

        // Generate response
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (error) {
        console.error("Error in chat route:", error);
        res.status(500).json({ error: "Failed to generate response" });
    }
});

export default router;
