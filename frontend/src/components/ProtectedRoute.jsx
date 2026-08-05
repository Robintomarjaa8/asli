import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, initialLoading } = useAuth();
  const location = useLocation();

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'seller') return <Navigate to="/seller/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;