import Material from '../models/Material.js';
import Quiz from '../models/Quiz.js';
import Assignment from '../models/Assignment.js';
import { extractTextFromPDF, extractTextFromWord, extractTextFromPPT } from '../services/documentService.js';
import { extractConcepts, generateQuizFromContent, regenerateSingleQuestion } from '../services/aiService.js';

export const uploadMaterial = async (req, res) => {
    try {
        let extractedContent = '';
        let fileType = 'text';

        // Check if file is uploaded
        if (req.file) {
            const ext = req.file.originalname.split('.').pop().toLowerCase();
            if (ext === 'pdf') {
                extractedContent = await extractTextFromPDF(req.file.buffer);
                fileType = 'pdf';
            } else if (ext === 'docx') {
                extractedContent = await extractTextFromWord(req.file.buffer);
                fileType = 'docx';
            } else if (ext === 'pptx') {
                extractedContent = await extractTextFromPPT(req.file.buffer);
                fileType = 'pptx';
            } else {
                return res.status(400).json({ message: 'Unsupported file format' });
            }
        } else if (req.body.text) {
            extractedContent = req.body.text;
        } else {
            return res.status(400).json({ message: 'No file or text provided' });
        }

        const material = await Material.create({
            teacherId: req.user._id,
            title: req.body.title || 'Untitled Material',
            fileType,
            extractedContent
        });

        res.status(201).json({ message: 'Material uploaded successfully', material });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const generateQuiz = async (req, res) => {
    const { materialId, difficulty, limit = 5 } = req.body;

    try {
        const material = await Material.findById(materialId);
        if (!material) return res.status(404).json({ message: 'Material not found' });

        if (material.teacherId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to use this material' });
        }

        // Module 2: Extract Concepts
        console.log("Extracting Concepts from Material...");
        const concepts = await extractConcepts(material.extractedContent);

        // Module 3: Generate Quiz
        console.log("Generating Quiz from Concepts...");
        
        let finalQuestions = [];
        if (difficulty === 'Adaptive') {
            const easyQ = await generateQuizFromContent(concepts, 'Easy', limit);
            const medQ = await generateQuizFromContent(concepts, 'Medium', limit);
            const hardQ = await generateQuizFromContent(concepts, 'Hard', limit);
            finalQuestions = [...easyQ, ...medQ, ...hardQ];
        } else {
            finalQuestions = await generateQuizFromContent(concepts, difficulty, limit);
        }

        const quiz = await Quiz.create({
            title: `Quiz on ${material.title} (${difficulty})`,
            difficulty,
            questions: finalQuestions,
            createdBy: req.user._id
        });

        res.status(201).json({ message: 'Quiz generated successfully', quiz });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating quiz: ' + error.message });
    }
};

export const assignQuiz = async (req, res) => {
    const { quizId, assignedTo, dueDate, allowReview } = req.body; // assignedTo is an array of student IDs

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        const assignment = await Assignment.create({
            quizId,
            assignedTo,
            dueDate,
            allowReview: allowReview || false,
            assignedBy: req.user._id
        });

        res.status(201).json({ message: 'Quiz assigned successfully', assignment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const editQuizQuestion = async (req, res) => {
    const { quizId, questionId } = req.params;
    const { action, questionData } = req.body; // action: 'update', 'delete', 'regenerate'

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz || quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Quiz not found or unauthorized' });
        }

        const qIndex = quiz.questions.findIndex(q => q._id.toString() === questionId);
        if (qIndex === -1 && action !== 'add') return res.status(404).json({ message: 'Question not found' });

        if (action === 'update') {
            quiz.questions[qIndex] = { ...quiz.questions[qIndex].toObject(), ...questionData };
        } else if (action === 'delete') {
            quiz.questions.splice(qIndex, 1);
        } else if (action === 'regenerate') {
            const materialId = req.body.materialId; // passed in if regenerating
            const material = await Material.findById(materialId);
            const concepts = await extractConcepts(material ? material.extractedContent : quiz.title);
            const newQ = await regenerateSingleQuestion(concepts, quiz.difficulty);
            quiz.questions[qIndex] = { ...newQ };
        } else if (action === 'add') {
            quiz.questions.push(questionData);
        }

        await quiz.save();
        res.json({ message: `Question ${action}d successfully`, quiz });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Also fetch teacher materials and quizzes for Dashboard support
export const getMyMaterials = async (req, res) => {
    try {
        const materials = await Material.find({ teacherId: req.user._id }).sort({ createdAt: -1 });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getMyQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
