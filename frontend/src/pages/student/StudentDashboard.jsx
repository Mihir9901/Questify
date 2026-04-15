import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, Target, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StudentDashboard = () => {
    const [assignments, setAssignments] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assignRes, statRes] = await Promise.all([
                api.get('/student/assigned'),
                api.get('/analytics/student')
            ]);
            setAssignments(assignRes.data);
            setAnalytics(statRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary mb-2">Student Dashboard</h1>
                    <p className="text-textMuted">View your assigned tasks and track learning progress.</p>
                </header>

                {analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="glass-card p-6 flex items-center gap-6">
                            <div className="p-4 bg-primary/20 rounded-2xl">
                                <Target className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <p className="text-textMuted text-sm">Overall Accuracy</p>
                                <p className="text-3xl font-bold">{analytics.accuracy}%</p>
                            </div>
                        </div>
                        <div className="glass-card p-6 flex items-center gap-6">
                            <div className="p-4 bg-secondary/20 rounded-2xl">
                                <CheckCircle className="w-8 h-8 text-secondary" />
                            </div>
                            <div>
                                <p className="text-textMuted text-sm">Quizzes Completed</p>
                                <p className="text-3xl font-bold">{analytics.totalQuizzes}</p>
                            </div>
                        </div>
                        <div className="glass-card p-6 flex items-center gap-6 border border-primary/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                            <div className="p-4 bg-green-500/20 rounded-2xl">
                                <BookOpen className="w-8 h-8 text-green-400" />
                            </div>
                            <div>
                                <p className="text-textMuted text-sm">AI Recommendation</p>
                                <p className="text-sm font-medium mt-1 text-white">{analytics.recommendations}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass-card p-6 min-h-[400px]">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-secondary" /> Assigned Tasks
                        </h2>
                        {assignments.length === 0 ? (
                            <p className="text-textMuted text-center py-12">Hooray! No pending assignments.</p>
                        ) : (
                            <div className="space-y-4">
                                {assignments.map(assignment => (
                                    <div key={assignment._id} className="p-4 rounded-xl bg-surface/50 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-surface transition-colors group">
                                        <div>
                                            <h3 className="font-medium text-lg">{assignment.quizId.title}</h3>
                                            <div className="flex gap-3 text-sm mt-1 text-textMuted">
                                                <span className={`px-2 py-[2px] rounded text-xs ${assignment.quizId.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : assignment.quizId.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {assignment.quizId.difficulty}
                                                </span>
                                                <span>• Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        {assignment.isCompleted ? (
                                            <span className="text-green-400 font-medium px-4 py-2 border border-green-400/30 rounded-lg bg-green-400/10 text-sm">
                                                Completed
                                            </span>
                                        ) : (
                                            <button 
                                                onClick={() => navigate(`/attempt/${assignment.quizId._id}?assignmentId=${assignment._id}`)}
                                                className="btn-primary whitespace-nowrap opacity-100 sm:opacity-80 group-hover:opacity-100"
                                            >
                                                Start Quiz
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="glass-card p-6 min-h-[400px]">
                        <h2 className="text-xl font-semibold mb-6">Performance Trend</h2>
                        {analytics?.history?.length > 1 ? (
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analytics.history.slice(-5)}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis dataKey="date" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" domain={[0, 100]} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                                        />
                                        <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-white/10 rounded-xl">
                                <p className="text-textMuted">Complete more quizzes to see trends!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
