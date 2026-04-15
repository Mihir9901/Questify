import express from 'express';
import { uploadMaterial, generateQuiz, assignQuiz, getMyMaterials, getMyQuizzes, editQuizQuestion } from '../controllers/teacherController.js';
import { protect, facultyOnly } from '../middlewares/authMiddleware.js';
import { uploadPDF } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protect, facultyOnly, uploadPDF.single('file'), uploadMaterial);
router.post('/generate', protect, facultyOnly, generateQuiz);
router.post('/assign', protect, facultyOnly, assignQuiz);
router.put('/quiz/:quizId/question/:questionId', protect, facultyOnly, editQuizQuestion);

// Utility endpoints for Dashboard
router.get('/materials', protect, facultyOnly, getMyMaterials);
router.get('/quizzes', protect, facultyOnly, getMyQuizzes);

export default router;
