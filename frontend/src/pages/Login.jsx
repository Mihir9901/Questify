import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Mail, Lock, User, GraduationCap } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error, user } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            const currentUser = useAuthStore.getState().user;
            if (currentUser?.role === 'Faculty' || currentUser?.role === 'Teacher') navigate('/teacher');
            else navigate('/student');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]"></div>

            <div className="glass-card p-8 w-full max-w-md z-10 mx-4">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary/20 p-4 rounded-full inline-block mb-4 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                        <GraduationCap className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Welcome Back</h2>
                    <p className="text-textMuted mt-2 text-center text-sm">Sign in to your Questify account</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative group">
                        <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" />
                        <input
                            type="email"
                            required
                            placeholder="Email address"
                            className="input-field pl-12"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <div className="relative group">
                        <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" />
                        <input
                            type="password"
                            required
                            placeholder="Password"
                            className="input-field pl-12"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="btn-primary w-full py-3 mt-4 disabled:opacity-50"
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                    
                    <p className="text-textMuted text-center mt-6 text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary hover:text-secondary underline transition-colors">
                            Register
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
