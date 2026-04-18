/**
 * TOKEN HELPER UTILITIES
 * 
 * Purpose: Centralized token management functions
 * All token operations go through these functions for consistency
 * Storage location: localStorage (persists across page refreshes)
 * 
 * Key tokens:
 * - 'token': Access token (short-lived, 15 minutes)
 * - 'refreshToken': Refresh token (long-lived, 7 days)
 */

import { jwtDecode } from 'jwt-decode';

/**
 * GET ACCESS TOKEN
 * 
 * Purpose: Retrieve access token from browser storage
 * Used for: Attaching to Authorization header in API requests
 * Returns: Token string or null if not found
 * 
 * Example:
 * const token = getToken();
 * headers.Authorization = `Bearer ${token}`;
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * SAVE ACCESS TOKEN
 * 
 * Purpose: Store access token in browser storage
 * Called after: Login, token refresh
 * Note: Overwrites existing token
 * 
 * Example:
 * setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 */
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * GET REFRESH TOKEN
 * 
 * Purpose: Retrieve refresh token from browser storage
 * Used for: Refreshing expired access tokens
 * Returns: Token string or null if not found
 * 
 * Example:
 * const refreshToken = getRefreshToken();
 * await post('/auth/refresh', { refreshToken });
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

/**
 * SAVE REFRESH TOKEN
 * 
 * Purpose: Store refresh token in browser storage
 * Called after: Login, token refresh (if server rotated it)
 * Note: Overwritten every 7 days (token expiration)
 * 
 * Example:
 * setRefreshToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 */
export const setRefreshToken = (token) => {
  localStorage.setItem('refreshToken', token);
};

/**
 * REMOVE ALL TOKENS (LOGOUT)
 * 
 * Purpose: Clear both token types from storage
 * Called during: Logout, or token expiration
 * Result: User must log in again to get new tokens
 * 
 * Example:
 * removeToken();  // User is now logged out
 */
export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

/**
 * DECODE JWT TOKEN
 * 
 * Purpose: Parse JWT to extract payload claims (user info)
 * Note: Does NOT verify signature (that's done on backend)
 * Used for: Getting user data, checking expiration locally
 * 
 * JWT Structure: header.payload.signature
 * We only get the payload (user data)
 * 
 * Example:
 * const decoded = decodeToken(token);
 * console.log(decoded);  // { id: 1, role: 'TEACHER', exp: 1234567890, ... }
 */
export const decodeToken = (token) => {
  try {
    return jwtDecode(token);  // Parse without verification
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;  // Return null if decode fails
  }
};

/**
 * GET USER ROLE FROM TOKEN
 * 
 * Purpose: Extract user role without needing API call
 * Used for: Determining which dashboard to show
 * Returns: Role as lowercase string: 'teacher', 'principal', 'zeo', 'donor'
 * 
 * Example:
 * const role = getUserRole();
 * if (role === 'teacher') {
 *   render(<TeacherDashboard />);
 * }
 */
export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;  // No token = no role

  const decoded = decodeToken(token);
  return decoded?.role?.toLowerCase() || null;  // Extract and lowercase
};

/**
 * GET USER INFO FROM TOKEN
 * 
 * Purpose: Extract all user data from token without API call
 * Useful for: Getting user ID, email, role quickly
 * Note: Only available if token already decoded from backend
 * 
 * Example:
 * const user = getUserInfo();
 * console.log(user);  // { id: 5, email: 'john@example.com', role: 'TEACHER', ... }
 * setUser(user);      // Store in React state
 */
export const getUserInfo = () => {
  const token = getToken();
  if (!token) return null;

  return decodeToken(token);  // Full decoded token
};

/**
 * CHECK IF TOKEN IS VALID (NOT EXPIRED)
 * 
 * Purpose: Verify token hasn't expired yet
 * Used for: Deciding if user is still logged in
 * Returns: true if valid, false if expired or missing
 * 
 * Logic:
 * 1. Get token from storage
 * 2. Decode it
 * 3. Check: current_time < token_expiration_time
 * 
 * Example:
 * if (isTokenValid()) {
 *   // Token still good, can use
 * } else {
 *   // Token expired, need to login again
 * }
 */
export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;  // No token = not valid

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return false;  // No expiration info = not valid

  // ✅ Check if we haven't passed the expiration time yet
  const currentTime = Date.now() / 1000;  // Current time in seconds
  return decoded.exp > currentTime;       // True if expiration is in future
};

/**
 * CHECK IF TOKEN IS EXPIRING SOON
 * 
 * Purpose: Proactive check if token will expire within X minutes
 * Very useful for: Refreshing token BEFORE it expires (no interruption to user)
 * 
 * Parameters:
 * - token: JWT to check
 * - minutesBuffer: How many minutes before expiration (default: 5)
 * 
 * Logic:
 * 1. Get current time
 * 2. Calculate threshold: expiration_time - (minutes * 60 seconds)
 * 3. Check: is current_time >= threshold?
 * 4. If yes: token is expiring soon
 * 
 * Examples:
 * isTokenExpiring(token, 5)   // True if expires within 5 minutes
 * isTokenExpiring(token, 1)   // True if expires within 1 minute
 * isTokenExpiring(token, 15)  // True if expires within 15 minutes
 * 
 * Real-world usage (from AuthContext.jsx):
 * if (token && refreshToken && isTokenExpiring(token, 5)) {
 *   // Token expires in 5 minutes, refresh now
 *   await post('/auth/refresh', { refreshToken });
 * }
 */
export const isTokenExpiring = (token, minutesBuffer = 5) => {
  if (!token) return true;  // No token = treat as expired

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;  // Can't check = treat as expired

  const currentTime = Date.now() / 1000;      // Current time in seconds
  const bufferSeconds = minutesBuffer * 60;   // Convert minutes to seconds
  const expirationThreshold = decoded.exp - bufferSeconds;  // X minutes before actual expiration

  // ✅ If current time >= threshold, token is expiring soon
  return currentTime > expirationThreshold;
};
