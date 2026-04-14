import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './context/useAuthStore';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/AdminDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import MemberDashboard from './pages/MemberDashboard';
import Members from './pages/Members';
import Trainers from './pages/Trainers';
import Plans from './pages/Plans';
import Payments from './pages/Payments';
import Attendance from './pages/Attendance';

// Role-based Protected route wrapper
function RoleProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If not authorized for this specific dashboard, redirect them to their rightful home
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'trainer') return <Navigate to="/trainer-dashboard" replace />;
    return <Navigate to="/member-dashboard" replace />;
  }
  return children;
}

// Public route (redirect to specific dashboard if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user?.role === 'trainer') return <Navigate to="/trainer-dashboard" replace />;
    return <Navigate to="/member-dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } 
        }} 
      />
      <BrowserRouter>
        <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Dashboards */}
        <Route
          path="/admin-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/trainer-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['admin', 'trainer']}>
              <TrainerDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/member-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['admin', 'member']}>
              <MemberDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Protected Modules (Admin mostly) */}
        <Route
          path="/members"
          element={
            <RoleProtectedRoute allowedRoles={['admin', 'trainer']}>
              <Members />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/trainers"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <Trainers />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/plans"
          element={
            <RoleProtectedRoute allowedRoles={['admin', 'member']}>
              <Plans />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <Payments />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <RoleProtectedRoute allowedRoles={['admin', 'trainer']}>
              <Attendance />
            </RoleProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
