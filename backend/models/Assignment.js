import mongoose from 'mongoose';

const AssignmentSchema = new mongoose.Schema({
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of student IDs
    startTime: { type: Date }, // Optional start time constraint
    endTime: { type: Date },   // Optional end time constraint (overrides dueDate if strict)
    dueDate: { type: Date, required: true },
    allowReview: { type: Boolean, default: false }, // Allow students to review wrong answers
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Assignment', AssignmentSchema);
