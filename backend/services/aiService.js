import Groq from 'groq-sdk';
import { z } from 'zod';

// Define the precise schema to validate LLM output
const QuizSchema = z.array(
    z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        correctAnswer: z.string(),
        explanation: z.string(),
        difficulty: z.enum(['Easy', 'Medium', 'Hard'])
    })
);

const getGroqClient = () => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not configured in .env");
    }
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

/**
 * Extracts key educational concepts from raw text.
 * @param {string} text - The study material text.
 * @returns {Promise<string>}
 */
export const extractConcepts = async (text) => {
    const groq = getGroqClient();
    
    // Truncate to avoid context window limits on very large PDFs
    const safeText = text.substring(0, 15000); 

    const prompt = `Analyze the following educational text and extract a comma-separated list of the 5 to 10 most critical learning concepts or topics. Only output the comma-separated list, absolutely no other text.\n\nText: ${safeText}`;

    const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || '';
};

/**
 * Generates structured JSON quiz questions from text.
 * @param {string} content - The extracted concepts or raw text.
 * @param {string} difficulty - "Easy", "Medium", or "Hard".
 * @param {number} count - Number of questions to generate.
 * @returns {Promise<Array>}
 */
export const generateQuizFromContent = async (content, difficulty, count) => {
    const groq = getGroqClient();
    
    const safeContent = content.substring(0, 8000); 

    const prompt = `You are an expert educator. Create a quiz of exactly ${count} multiple-choice questions based ONLY on the following content.

Requirements:
1. Target difficulty: ${difficulty}
2. The response MUST be a JSON object containing a single key "quiz" with an array of exactly ${count} objects.
3. Data Schema:
{
  "quiz": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"], // exactly 4 strings
      "correctAnswer": "string", // exact match to one of the options
      "explanation": "string",
      "difficulty": "${difficulty}"
    }
  ]
}

Content: ${safeContent}`;

    const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.2, // Low temp for more deterministic JSON
        response_format: { type: "json_object" }
    });

    const rawOutput = completion.choices[0]?.message?.content?.trim();

    try {
        const parsedData = JSON.parse(rawOutput);
        // Validate with Zod
        const validatedQuiz = QuizSchema.parse(parsedData.quiz);
        return validatedQuiz;
    } catch (error) {
        throw new Error('Failed to parse or validate LLM response as correct JSON.');
    }
};

/**
 * Regenerates a single question given some content and difficulty.
 */
export const regenerateSingleQuestion = async (content, difficulty) => {
    const rawQuestions = await generateQuizFromContent(content, difficulty, 1);
    if (!rawQuestions || rawQuestions.length === 0) {
        throw new Error('Failed to generate replacement question.');
    }
    return rawQuestions[0];
};

/**
 * Generates personalized text feedback based on an attempt.
 */
export const generateFeedback = async (attemptData, quizTitle) => {
    const groq = getGroqClient();
    
    // We only need to send the wrong ones to save context
    const wrongAnswers = attemptData.filter(a => !a.isCorrect);
    if (wrongAnswers.length === 0) return "Excellent job! You demonstrated mastery of all tested concepts in this topic.";

    const prompt = `A student took an assessment on "${quizTitle}" and got ${wrongAnswers.length} questions wrong out of ${attemptData.length} total.
Based on the wrong answers provided below, identify the student's conceptual gaps and provide a short, encouraging 2-3 sentence personalized feedback emphasizing what specific topics they need to review. 
Wrong answers context: 
${JSON.stringify(wrongAnswers.map(w => ({ questionId: w.questionId, selected: w.selectedOption })), null, 2)}

Provide just the feedback text, nothing else.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.3,
        });
        return completion.choices[0]?.message?.content?.trim() || "Consider reviewing the material to improve on the difficult questions.";
    } catch(err) {
        return "Review the topics highlighted by your wrong answers to improve.";
    }
};
