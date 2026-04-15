import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import api from '../../../services/api';
import { Activity, BookOpen, Users, TrendingUp } from 'lucide-react';

const AnalyticsView = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await api.get('/analytics/teacher');
                setAnalytics(data);
            } catch (error) {
                console.error("Error fetching analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="text-center py-10">Loading Analytics...</div>;
    if (!analytics) return <div className="text-center py-10">Failed to load analytics</div>;

    const diffData = Object.keys(analytics.difficultyDistribution).map(key => ({
        name: key,
        count: analytics.difficultyDistribution[key]
    }));

    // Mock trend data based on recent attempts for visualization
    const trendData = [...analytics.recentAttempts].reverse().map((att, i) => ({
        name: `T-${analytics.recentAttempts.length - i}`,
        score: Math.round((att.score / att.totalQuestions) * 100)
    }));

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Analytics Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 border-l-4 border-l-blue-500">
                    <div className="flex gap-3 items-center">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500"><BookOpen className="w-5 h-5"/></div>
                        <div>
                            <p className="text-textMuted text-xs font-bold uppercase">Total Quizzes</p>
                            <p className="text-xl font-bold">{analytics.totalQuizzes}</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-4 border-l-4 border-l-green-500">
                    <div className="flex gap-3 items-center">
                        <div className="p-2 bg-green-500/20 rounded-lg text-green-500"><Users className="w-5 h-5"/></div>
                        <div>
                            <p className="text-textMuted text-xs font-bold uppercase">Student Attempts</p>
                            <p className="text-xl font-bold">{analytics.totalStudentsAttempts}</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-4 border-l-4 border-l-purple-500">
                    <div className="flex gap-3 items-center">
                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-500"><Activity className="w-5 h-5"/></div>
                        <div>
                            <p className="text-textMuted text-xs font-bold uppercase">Avg Accuracy</p>
                            <p className="text-xl font-bold">{analytics.averageScore}%</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-4 border-l-4 border-l-orange-500">
                    <div className="flex gap-3 items-center">
                        <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500"><TrendingUp className="w-5 h-5"/></div>
                        <div>
                            <p className="text-textMuted text-xs font-bold uppercase">Recent Activity</p>
                            <p className="text-xl font-bold">{analytics.recentAttempts.length} submissions</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 min-h-[300px]">
                    <h3 className="text-lg font-bold mb-4">Class Accuracy Trend</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                            <XAxis dataKey="name" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" domain={[0, 100]} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }} />
                            <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-card p-6 min-h-[300px]">
                    <h3 className="text-lg font-bold mb-4">Quiz Difficulty Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={diffData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                            <XAxis dataKey="name" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }} cursor={{fill: '#ffffff0a'}}/>
                            <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-card p-6 flex flex-col max-h-[400px]">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">All Submissions</h3>
                {analytics.recentAttempts.length === 0 ? (
                    <p className="text-textMuted text-sm">No attempts across your classes.</p>
                ) : (
                    <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2">
                        {analytics.recentAttempts.map(att => (
                            <div key={att._id} className="flex justify-between items-center p-3 bg-surface border border-white/5 rounded-lg">
                                <div>
                                    <p className="font-medium text-white">{att.userId?.name || 'Unknown Student'}</p>
                                    <p className="text-xs text-textMuted">{att.quizId?.title}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${att.score/att.totalQuestions > 0.7 ? 'text-green-500' : 'text-yellow-500'}`}>
                                        {Math.round((att.score / att.totalQuestions) * 100)}%
                                    </p>
                                    <p className="text-xs text-textMuted">Violations: {att.tabViolations || 0}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsView;
