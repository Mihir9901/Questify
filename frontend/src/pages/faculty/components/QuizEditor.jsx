import React, { useState } from 'react';
import { Edit2, Save, Trash2, RefreshCw, X, Plus } from 'lucide-react';

const QuizEditor = ({ quiz, onSave, onUpdateItem }) => {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const startEdit = (q) => {
        setEditingId(q._id);
        setEditForm(q);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = (qId) => {
        onUpdateItem(qId, 'update', editForm);
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    Review & Edit Questions
                </h3>
            </div>
            
            {quiz.questions.map((q, index) => (
                <div key={q._id || index} className="glass-card p-6 flex flex-col gap-4 relative group">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {editingId !== q._id && (
                            <>
                                <button onClick={() => startEdit(q)} className="p-2 bg-primary/20 text-primary rounded border border-primary/30 hover:bg-primary hover:text-white transition-colors" title="Edit">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => onUpdateItem(q._id, 'regenerate')} className="p-2 bg-secondary/20 text-secondary rounded border border-secondary/30 hover:bg-secondary hover:text-white transition-colors" title="Regenerate">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                <button onClick={() => onUpdateItem(q._id, 'delete')} className="p-2 bg-red-500/20 text-red-500 rounded border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>

                    {editingId === q._id ? (
                        <div className="space-y-4 pr-12">
                            <div>
                                <label className="text-xs text-textMuted uppercase font-bold mb-1 block">Question</label>
                                <textarea 
                                    className="input-field w-full min-h-[80px]"
                                    value={editForm.question}
                                    onChange={e => setEditForm({...editForm, question: e.target.value})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {editForm.options.map((opt, i) => (
                                    <div key={i}>
                                        <label className="text-xs text-textMuted uppercase font-bold mb-1 block">Option {String.fromCharCode(65 + i)}</label>
                                        <input 
                                            type="text" 
                                            className="input-field w-full"
                                            value={opt}
                                            onChange={e => {
                                                const newOpts = [...editForm.options];
                                                newOpts[i] = e.target.value;
                                                setEditForm({...editForm, options: newOpts});
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-textMuted uppercase font-bold mb-1 block">Correct Answer (must match an option EXACTLY)</label>
                                    <input 
                                        type="text" 
                                        className="input-field w-full border-green-500/30 focus:border-green-500"
                                        value={editForm.correctAnswer}
                                        onChange={e => setEditForm({...editForm, correctAnswer: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-textMuted uppercase font-bold mb-1 block">Difficulty</label>
                                    <select 
                                        className="input-field w-full appearance-none"
                                        value={editForm.difficulty}
                                        onChange={e => setEditForm({...editForm, difficulty: e.target.value})}
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-textMuted uppercase font-bold mb-1 block">Explanation</label>
                                <textarea 
                                    className="input-field w-full min-h-[60px]"
                                    value={editForm.explanation}
                                    onChange={e => setEditForm({...editForm, explanation: e.target.value})}
                                />
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button onClick={() => saveEdit(q._id)} className="btn-primary flex items-center gap-2 py-2 px-6">
                                    <Save className="w-4 h-4" /> Save Changes
                                </button>
                                <button onClick={cancelEdit} className="px-6 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2">
                                    <X className="w-4 h-4" /> Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pr-12">
                            <div className="flex gap-3 items-start mb-4">
                                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/30">
                                    Q{index + 1}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${q.difficulty === 'Easy' ? 'bg-green-500/20 text-green-500 border-green-500/30' : q.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' : 'bg-red-500/20 text-red-500 border-red-500/30'}`}>
                                    {q.difficulty}
                                </span>
                            </div>
                            
                            <h4 className="text-lg font-medium mb-4">{q.question}</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                {q.options.map((opt, i) => (
                                    <div key={i} className={`p-3 rounded-lg border ${opt === q.correctAnswer ? 'bg-green-500/10 border-green-500/50' : 'bg-surface border-white/5'}`}>
                                        <span className="font-bold text-textMuted mr-2">{String.fromCharCode(65 + i)}</span> 
                                        {opt}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="bg-surface p-4 rounded-lg border border-white/5 text-sm">
                                <span className="font-bold text-secondary mr-2">Explanation:</span>
                                <span className="text-textMuted">{q.explanation}</span>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default QuizEditor;
