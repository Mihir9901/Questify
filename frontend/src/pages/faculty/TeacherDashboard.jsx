import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Upload, FileText, CheckCircle, Target, Users, BarChart3, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import AnalyticsView from './components/AnalyticsView';
import QuizEditor from './components/QuizEditor';

const TeacherDashboard = () => {
    const [file, setFile] = useState(null);
    const [textInput, setTextInput] = useState('');
    const [title, setTitle] = useState('');
    const [materials, setMaterials] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [materialLoading, setMaterialLoading] = useState(false);
    
    // Quiz Generation State
    const [selectedMaterial, setSelectedMaterial] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [numQuestions, setNumQuestions] = useState(5);

    // Analytics & UI State
    const [analytics, setAnalytics] = useState(null);
    const [expandedQuizId, setExpandedQuizId] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [matRes, quizRes, statRes] = await Promise.all([
                api.get('/teacher/materials'),
                api.get('/teacher/quizzes'),
                api.get('/analytics/teacher')
            ]);
            setMaterials(matRes.data);
            setQuizzes(quizRes.data);
            setAnalytics(statRes.data);
            if (matRes.data.length > 0) setSelectedMaterial(matRes.data[0]._id);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file && !textInput.trim()) return;

        setMaterialLoading(true);
        const formData = new FormData();
        if (file) formData.append('file', file);
        if (textInput.trim()) formData.append('text', textInput.trim());
        formData.append('title', title || (file ? file.name : 'Pasted Text'));

        try {
            await api.post('/teacher/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFile(null);
            setTextInput('');
            setTitle('');
            fetchDashboardData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error uploading file');
        } finally {
            setMaterialLoading(false);
        }
    };

    const handleGenerateQuiz = async (e) => {
        e.preventDefault();
        if (!selectedMaterial) return alert('Select a material');
        
        setLoading(true);
        try {
            await api.post('/teacher/generate', {
                materialId: selectedMaterial,
                difficulty,
                limit: numQuestions
            });
            alert('Quiz generated successfully!');
            fetchDashboardData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error generating quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (quizId) => {
        const allowReview = window.confirm("Allow students to review which answers they marked wrong at the end of the quiz?");
        try {
            await api.post('/teacher/assign', {
                quizId,
                assignedTo: [], // Empty array = assign to all class conceptually, you can add user selection later
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                allowReview
            });
            alert('Quiz assigned to all students!');
        } catch (error) {
            alert('Error assigning quiz');
        }
    };

    const handleQuizAction = async (quizId, questionId, action, questionData) => {
        try {
            await api.put(`/teacher/quiz/${quizId}/question/${questionId || 'new'}`, { action, questionData });
            fetchDashboardData();
        } catch (e) {
            alert("Failed to edit question: " + (e.response?.data?.message || e.message));
        }
    };

    return (
        <div className="min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-2">Teacher Dashboard</h1>
                    <p className="text-textMuted">Manage materials, generate AI quizzes, and track student performance.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Upload & Generate */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Upload Section */}
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <Upload className="text-primary w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-semibold">Upload Material</h2>
                            </div>
                            
                            <form onSubmit={handleUpload} className="space-y-4">
                                <input 
                                    type="text" 
                                    placeholder="Document Title (Optional)" 
                                    className="input-field w-full"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative border-2 border-dashed border-white/20 rounded-xl p-8 hover:border-primary/50 transition-colors text-center cursor-pointer bg-surface/30">
                                        <input 
                                            type="file" 
                                            accept=".pdf,.docx,.pptx,.txt" 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => setFile(e.target.files[0])}
                                            title="Upload Document"
                                        />
                                        <FileText className="w-8 h-8 mx-auto text-textMuted mb-3" />
                                        <p className="text-xs font-medium text-white break-words">{file ? file.name : 'Upload file'}</p>
                                    </div>
                                    <div className="h-full">
                                        <textarea
                                            placeholder="Or paste text here..."
                                            className="input-field w-full h-[120px] resize-none text-sm"
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button type="submit" disabled={(!file && !textInput.trim()) || materialLoading} className="btn-primary w-full flex justify-center items-center gap-2">
                                    {materialLoading ? 'Uploading to Platform...' : 'Upload & Process'}
                                </button>
                            </form>
                        </div>

                        {/* Generate Quiz Section */}
                        <div className="glass-card p-6 border-t-4 border-t-secondary">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-secondary/20 rounded-lg">
                                    <Target className="text-secondary w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-semibold">AI Quiz Generator</h2>
                            </div>
                            <form onSubmit={handleGenerateQuiz} className="space-y-4">
                                <div>
                                    <label className="text-sm text-textMuted mb-1 flex">Select Material</label>
                                    <select 
                                        className="input-field appearance-none"
                                        value={selectedMaterial}
                                        onChange={(e) => setSelectedMaterial(e.target.value)}
                                        disabled={materials.length === 0}
                                    >
                                        <option value="" disabled>
                                            {materials.length === 0 ? 'Upload a PDF above first ⬆️' : 'Select PDF...'}
                                        </option>
                                        {materials.map(m => (
                                            <option key={m._id} value={m._id} className="bg-surface">{m.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-sm text-textMuted mb-1 flex">Difficulty</label>
                                        <select 
                                            className="input-field appearance-none"
                                            value={difficulty}
                                            onChange={(e) => setDifficulty(e.target.value)}
                                        >
                                            <option value="Easy" className="bg-surface">Easy</option>
                                            <option value="Medium" className="bg-surface">Medium</option>
                                            <option value="Hard" className="bg-surface">Hard</option>
                                        </select>
                                    </div>
                                    <div className="w-24">
                                        <label className="text-sm text-textMuted mb-1 flex">Q-Count</label>
                                        <input 
                                            type="number" 
                                            min="1" max="20"
                                            value={numQuestions}
                                            onChange={(e) => setNumQuestions(Number(e.target.value))}
                                            className="input-field" 
                                        />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading || materials.length === 0} className="w-full py-3 rounded-lg bg-gradient-to-r from-secondary to-primary text-white font-medium hover:opacity-90 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-50">
                                    {loading ? 'AI is thinking...' : 'Generate AI Quiz'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Analytics & Quizzes */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Analytics Overview */}
                        <AnalyticsView />

                        {/* Quizzes List & Assignment */}
                        <div className="glass-card p-6 h-full min-h-[400px]">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary" /> Generated Quizzes
                            </h2>
                            {quizzes.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 h-full border-2 border-dashed border-white/10 rounded-xl">
                                    <p className="text-textMuted">No quizzes generated yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {quizzes.map(quiz => (
                                        <div key={quiz._id} className="rounded-xl bg-surface/50 border border-white/5 hover:bg-surface transition-colors group overflow-hidden flex flex-col">
                                            <div 
                                                className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer" 
                                                onClick={() => setExpandedQuizId(expandedQuizId === quiz._id ? null : quiz._id)}
                                            >
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-lg flex items-center gap-2">
                                                        {expandedQuizId === quiz._id ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-textMuted group-hover:text-primary transition-colors" />}
                                                        {quiz.title}
                                                    </h3>
                                                    <div className="flex gap-3 text-sm mt-1 text-textMuted ml-7">
                                                        <span className="flex items-center gap-1">
                                                            <span className={`w-2 h-2 rounded-full ${quiz.difficulty === 'Easy' ? 'bg-green-400' : quiz.difficulty === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'}`}></span>
                                                            {quiz.difficulty}
                                                        </span>
                                                        <span>• {quiz.questions.length} questions</span>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleAssign(quiz._id); }}
                                                    className="btn-secondary whitespace-nowrap opacity-100 sm:opacity-70 group-hover:opacity-100 z-10"
                                                >
                                                    Assign to Class
                                                </button>
                                            </div>
                                            
                                            {/* Expandable Editor Section */}
                                            {expandedQuizId === quiz._id && (
                                                <div className="p-6 pt-4 border-t border-white/5 bg-surface/30 animation-fade-in">
                                                    <h4 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                                                        <Target className="w-4 h-4" /> AI Question Editor
                                                    </h4>
                                                    <QuizEditor 
                                                        quiz={quiz} 
                                                        onUpdateItem={(qId, action, data) => handleQuizAction(quiz._id, qId, action, data)} 
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
