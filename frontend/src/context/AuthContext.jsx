import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, getRefreshToken, setToken as saveToken, setRefreshToken as saveRefreshToken, removeToken, getUserRole, getUserInfo, isTokenValid, isTokenExpiring } from '@/utils/tokenHelper';
import client from '@/services/apiClient';

/**
 * AUTHENTICATION CONTEXT
 * 
 * Purpose: Global state for authentication across entire React app
 * Without Context: Would need to pass auth state through many components (prop drilling)
 * With Context: Any component can access auth state via useAuth() hook
 * 
 * State managed:
 * - user: Logged-in user data
 * - role: User's role (teacher, principal, zeo, donor)
 * - loading: True while checking if user is logged in
 * - isRefreshing: True while token refresh is in progress
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  {/* 
    STATE VARIABLES
    
    All authentication state that needs to be accessible across the entire app:
    
    user (Object | null):
    - Contains logged-in user's data
    - Structure: { id, name, email, school, ... }
    - Set to null when not logged in
    - Used for: Displaying user info, accessing user properties
    
    role (String | null):
    - User's role in system
    - Values: 'teacher', 'principal', 'zeo', 'donor'
    - Set to null when not logged in
    - Used for: Role-based routing, conditional rendering, access control
    
    loading (Boolean):
    - True while app is checking if user has existing token on startup
    - Used for: Showing splash screen while restoring session
    - Prevents showing login page for 1-2 seconds
    
    isRefreshing (Boolean):
    - True while token refresh is in progress
    - Used for: Preventing duplicate refresh requests
    - Prevents race conditions when multiple API calls trigger refresh
  */}
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * EFFECT 1: PROACTIVE TOKEN REFRESH
   * 
   * Purpose: Every 60 seconds, check if token is expiring soon
   * If expiring within 5 minutes, refresh it NOW before it expires
   * 
   * Benefits:
   * - User never sees "token expired" error during normal use
   * - Seamless background token management
   * - Better UX
   * 
   * How it works:
   * 1. Every 60 seconds, timer fires
   * 2. Check: Does token exist? Will it expire within 5 minutes?
   * 3. If YES: Call /auth/refresh to get new token
   * 4. If refresh succeeds: Save new token, continue working
   * 5. If refresh fails: Force logout (token unrecoverable)
   */
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      const token = getToken();
      const refreshToken = getRefreshToken();

      // ✅ Check if token exists and is expiring soon (within 5 minutes)
      if (token && refreshToken && isTokenExpiring(token, 5)) {
        // ✅ Prevent multiple simultaneous refresh attempts
        if (!isRefreshing) {
          try {
            setIsRefreshing(true);  // Mark refresh in progress

            // ✅ Call refresh endpoint to get new token
            const response = await client.post('/auth/refresh', { refreshToken });

            // ✅ Save new access token
            if (response.data.token) {
              saveToken(response.data.token);

              // ✅ Also save new refresh token (if server rotated it)
              if (response.data.refreshToken) {
                saveRefreshToken(response.data.refreshToken);
              }
            }
          } catch (err) {
            // ✅ Refresh failed (e.g., refresh token expired)
            console.error('Proactive token refresh failed:', err);
            handleLogout();  // Force user to login again
          } finally {
            setIsRefreshing(false);  // Mark refresh complete
          }
        }
      }
    }, 60000);  // ✅ Run every 60 seconds (60,000 ms)

    // ✅ Cleanup: Stop timer when component unmounts
    return () => clearInterval(refreshInterval);
  }, [isRefreshing]);

  /**
   * EFFECT 2: CHECK FOR EXISTING TOKEN ON APP LOAD
   * 
   * Purpose: When app first opens, check if user is already logged in
   * Scenario: User closed browser, came back later (token still in localStorage)
   * 
   * Flow:
   * 1. Get token from localStorage
   * 2. Check if token is still valid (not expired)
   * 3. If valid: Decode it to get user data
   * 4. If invalid: Leave user logged out
   * 5. Set loading to false (done checking)
   */
  const refreshUser = async () => {
    try {
      const response = await client.get('/auth/me');
      if (response.data) {
        // Map fullName to name for backward compatibility
        const userData = {
          ...response.data,
          name: response.data.fullName || response.data.name
        };
        setUser(userData);
        return userData;
      }
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token && isTokenValid()) {
        const userInfo = getUserInfo();
        const userRole = getUserRole();
        setUser(userInfo);
        setRole(userRole);
        
        // Background refresh to get fresh data (like profile picture)
        await refreshUser();
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  /**
   * LOGIN FUNCTION
   * 
   * Purpose: Store login credentials and update global auth state
   * Called: After successful login/registration API response
   * 
   * Input Parameter:
   * - loginResponse: Either string OR object
   *   - String: Just the access token (backward compat)
   *   - Object: { token: "access_token", refreshToken: "refresh_token" }
   * 
   * Flow:
   * 1. Extract tokens from parameter (handle both formats)
   * 2. Save access token to localStorage
   *    - Used for all API requests
   *    - Passed in Authorization header
   * 3. Save refresh token to localStorage
   *    - Used only to get new access token
   *    - Kept in secure storage
   * 4. Decode token to extract user info
   *    - getName() - extract from JWT payload
   *    - getRole() - extract from JWT payload
   * 5. Update context state
   *    - Makes auth info available to all components
   *    - Triggers re-render of components using useAuth()
   * 
   * After login, user can:
   * - Make authenticated API requests
   * - Access protected routes
   * - See personalized dashboards
   */
  const login = (loginResponse) => {
    // Handle both string token and object with tokens
    const token = typeof loginResponse === 'string' ? loginResponse : loginResponse.token;
    const refreshToken = typeof loginResponse === 'object' ? loginResponse.refreshToken : null;

    // Save access token to localStorage
    if (token) {
      saveToken(token);
    }

    // Save refresh token to localStorage (if provided)
    if (refreshToken) {
      saveRefreshToken(refreshToken);
    }

    // Decode token to get user info
    const userInfo = getUserInfo();
    const userRole = getUserRole();

    // Update context state
    // Map fullName to name for backward compatibility
    const userData = {
      ...userInfo,
      name: userInfo.fullName || userInfo.name
    };
    setUser(userData);
    setRole(userRole);
  };

  /**
   * LOGOUT FUNCTION
   * 
   * Purpose: Clear user session completely
   * Called when: User clicks logout button, refresh token expires, or permission revoked
   * 
   * Process:
   * 1. Send logout signal to backend (optional)
   *    - Clears server-side session data
   *    - Logs the logout event
   *    - Even if this fails, continue with local cleanup
   * 
   * 2. Clear all tokens from localStorage
   *    - Access token removed
   *    - Refresh token removed
   *    - Tokens no longer valid for API calls
   * 
   * 3. Clear all user state
   *    - user = null (no user data)
   *    - role = null (no role)
   *    - isRefreshing = false (stop any pending refresh)
   * 
   * 4. Redirect to login page
   *    - User must login again to access app
   *    - Next API call will get 401 (no token) and redirect here
   * 
   * Error Handling:
   * - Even if backend logout fails (network error, etc.)
   * - Local cleanup still happens
   * - User is still logged out locally
   */
  const handleLogout = async () => {
    try {
      // ✅ Try to notify backend about logout
      await client.post('/auth/logout');
    } catch (err) {
      // ✅ If backend call fails, still logout locally
      console.error('Logout API failed', err);
    } finally {
      // ✅ Always perform local cleanup (even if backend fails)

      // Clear all tokens from localStorage
      removeToken();

      // Clear all user state
      setUser(null);
      setRole(null);
      setIsRefreshing(false);

      // Redirect to login page
      navigate('/login');
    }
  };

  /**
   * CONTEXT VALUE OBJECT
   * 
   * What we expose to all child components via useAuth() hook:
   * 
   * user (Object | null):
   * - Logged-in user's data
   * - Null if not authenticated
   * - Contains: id, name, email, school, profilePicture, etc.
   * - Used in: Dashboards, profile pages, to display user info
   * 
   * role (String | null):
   * - User's role in system
   * - Values: 'teacher', 'principal', 'zeo', 'donor'
   * - Null if not authenticated
   * - Used in: Role-based conditional rendering, ProtectedRoute
   * 
   * loading (Boolean):
   * - True while app is initializing (checking for existing token)
   * - Used in: Prevents showing login form during startup
   * - Typically shows splash screen or loading spinner
   * 
   * login (Function):
   * - Called after successful authentication
   * - Parameter: { token, refreshToken }
   * - Updates user, role, tokens in storage
   * 
   * logout (Function):
   * - Called to end user session
   * - Clears all tokens and user data
   * - Redirects to login page
   * 
   * isAuthenticated (Boolean):
   * - Computed: true if user AND role are not null
   * - Shorthand for: !!user && !!role
   * - Used in: ProtectedRoute, conditional navigation
   * 
   * isRefreshing (Boolean):
   * - True while token refresh is in progress
   * - Used in: apiClient to queue requests during refresh
   * - Prevents duplicate refresh attempts
   */
  const value = {
    user,
    role,
    loading,
    login,
    logout: handleLogout,
    refreshUser,
    isAuthenticated: !!user && !!role,
    isRefreshing,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * USEAUTH HOOK
 * 
 * Purpose: Convenient way to access authentication context in any component
 * 
 * Usage Examples:
 * - Get user: const { user } = useAuth();
 * - Get role: const { role } = useAuth();
 * - Logout: const { logout } = useAuth();
 * - Check loading: const { loading } = useAuth();
 * - All: const { user, role, logout, loading, isAuthenticated } = useAuth();
 * 
 * Returns: {
 *   user: Object | null,
 *   role: String | null,
 *   loading: Boolean,
 *   login: Function,
 *   logout: Function,
 *   isAuthenticated: Boolean,
 *   isRefreshing: Boolean
 * }
 * 
 * Where to use:
 * - Protected pages (check if user is authenticated)
 * - Dashboards (display user info)
 * - Navigation bars (show logout button if logged in)
 * - Any component that needs auth state
 * 
 * Error Handling:
 * - Throws error if used outside AuthProvider
 * - Helps catch configuration mistakes during development
 * - Error message: "useAuth must be used within an AuthProvider"
 * - Means: App.jsx is not wrapped with <AuthProvider> or similar config issue
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  // Verify we're inside AuthProvider
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
