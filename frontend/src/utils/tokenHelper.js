import { jwtDecode } from 'jwt-decode';

/**
 * TOKEN HELPER UTILITIES
 * 
 * Purpose: Manages reading and writing authentication tokens (JWT) 
 * to the browser's localStorage.
 */

// Retrieve the short-lived access token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Save a new access token
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Retrieve the long-lived refresh token
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

// Save a new refresh token
export const setRefreshToken = (token) => {
  localStorage.setItem('refreshToken', token);
};

// Clear all tokens (sign out)
export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

// Decodes a JWT to see the data inside (user id, role, etc.)
export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Quickly gets the user's role (e.g., 'teacher') from the current token
export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  return decoded?.role?.toLowerCase() || null;
};

// Gets the full user object from the current token
export const getUserInfo = () => {
  const token = getToken();
  if (!token) return null;
  return decodeToken(token);
};

// Checks if the token is still valid (not expired)
export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return false;

  const currentTime = Date.now() / 1000;
  return decoded.exp > currentTime; // returns true if still valid
};

/**
 * PROACTIVE EXPIRATION CHECK
 * 
 * Purpose: Checks if the token is about to expire in the next few minutes.
 * Used to trigger a refresh BEFORE the user gets logged out.
 */
export const isTokenExpiring = (token, minutesBuffer = 5) => {
  if (!token) return true;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Date.now() / 1000;
  const bufferSeconds = minutesBuffer * 60;
  const expirationThreshold = decoded.exp - bufferSeconds;

  return currentTime > expirationThreshold;
};
