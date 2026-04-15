import { User, Shield, Activity } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const AdminDashboard = () => {
    const { user } = useAuthStore();

    return (
        <div className="max-w-7xl mx-auto p-6 animate-fade-in relative">
            <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        Admin Dashboard
                    </h1>
                    <p className="text-textMuted mt-1">Platform overview and user management.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-primary hover:translate-y-[-2px] transition-transform">
                    <div className="bg-primary/20 p-3 rounded-xl border border-primary/30 text-primary">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-textMuted text-sm font-medium">Total Users</p>
                        <h3 className="text-2xl font-bold">---</h3>
                    </div>
                </div>
                
                <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-secondary hover:translate-y-[-2px] transition-transform">
                    <div className="bg-secondary/20 p-3 rounded-xl border border-secondary/30 text-secondary">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-textMuted text-sm font-medium">Active Quizzes</p>
                        <h3 className="text-2xl font-bold">---</h3>
                    </div>
                </div>

                <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-green-500 hover:translate-y-[-2px] transition-transform">
                    <div className="bg-green-500/20 p-3 rounded-xl border border-green-500/30 text-green-500">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-textMuted text-sm font-medium">System Role</p>
                        <h3 className="text-2xl font-bold">{user?.role}</h3>
                    </div>
                </div>
            </div>
            
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary"/> User Management
                </h2>
                <div className="text-textMuted p-8 text-center border border-dashed border-white/10 rounded-xl bg-surface">
                    Admin functionalities to be mapped here.
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
