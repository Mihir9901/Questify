import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { User, Mail, Lock, Settings } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Student' });
    const { register, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await register(formData.name, formData.email, formData.password, formData.role);
        if (success) {
            const currentUser = useAuthStore.getState().user;
            if (currentUser?.role === 'Faculty' || currentUser?.role === 'Teacher') navigate('/teacher');
            else navigate('/student');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
            {/* Background elements */}
            <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]"></div>

            <div className="glass-card p-8 w-full max-w-md z-10 mx-4">
                <div className="flex flex-col items-center mb-6">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Create Account</h2>
                    <p className="text-textMuted mt-2 text-center text-sm">Join Questify and start learning dynamically</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="Full Name"
                            className="input-field pl-12"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="relative group">
                        <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" />
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="Email address"
                            className="input-field pl-12"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="relative group">
                        <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" />
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="Password"
                            className="input-field pl-12"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="relative group">
                        <Settings className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" />
                        <select 
                            name="role"
                            className="input-field pl-12 appearance-none cursor-pointer"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="Student" className="bg-surface text-white">Student</option>
                            <option value="Faculty" className="bg-surface text-white">Faculty</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="btn-primary w-full py-3 mt-4 disabled:opacity-50"
                    >
                        {isLoading ? 'Creating Account...' : 'Register'}
                    </button>
                    
                    <p className="text-textMuted text-center mt-6 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:text-secondary underline transition-colors">
                            Sign In
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
