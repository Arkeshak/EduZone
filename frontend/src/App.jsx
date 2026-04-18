/**
 * MAIN APP COMPONENT
 * 
 * File Purpose: Root React component for entire EduZone application
 * Used for: Application entry point, global setup, toast notifications
 * 
 * What it does:
 * 1. Renders AppRouter (routing configuration)
 * 2. Sets up global Sonner toast notification system
 * 3. Wraps entire app with necessary providers (AuthProvider inside AppRouter)
 * 
 * Toast System (Sonner):
 * - Position: Top-right corner of screen
 * - Used for: Success messages, error alerts, notifications
 * - Global: Accessible from any component via: import { toast } from 'sonner'
 * 
 * Example toast usage in components:
 * import { toast } from 'sonner';
 * 
 * const handleSuccess = () => {
 *   toast.success('Operation completed!');
 * };
 * 
 * const handleError = () => {
 *   toast.error('Something went wrong!');
 * };
 * 
 * Structure:
 * App
 * ├── AppRouter (routes configuration)
 * │   ├── BrowserRouter (enables routing)
 * │   ├── AuthProvider (global auth state)
 * │   └── Routes (all page routes)
 * └── Toaster (notification system)
 * 
 * Key Points:
 * - This is a functional component (no state needed)
 * - AuthProvider is inside AppRouter to have access to router context
 * - Toaster must be global to work from any component
 * - No loading screens here (auth loading in ProtectedRoute or AuthContext)
 */

import AppRouter from '@/routes/AppRouter';
import { Toaster } from 'sonner';

/**
 * App Component - Root Entry Point
 * 
 * Renders:
 * 1. AppRouter - All routing and authentication
 * 2. Toaster - Global notification system
 * 
 * @returns JSX Fragment containing router and toaster
 */
export default function App() {
    return (
        <>
            {/* 
              APP ROUTER
              Purpose: Main routing configuration
              Contains: AuthProvider, all routes, protected route guards
              See: src/routes/AppRouter.jsx for complete route definitions
            */}
            <AppRouter />

            {/* 
              TOASTER NOTIFICATION SYSTEM
              Purpose: Global toast notifications
              Position: Top-right corner of screen
              Usage: import { toast } from 'sonner'; then call:
                - toast.success(message)
                - toast.error(message)
                - toast.loading(message)
                - toast.info(message)
              Styling: Uses Tailwind CSS configured in Sonner
            */}
            <Toaster position="top-right" />
        </>
    );
}
