import { supabase } from '../src/supabaseClient';
import { QuizQuestion } from '../types';


/**
 * Generates quiz questions by invoking a Supabase Edge Function.
 * @param category The category of the quiz.
 * @param numberOfQuestions The number of questions to generate.
 * @returns A promise that resolves to an array of QuizQuestion objects.
 */
export const generateQuizQuestions = async (category: string, numberOfQuestions: number): Promise<QuizQuestion[]> => {
    try {
        const { data, error } = await supabase.functions.invoke('generate-quiz-questions', {
            body: { category, numberOfQuestions },
        });

        if (error) {
            console.error("Supabase function invocation error:", error);
            throw new Error(`Failed to invoke 'generate-quiz-questions' function: ${error.message}`);
        }

        // The 'data' from a successful function invocation should be the JSON object with the 'questions' array.
        if (data && data.questions && Array.isArray(data.questions)) {
            return data.questions as QuizQuestion[];
        } else {
            console.error("Invalid response structure from Supabase function:", data);
            throw new Error("Invalid data structure received from Supabase function.");
        }
    } catch (error) {
        console.error("Error generating quiz questions:", error);
        // Re-throw the error to be handled by the calling component
        throw error;
    }
};