
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// This is your OpenRouter API key, stored as a Supabase Secret
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

serve(async (req) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    if (!OPENROUTER_API_KEY) {
        return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY not set' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const { category, numberOfQuestions } = await req.json();

    if (!category || !numberOfQuestions) {
        return new Response(JSON.stringify({ error: 'Missing category or numberOfQuestions' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

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
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                // "HTTP-Referer": "YOUR_SITE_URL", // Not strictly needed for Edge Function
                // "X-Title": "YOUR_APP_NAME", // Not strictly needed for Edge Function
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: "You are a helpful assistant designed to generate quiz questions in a strict JSON format." },
                    { role: "user", content: prompt }
                ],
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("OpenRouter API Error Response:", errorBody);
            return new Response(JSON.stringify({ error: `OpenRouter API request failed: ${response.status} ${response.statusText}` }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            return new Response(JSON.stringify({ error: 'Invalid response structure from OpenRouter API.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        const parsed = JSON.parse(content);

        if (parsed.questions && Array.isArray(parsed.questions)) {
            return new Response(JSON.stringify({ questions: parsed.questions }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } else {
            return new Response(JSON.stringify({ error: 'Invalid data structure received from OpenRouter API.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    } catch (error: any) {
        console.error("Error in Edge Function:", error);
        return new Response(JSON.stringify({ error: `Failed to generate quiz questions: ${error.message}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});
