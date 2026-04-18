/**
 * PROTECTED ROUTE COMPONENT
 * 
 * File Purpose: Middleware component that guards routes requiring authentication
 * Used for: Preventing unauthorized access to protected pages
 * 
 * Functionality:
 * - Checks if user is authenticated (logged in)
 * - Shows loading spinner while checking auth status
 * - Redirects to login if not authenticated
 * - Checks if user has required role
 * - Redirects to /unauthorized if user lacks permission
 * 
 * Usage:
 * <ProtectedRoute allowedRoles={['TEACHER', 'PRINCIPAL']}>
 *   <TeacherDashboard />
 * </ProtectedRoute>
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
