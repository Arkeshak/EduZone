import AppRouter from '@/routes/AppRouter'; // Central routing configuration
import { Toaster } from 'sonner'; // Global notification system

/**
 * ROOT APPLICATION COMPONENT
 * 
 * Purpose: Acts as the top-level container for the entire React app.
 * It loads the router and the notification system.
 */
export default function App() {
    return (
        <>
            {/* Main routing logic (Auth, Role-based pages) */}
            <AppRouter />

            {/* Global toast notification system (Success/Error messages) */}
            <Toaster position="top-right" />
        </>
    );
}
