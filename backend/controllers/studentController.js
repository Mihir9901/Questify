import Assignment from '../models/Assignment.js';
import Quiz from '../models/Quiz.js';
import Attempt from '../models/Attempt.js';
import { generateFeedback } from '../services/aiService.js';

export const getAssignedQuizzes = async (req, res) => {
    try {
        // Find tasks assigned specifically to this user OR those with an empty assignedTo array (class-wide)
        const query = {
            $or: [
                { assignedTo: req.user._id },
                { assignedTo: { $size: 0 } },
                { assignedTo: { $exists: false } }
            ]
        };

        const assignments = await Assignment.find(query)
            .populate('quizId', 'title difficulty createdAt')
            .sort({ createdAt: -1 });

        // Also get attempts to see completed assignments
        const attempts = await Attempt.find({ userId: req.user._id });

        // Filter out orphaned assignments where quiz was deleted
        const validAssignments = assignments.filter(a => a.quizId != null);
        
        if (validAssignments.length === 0 && assignments.length > 0) {
            console.warn(`[StudentAPI] Found ${assignments.length} assignments, but all were filtered out due to missing quiz data (orphaned).`);
        }

        const formatted = validAssignments.map(a => {
            const isCompleted = attempts.some(att => 
                (att.assignmentId && att.assignmentId.toString() === a._id.toString()) || 
                (att.quizId && att.quizId.toString() === a.quizId._id.toString())
            );
            return {
                ...a._doc,
                isCompleted,
            }
        });

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const submitQuiz = async (req, res) => {
    const { quizId, answers, timeTaken, tabViolations } = req.body;
    let assignmentId = req.body.assignmentId;
    if (assignmentId === 'null') assignmentId = null;

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        let score = 0;
        const processedAnswers = [];

        answers.forEach(submitAnswer => {
            const question = quiz.questions.id(submitAnswer.questionId);
            if (question) {
                // Safely compare correctly if one is null
                const isCorrect = submitAnswer.selectedOption && question.correctAnswer === submitAnswer.selectedOption;
                if (isCorrect) score++;

                processedAnswers.push({
                    questionId: question._id,
                    selectedOption: submitAnswer.selectedOption || '', // Prevents Mongoose validation error
                    isCorrect: !!isCorrect,
                    responseTime: submitAnswer.responseTime || 0
                });
            }
        });

        const attempt = await Attempt.create({
            userId: req.user._id,
            quizId,
            assignmentId,
            answers: processedAnswers,
            score,
            totalQuestions: quiz.questions.length,
            timeTaken,
            tabViolations: tabViolations || 0
        });

        let allowReview = false;
        if (assignmentId) {
             const assignment = await Assignment.findById(assignmentId);
             allowReview = assignment?.allowReview || false;
        }

        // Generate AI feedback but don't block the submit request forever
        const feedback = await generateFeedback(processedAnswers, quiz.title);

        res.status(201).json({ 
            message: 'Quiz submitted successfully', 
            attempt,
            feedback,
            allowReview,
            accuracy: (score / quiz.questions.length) * 100,
            recommendedDifficulty: (score / quiz.questions.length) >= 0.8 ? 'Hard' : (score / quiz.questions.length) >= 0.5 ? 'Medium' : 'Easy'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getQuizDetails = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        
        // Don't send exact correct answers immediately if we want to secure it, but for evaluation it's okay since the frontend will display it after completion.
        res.json(quiz); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
