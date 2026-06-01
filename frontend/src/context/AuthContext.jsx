import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, getRefreshToken, setToken as saveToken, setRefreshToken as saveRefreshToken, removeToken, getUserRole, getUserInfo, isTokenValid, isTokenExpiring } from '@/utils/tokenHelper';
import client from '@/services/apiClient'; // Central API client for the app

/**
 * AUTHENTICATION CONTEXT
 * 
 * Purpose: Provides a global state for the user's login status across all pages.
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // STATE: Current user profile data { name, email, school, etc. }
  const [user, setUser] = useState(null);
  
  // STATE: User's system role (teacher, principal, zeo, donor)
  const [role, setRole] = useState(null);
  
  // STATE: True while checking for an existing session on app startup
  const [loading, setLoading] = useState(true);
  
  // STATE: True while a background token refresh is in progress
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * PROACTIVE TOKEN REFRESH LOGIC
   * Runs every 60 seconds to check if token is about to expire.
   */
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      const token = getToken();
      const refreshToken = getRefreshToken();

      // If token is expiring within 5 minutes, refresh it now
      if (token && refreshToken && isTokenExpiring(token, 5)) {
        if (!isRefreshing) {
          try {
            setIsRefreshing(true); // Mark refresh start
            const response = await client.post('/auth/refresh', { refreshToken });

            if (response.data.token) {
              saveToken(response.data.token); // Save newest access token
              if (response.data.refreshToken) {
                saveRefreshToken(response.data.refreshToken); // Save newest refresh token
              }
            }
          } catch (err) {
            console.error('Proactive token refresh failed:', err);
            handleLogout(); // Session is lost; force logout
          } finally {
            setIsRefreshing(false); // Mark refresh end
          }
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(refreshInterval); // Cleanup timer on unmount
  }, [isRefreshing]);

  /**
   * REFRESH USER DATA
   * Fetches fresh user details from the backend.
   */
  const refreshUser = async () => {
    try {
      const response = await client.get('/auth/me');
      if (response.data) {
        // Normalizing data: mapping fullName to name for consistency
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

  /**
   * INITIAL AUTH CHECK
   * Runs when the app first loads. Checks for token in localStorage.
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token && isTokenValid()) {
        const userInfo = getUserInfo(); // Decode JWT payload
        const userRole = getUserRole(); // Extract role from JWT
        setUser(userInfo);
        setRole(userRole);
        
        // Background update to catch any profile changes (like new profile picture)
        await refreshUser();
      }
      setLoading(false); // Done checking auth status
    };
    initAuth();
  }, []);

  /**
   * LOGIN ACTION
   * Called after successful login API call. Stores tokens and sets state.
   */
  const login = (loginResponse) => {
    const token = typeof loginResponse === 'string' ? loginResponse : loginResponse.token;
    const refreshToken = typeof loginResponse === 'object' ? loginResponse.refreshToken : null;

    if (token) saveToken(token);
    if (refreshToken) saveRefreshToken(refreshToken);

    const userInfo = getUserInfo();
    const userRole = getUserRole();

    const userData = {
      ...userInfo,
      name: userInfo.fullName || userInfo.name
    };
    setUser(userData);
    setRole(userRole);
  };

  /**
   * LOGOUT ACTION
   * Clears all tokens and redirects user to the login page.
   */
  const handleLogout = async () => {
    try {
      await client.post('/auth/logout'); // Notify server (invalidate token)
    } catch (err) {
      console.error('Logout API failed', err);
    } finally {
      removeToken(); // Clear localStorage
      setUser(null); // Clear state
      setRole(null);
      setIsRefreshing(false);
      navigate('/login'); // Force redirect
    }
  };

  // VALUES EXPOSED TO THE REST OF THE APP
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
 * useAuth hook
 * Allows any component to access user data or the logout function easily.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
