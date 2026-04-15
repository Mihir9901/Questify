import mongoose from 'mongoose';

const AttemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }, // Optional, if linked to assignment
    answers: [{ 
        questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
        selectedOption: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
        responseTime: { type: Number, required: true } // in seconds
    }],
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    timeTaken: { type: Number, required: true }, // total time in seconds
    tabViolations: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Attempt', AttemptSchema);
