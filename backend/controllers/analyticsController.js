import Attempt from '../models/Attempt.js';
import Quiz from '../models/Quiz.js';

export const getTeacherAnalytics = async (req, res) => {
    try {
        // Find all quizzes created by this teacher
        const quizzes = await Quiz.find({ createdBy: req.user._id });
        const quizIds = quizzes.map(q => q._id);

        // Find all attempts for these quizzes
        const attempts = await Attempt.find({ quizId: { $in: quizIds } }).populate('userId', 'name email').populate('quizId', 'title difficulty');

        // Calculate averages
        const totalAttempts = attempts.length;
        const averageScore = totalAttempts > 0 ? attempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions) * 100, 0) / totalAttempts : 0;
        
        let difficultyDistribution = { Easy: 0, Medium: 0, Hard: 0 };
        quizzes.forEach(q => { difficultyDistribution[q.difficulty]++; });

        res.json({
            totalQuizzes: quizzes.length,
            totalStudentsAttempts: totalAttempts,
            averageScore: Math.round(averageScore),
            recentAttempts: attempts.sort((a, b) => b.createdAt - a.createdAt),
            difficultyDistribution
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStudentAnalytics = async (req, res) => {
    try {
        const attempts = await Attempt.find({ userId: req.user._id }).populate('quizId', 'title difficulty questions');

        if (attempts.length === 0) {
            return res.json({ accuracy: 0, totalQuizzes: 0, history: [] });
        }

        const totalScore = attempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions) * 100, 0);
        const accuracy = totalScore / attempts.length;

        // Weak topics detection (based on repeated wrong answers, approximated here)
        // Usually would map concept names, simple proxy is looking at lower scores.
        let recommendations = "Keep practicing!";
        if (accuracy < 50) recommendations = "Try more Easy quizzes to build concepts.";
        else if (accuracy >= 80) recommendations = "You're doing great! Try Hard quizzes.";

        // Prepare data for recharts
        const chartData = attempts.map(a => ({
            name: a.quizId.title,
            score: Math.round((a.score / a.totalQuestions) * 100),
            date: new Date(a.createdAt).toLocaleDateString()
        }));

        res.json({
            accuracy: Math.round(accuracy),
            totalQuizzes: attempts.length,
            history: chartData,
            recommendations
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
