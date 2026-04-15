import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { LogOut, BookOpen, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center text-white">
            <Link to={user ? (['faculty', 'teacher'].includes(user.role?.toLowerCase()) ? '/teacher' : '/student') : '/'} className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white hover:text-primary transition-colors">
                <BookOpen className="text-primary w-8 h-8" />
                Questify
            </Link>
            
            {user ? (
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-primary to-secondary w-10 h-10 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(99,102,241,0.3)] border border-white/10 hidden sm:flex">
                            <span className="text-white font-bold text-lg shadow-sm">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex flex-col text-sm">
                            <span className="text-textMuted text-xs font-medium tracking-wider uppercase">{user.role}</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-textMuted hover:text-red-400 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            ) : (
                <div className="flex gap-4">
                    <Link to="/login" className="btn-secondary">Login</Link>
                    <Link to="/register" className="btn-primary">Register</Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
