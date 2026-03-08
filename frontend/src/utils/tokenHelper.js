import { jwtDecode } from 'jwt-decode';

export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

export const setRefreshToken = (token) => {
  localStorage.setItem('refreshToken', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  return decoded?.role?.toLowerCase() || null;
};

export const getUserInfo = () => {
  const token = getToken();
  if (!token) return null;

  return decodeToken(token);
};

export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return false;

  // Check if token is expired
  const currentTime = Date.now() / 1000;
  return decoded.exp > currentTime;
};
