import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Clock, CheckCircle, XCircle, ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';

const AttemptQuiz = () => {
    const { id: quizId } = useParams();
    const [searchParams] = useSearchParams();
    const assignmentId = searchParams.get('assignmentId');
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [startTime, setStartTime] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [tabViolations, setTabViolations] = useState(0);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const { data } = await api.get(`/student/${quizId}`);
                setQuiz(data);
                // Initialize answers array mapping to questions
                setAnswers(data.questions.map(q => ({
                    questionId: q._id,
                    selectedOption: null,
                    responseTime: 0,
                    questionStartTime: Date.now()
                })));
            } catch (error) {
                console.error(error);
                alert("Quiz not found");
                navigate('/student');
            }
        };
        fetchQuiz();
    }, [quizId, navigate]);

    // Timer, Tab Visibility, and Auto-submit logic
    useEffect(() => {
        if (!result) {
            const timer = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
                
                // If assignment endpoint provided endTime, check auto-submit
                if (quiz?.assignment?.endTime) {
                     const end = new Date(quiz.assignment.endTime).getTime();
                     if (Date.now() >= end) {
                         handleSubmit();
                     }
                }
            }, 1000);

            const handleVisibilityChange = () => {
                if (document.visibilityState === 'hidden') {
                    setTabViolations(prev => prev + 1);
                    alert("Warning: Tab switching is tracked. Return to the quiz immediately!");
                }
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
                clearInterval(timer);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }
    }, [startTime, result, quiz]);

    const handleOptionSelect = (option) => {
        const updatedAnswers = [...answers];
        const currentAns = updatedAnswers[currentQuestionIndex];
        
        currentAns.selectedOption = option;
        // Calculate response time for this individual action roughly
        currentAns.responseTime += Math.floor((Date.now() - currentAns.questionStartTime) / 1000);
        currentAns.questionStartTime = Date.now(); // reset sub-timer in case they change answer
        
        setAnswers(updatedAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            // Update question start time for the next question
            const updatedAnswers = [...answers];
            updatedAnswers[currentQuestionIndex + 1].questionStartTime = Date.now();
            setAnswers(updatedAnswers);
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            const updatedAnswers = [...answers];
            updatedAnswers[currentQuestionIndex - 1].questionStartTime = Date.now();
            setAnswers(updatedAnswers);
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        // Finalize last question time
        const updatedAnswers = [...answers];
        const currentAns = updatedAnswers[currentQuestionIndex];
        currentAns.responseTime += Math.floor((Date.now() - currentAns.questionStartTime) / 1000);

        if (updatedAnswers.some(a => a.selectedOption === null)) {
            const confirm = window.confirm("You have unanswered questions. Are you sure you want to submit?");
            if (!confirm) return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post('/student/submit', {
                quizId,
                assignmentId,
                answers: updatedAnswers,
                timeTaken: elapsedTime,
                tabViolations
            });
            setResult(res.data);
        } catch (error) {
            alert('Error submitting quiz');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!quiz) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

    const currentQuestion = quiz.questions[currentQuestionIndex];

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Results View
    if (result) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="glass-card max-w-2xl w-full p-8 text-center space-y-6">
                    <div className="inline-block p-4 bg-green-500/20 rounded-full mb-2 shadow-[0_0_20px_rgba(74,222,128,0.3)]">
                        <CheckCircle className="w-16 h-16 text-green-400" />
                    </div>
                    <h2 className="text-4xl font-bold text-white">Quiz Completed!</h2>

                    <div className="grid grid-cols-2 gap-4 my-8">
                        <div className="bg-surface/50 p-6 rounded-xl border border-white/10">
                            <p className="text-textMuted text-sm mb-1">Your Score</p>
                            <p className="text-4xl font-bold text-primary">{result.attempt.score} / {result.attempt.totalQuestions}</p>
                            <p className="text-xs text-textMuted mt-2">{Math.round(result.accuracy)}% Accuracy</p>
                        </div>
                        <div className="bg-surface/50 p-6 rounded-xl border border-white/10">
                            <p className="text-textMuted text-sm mb-1">Time Taken</p>
                            <p className="text-4xl font-bold text-secondary">{formatTime(result.attempt.timeTaken)}</p>
                        </div>
                    </div>

                    <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl text-left">
                        <h4 className="font-semibold text-primary flex items-center gap-2 mb-2"><BookOpen className="w-5 h-5"/> AI Feedback</h4>
                        <p className="text-sm text-textMuted leading-relaxed">
                            {result.feedback ? result.feedback : `Based on this performance, we recommend switching your study focus to [${result.recommendedDifficulty}] difficulty materials.`}
                        </p>
                    </div>

                    {result.allowReview && (
                        <div className="mt-8 text-left space-y-4">
                            <h4 className="font-semibold text-white mb-4 border-b border-white/10 pb-2">Review Answers</h4>
                            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                {result.attempt.answers.map((ans, idx) => {
                                    const question = quiz.questions.find(q => q._id === ans.questionId);
                                    if (!question) return null;
                                    return (
                                        <div key={idx} className={`p-4 rounded-xl border ${ans.isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                            <p className="text-white text-sm mb-2 font-medium">
                                                <span className="opacity-70 mr-2">{idx+1}.</span> 
                                                {question.question}
                                            </p>
                                            <div className="pl-6 space-y-1">
                                                <p className={`text-xs ${ans.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                    <span className="opacity-80">Your Answer:</span> {ans.selectedOption || '(Blank)'}
                                                </p>
                                                {!ans.isCorrect && (
                                                    <div className="mt-1">
                                                        <p className="text-xs text-green-400 font-medium">
                                                            <span className="opacity-80">Correct Answer:</span> {question.correctAnswer}
                                                        </p>
                                                        {question.explanation && (
                                                            <p className="text-xs text-textMuted mt-1 p-2 bg-surface/30 rounded border border-white/5">
                                                                <span className="text-primary font-semibold mr-1">Explanation:</span> 
                                                                {question.explanation}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <button className="btn-primary w-full mt-6" onClick={() => navigate('/student')}>
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Active Quiz View
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="glass-card max-w-3xl w-full flex flex-col min-h-[500px]">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-surface/30 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-white max-w-md truncate">{quiz.title}</h2>
                        <span className="text-xs font-semibold px-2 py-1 bg-surfaceHover rounded text-textMuted mt-1 inline-block">
                            Difficulty: {quiz.difficulty}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-mono text-xl bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
                        <Clock className="w-5 h-5" />
                        {formatTime(elapsedTime)}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-surfaceHover h-1.5">
                    <div 
                        className="bg-gradient-to-r from-primary to-secondary h-1.5 transition-all duration-300" 
                        style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                    ></div>
                </div>

                {/* Question Area */}
                <div className="p-8 flex-1 flex flex-col justify-center">
                    <span className="text-sm text-secondary font-semibold tracking-wider mb-2">QUESTION {currentQuestionIndex + 1} OF {quiz.questions.length}</span>
                    <h3 className="text-2xl font-medium text-white mb-8 leading-relaxed">
                        {currentQuestion.question}
                    </h3>
                    
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => {
                            const isSelected = answers[currentQuestionIndex].selectedOption === option;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(option)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                                        isSelected 
                                            ? 'bg-primary/20 border-primary border-l-4 shadow-[0_0_15px_rgba(99,102,241,0.2)] text-white' 
                                            : 'bg-surface/50 border-white/10 text-textMuted hover:bg-surfaceHover hover:text-white hover:border-white/20'
                                    }`}
                                >
                                    <span className="inline-block w-6 text-sm opacity-50">{String.fromCharCode(65 + idx)}.</span> 
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-white/10 bg-surface/30 rounded-b-2xl flex justify-between items-center">
                    <div className="flex gap-4">
                         <span className="text-textMuted text-sm">Tab Violations: <strong className="text-red-500">{tabViolations}</strong></span>
                    </div>

                    {currentQuestionIndex >= Math.min(quiz.questions.length - 1, 9) ? ( // limit to 10 questions for demo max if adaptive
                        <button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting}
                            className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium hover:opacity-90 transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                    ) : (
                        <button 
                            onClick={handleNext}
                            className="btn-primary flex items-center gap-2"
                        >
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttemptQuiz;
