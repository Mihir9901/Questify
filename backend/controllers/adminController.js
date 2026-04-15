import User from '../models/User.js';

export const getPlatformStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const teachers = await User.countDocuments({ role: { $in: ['Faculty', 'Teacher', 'faculty'] } });
        const students = await User.countDocuments({ role: 'Student' });

        res.json({
            totalUsers,
            teachers,
            students
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
