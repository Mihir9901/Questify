import express from 'express';
import { getPlatformStats, getAllUsers } from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware to protect admin routes
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role?.toLowerCase() === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an Admin' });
    }
};

router.use(protect, adminOnly);

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);

export default router;
