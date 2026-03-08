import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, setToken as saveToken, removeToken, getUserRole, getUserInfo, isTokenValid } from '@/utils/tokenHelper';
import client from '@/services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = getToken();
    if (token && isTokenValid()) {
      const userInfo = getUserInfo();
      const userRole = getUserRole();
      setUser(userInfo);
      setRole(userRole);
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    saveToken(token);
    // Since real token might not have all claims, we rely on the login component
    // refreshing the context or we force a reload.
    // Ideally we decoder it. 
    // Let's assume the tokenHelper can handle the new token or we update it.
    const userInfo = getUserInfo();
    const userRole = getUserRole();
    setUser(userInfo);
    setRole(userRole);
  };

  const logout = async () => {
    try {
      await client.post('/auth/logout');
    } catch (err) {
      console.error('Logout API failed', err);
    } finally {
      removeToken();
      setUser(null);
      setRole(null);
    }
  };

  const value = {
    user,
    role,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
