import { Navigate, useLocation } from 'react-router-dom'; // Core routing tools
import { useAuth } from '@/context/AuthContext'; // Access global auth state

/**
 * PROTECTED ROUTE COMPONENT
 * 
 * Purpose: Acts as a "Security Guard" for private dashboard pages.
 * It checks if the user is logged in and if they have the correct role.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  // Extract user info and loading state from context
  const { user, role, loading } = useAuth();
  const location = useLocation(); // To remember where user was trying to go

  // While app is still checking for existing session
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // REDIRECT 1: If user is not logged in, send them back to login page
  if (!user || !role) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // REDIRECT 2: If user role doesn't match page permissions, send to Unauthorized
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // SUCCESS: Show the requested page
  return children;
};

export default ProtectedRoute;
