import { QuizQuestion } from '../types';

// 1. Get API key from environment variables (Vite-specific)
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const HTTP_REFERER = import.meta.env.VITE_HTTP_REFERER || "http://localhost:5173";
const X_TITLE = import.meta.env.VITE_X_TITLE || "Gemini Real-Time Quiz";


if (!API_KEY) {
    console.warn("VITE_OPENROUTER_API_KEY environment variable not set. AI features will be disabled.");
}

/**
 * Generates quiz questions using the OpenRouter API.
 * @param category The category of the quiz.
 * @param numberOfQuestions The number of questions to generate.
 * @returns A promise that resolves to an array of QuizQuestion objects.
 */
export const generateQuizQuestions = async (category: string, numberOfQuestions: number): Promise<QuizQuestion[]> => {
    if (!API_KEY) {
        throw new Error("API Key is not configured. Cannot generate questions.");
    }

    // Prompt instructing the model to return JSON
    const prompt = `
        Generate exactly ${numberOfQuestions} high-quality, challenging, and distinct multiple-choice quiz questions about the topic: "${category}".

        **Strict JSON Output Format:**
        You must respond with ONLY a valid JSON object. Do not include any text, markdown, or explanations before or after the JSON object.
        The JSON object must have a single key "questions", which is an array of question objects.
        
        Each question object must have the following properties:
        - "question": (string) The text of the question.
        - "options": (array of 4 strings) The possible answers.
        - "correctAnswer": (string) The correct answer, which must be an exact match to one of the items in the "options" array.

        Example format:
        {
          "questions": [
            {
              "question": "What is the capital of France?",
              "options": ["Berlin", "Madrid", "Paris", "Lisbon"],
              "correctAnswer": "Paris"
            }
          ]
        }
    `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": HTTP_REFERER,
                "X-Title": X_TITLE,
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo", // Fast and reliable model
                response_format: { type: "json_object" }, // Instruct OpenAI to return JSON
                messages: [
                    { role: "system", content: "You are a helpful assistant designed to generate quiz questions in a strict JSON format." },
                    { role: "user", content: prompt }
                ],
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("OpenRouter API Error Response:", errorBody);
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        const content = data.choices[0]?.message?.content;

        if (!content) {
             throw new Error("Invalid response structure from OpenRouter API.");
        }

        // The response from the API is a JSON string, so we need to parse it.
        const parsed = JSON.parse(content);

        if (parsed.questions && Array.isArray(parsed.questions)) {
            return parsed.questions as QuizQuestion[];
        } else {
            console.error("Parsed response from API lacks a 'questions' array:", parsed);
            throw new Error("Invalid data structure received from API.");
        }
    } catch (error) {
        console.error("Error generating quiz questions from OpenRouter API:", error);
        throw new Error("Failed to generate quiz questions. Please check your API key and network connection.");
    }
};