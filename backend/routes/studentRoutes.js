import express from 'express';
import { getAssignedQuizzes, submitQuiz, getQuizDetails } from '../controllers/studentController.js';
import { protect, studentOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/assigned', protect, studentOnly, getAssignedQuizzes);
router.post('/submit', protect, studentOnly, submitQuiz);

// Get quiz details to attempt
router.get('/:quizId', protect, studentOnly, getQuizDetails);

export default router;
