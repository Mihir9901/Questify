import mongoose from 'mongoose';

const MaterialSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'text', 'docx', 'pptx'], required: true },
    extractedContent: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Material', MaterialSchema);
