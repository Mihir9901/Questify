import express from 'express';
import { getTeacherAnalytics, getStudentAnalytics } from '../controllers/analyticsController.js';
import { protect, facultyOnly, studentOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/teacher', protect, facultyOnly, getTeacherAnalytics);
router.get('/student', protect, studentOnly, getStudentAnalytics);

export default router;
