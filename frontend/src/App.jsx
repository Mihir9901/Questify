import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import TeacherDashboard from './pages/faculty/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import AttemptQuiz from './pages/student/AttemptQuiz';
import Navbar from './components/Navbar';
import useAuthStore from './store/authStore';

function App() {
  const { user } = useAuthStore();

  const ProtectedRoute = ({ children, role }) => {
    if (!user) return <Navigate to="/login" />;
    const normalizedUserRole = ['faculty', 'teacher'].includes(user.role?.toLowerCase()) ? 'faculty' : user.role?.toLowerCase();
    if (role && normalizedUserRole !== role.toLowerCase()) return <Navigate to="/" />;
    return children;
  };

  return (
    <Router>
      <div className="min-h-screen bg-background text-textMain selection:bg-primary/30">
        <Navbar />
        <main className="relative">
          <Routes>
            <Route path="/" element={<Navigate to={user ? (user.role?.toLowerCase() === 'admin' ? '/admin' : ['faculty', 'teacher'].includes(user.role?.toLowerCase()) ? '/teacher' : '/student') : '/login'} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={
              <ProtectedRoute role="Admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/teacher" element={
              <ProtectedRoute role="Faculty">
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/student" element={
              <ProtectedRoute role="Student">
                <StudentDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/attempt/:id" element={
              <ProtectedRoute role="Student">
                <AttemptQuiz />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
