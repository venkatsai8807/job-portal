import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import JobListing from './pages/JobListing';
import JobDetail from './pages/JobDetail';
import MyApplications from './pages/MyApplications';
import RecruiterDashboard from './pages/RecruiterDashboard';
import SeekerDashboard from './pages/SeekerDashboard';

// Dashboard router (role-aware)
const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'recruiter' ? <RecruiterDashboard /> : <SeekerDashboard />;
};

const AppLayout = () => (
  <div className="app-layout">
    <Navbar />
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/jobs" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/jobs" element={<JobListing />} />
      <Route path="/jobs/:id" element={<JobDetail />} />

      {/* Protected - both roles */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />

      {/* Protected - seeker only */}
      <Route
        path="/my-applications"
        element={
          <ProtectedRoute role="seeker">
            <MyApplications />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/jobs" replace />} />
    </Routes>
  </div>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#f0f0ff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#00d9a6', secondary: '#0a0a14' },
          },
          error: {
            iconTheme: { primary: '#ff4d6d', secondary: '#0a0a14' },
          },
        }}
      />
      <AppLayout />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
