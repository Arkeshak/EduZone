/**
 * AUTHENTICATION SERVICE
 * 
 * File Purpose: Wraps all authentication API calls
 * Used for: Login, registration, email verification, password resets
 * 
 * Key functions:
 * - login() - Authenticate user, receive tokens
 * - registerDonor() - Create donor account
 * - verifyEmail() - Verify email with code
 * - changePassword() - Change password (logged-in users)
 * - forgotPassword() - Request password reset email
 * - resetPassword() - Set new password using token
 * - getCurrentUser() - Get logged-in user details
 * 
 * Usage: Import and call authApi.login({email, password})
 * All requests automatically include JWT tokens via apiClient interceptor
 */

import client from './apiClient';

/**
 * Auth API Service
 * @desc Encapsulates all backend HTTP calls related to User Authentication and Identity.
 *       Includes login, registration, email verification, password reset flows, 
 *       and user management endpoints accessible by ZEO/Admin.
 */
export const authApi = {
  /**
   * LOGIN
   * 
   * Purpose: Authenticate user with email and password
   * Endpoint: POST /auth/login
   * 
   * Input:
   * - credentials: { email, password }
   * 
   * Flow:
   * 1. User enters email and password on Login page
   * 2. Called from Login component's handleSubmit
   * 3. Backend verifies credentials against database
   * 4. Returns JWT token and user data
   * 5. Frontend stores token in localStorage
   * 6. User redirected to dashboard
   * 
   * Output:
   * - token: JWT access token for authenticated requests
   * - refreshToken: Token for refreshing expired access tokens
   * - id: User's unique ID
   * - name: User's name
   * - email: User's email
   * - role: User's role (teacher, principal, zeo, donor)
   * - school: User's school (if applicable)
   * 
   * Error Scenarios:
   * - Invalid email format
   * - Email not found
   * - Incorrect password
   * - Account not verified/activated
   * 
   * Used in: Login.jsx
   */
  login: async (credentials) => {
    const response = await client.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * REGISTER DONOR
   * 
   * Purpose: Create new donor account
   * Endpoint: POST /auth/register/donor
   * 
   * Input:
   * - donorData: { name, email, password, phone, address, organizationName }
   * 
   * Flow:
   * 1. User fills DonorRegistration form
   * 2. Form validates password strength
   * 3. Called with donor data
   * 4. Backend creates donor account
   * 5. Sends verification email with OTP
   * 6. Returns temporary token for account activation
   * 7. User redirected to OTP verification page
   * 
   * Output:
   * - tempToken: Temporary token for OTP verification
   * - email: Email address to verify
   * - message: "Verification email sent"
   * 
   * Error Scenarios:
   * - Email already exists
   * - Invalid email format
   * - Password doesn't meet requirements
   * - Missing required fields
   * 
   * Used in: DonorRegistration.jsx
   */
  registerDonor: async (donorData) => {
    const response = await client.post('/auth/register/donor', donorData);
    return response.data;
  },

  /**
   * VERIFY EMAIL / ACTIVATE ACCOUNT
   * 
   * Purpose: Verify OTP received via email during registration
   * Endpoint: POST /auth/verify
   * 
   * Input:
   * - verificationData: { email, code }
   * - code: 6-digit OTP sent to email
   * 
   * Flow:
   * 1. User receives email with OTP after registration
   * 2. User enters OTP in ActivateAccount page
   * 3. Called with email and OTP
   * 4. Backend verifies OTP matches what was sent
   * 5. Backend marks account as verified/active
   * 6. Returns auth token for immediate login
   * 7. User can now use the application
   * 
   * Output:
   * - token: JWT access token
   * - refreshToken: Token for refreshing
   * - user: Verified user data
   * - message: "Account verified successfully"
   * 
   * Error Scenarios:
   * - Invalid/wrong OTP
   * - OTP expired (usually 10-15 minutes)
   * - Email not found
   * - Account already verified
   * 
   * Used in: ActivateAccount.jsx
   */
  verifyEmail: async (verificationData) => {
    const response = await client.post('/auth/verify', verificationData);
    return response.data;
  },

  /**
   * REGISTER USER (Admin/ZEO Only)
   * 
   * Purpose: ZEO admin creates teacher/principal accounts
   * Endpoint: POST /auth/admin/create-user
   * Requires: ZEO admin authorization
   * 
   * Input:
   * - userData: { email, name, role, schoolId, password }
   * - role: 'teacher' or 'principal'
   * 
   * Flow:
   * 1. ZEO admin accesses user management panel
   * 2. Fills form with teacher/principal info
   * 3. Backend creates account with temporary password
   * 4. Sends email with login credentials
   * 5. Teacher/Principal sets own password on first login
   * 
   * Output:
   * - userId: New user's ID
   * - email: User's email
   * - role: Assigned role
   * - temporaryPassword: For first login
   * 
   * Error Scenarios:
   * - Email already exists
   * - Invalid role
   * - School doesn't exist
   * - Unauthorized (not ZEO admin)
   * 
   * Used in: ZEO admin dashboard (user management)
   */
  registerUser: async (userData) => {
    const response = await client.post('/auth/admin/create-user', userData);
    return response.data;
  },

  /**
   * DELETE USER (Admin/ZEO Only)
   * 
   * Purpose: ZEO admin can deactivate/delete user accounts
   * Endpoint: DELETE /auth/users/:userId
   * Requires: ZEO admin authorization
   * 
   * Input:
   * - userId: ID of user to delete
   * 
   * Flow:
   * 1. ZEO admin selects user in management panel
   * 2. Confirms deletion
   * 3. Backend soft-deletes user (marks as inactive)
   * 4. User can no longer login
   * 5. User's data retained for auditing
   * 
   * Output:
   * - success: true
   * - message: "User deleted"
   * 
   * Error Scenarios:
   * - User not found
   * - Unauthorized
   * - Cannot delete yourself
   * 
   * Used in: ZEO admin dashboard
   */
  deleteUser: async (userId) => {
    const response = await client.delete(`/auth/users/${userId}`);
    return response.data;
  },

  /**
   * GET CURRENT USER
   * 
   * Purpose: Fetch logged-in user's profile data
   * Endpoint: GET /auth/me
   * Requires: Valid JWT token in Authorization header
   * 
   * Flow:
   * 1. Called when user first logs in or page refreshes
   * 2. Backend decodes JWT token
   * 3. Returns user data associated with that token
   * 4. Frontend updates AuthContext with user data
   * 
   * Output:
   * - id: User ID
   * - name: Full name
   * - email: Email address
   * - role: User role
   * - school: School assigned (if applicable)
   * - profilePicture: Avatar URL
   * - lastLogin: Last login timestamp
   * 
   * Error Scenarios:
   * - No token provided (401)
   * - Token invalid/expired (401)
   * - User deleted/deactivated
   * 
   * Used in: AuthContext (on app load), User profile pages
   */
  getCurrentUser: async () => {
    const response = await client.get('/auth/me');
    return response.data;
  },

  /**
   * CHANGE PASSWORD
   * 
   * Purpose: Allow logged-in user to change their password
   * Endpoint: PUT /auth/change-password
   * Requires: Valid JWT token, current password verification
   * 
   * Input:
   * - passwordData: { currentPassword, newPassword }
   * 
   * Flow:
   * 1. User clicks "Change Password" in profile
   * 2. ChangePassword component opens
   * 3. User enters current password for verification
   * 4. User enters new password (strength validated)
   * 5. Backend verifies current password matches
   * 6. Backend updates password in database
   * 7. Success message shown
   * 
   * Output:
   * - success: true
   * - message: "Password changed successfully"
   * 
   * Error Scenarios:
   * - Current password incorrect
   * - New password doesn't meet requirements
   * - New password same as current
   * - Password change too soon (rate limiting)
   * 
   * Used in: ChangePassword.jsx (in-app password change)
   */
  changePassword: async (passwordData) => {
    const response = await client.put('/auth/change-password', passwordData);
    return response.data;
  },

  /**
   * FORGOT PASSWORD
   * 
   * Purpose: Initiate password reset for forgotten passwords
   * Endpoint: POST /auth/forgotpassword
   * Requires: None (unauthenticated endpoint)
   * 
   * Input:
   * - email: User's email address
   * 
   * Flow:
   * 1. User visits ForgotPassword page
   * 2. Enters their email address
   * 3. Backend checks if email exists
   * 4. Generates reset token (valid for 1 hour)
   * 5. Sends email with reset link containing token
   * 6. User clicks link in email (goes to ResetPassword page)
   * 7. ResetPassword page extracts token from URL
   * 
   * Output:
   * - success: true
   * - message: "Password reset link sent to email"
   * 
   * Error Scenarios:
   * - Email doesn't exist
   * - Email not verified yet
   * - Rate limiting (too many requests from IP)
   * 
   * Used in: ForgotPassword.jsx
   */
  forgotPassword: async (email) => {
    const response = await client.post('/auth/forgotpassword', { email });
    return response.data;
  },

  /**
   * RESET PASSWORD
   * 
   * Purpose: Set new password using reset token from email
   * Endpoint: PUT /auth/resetpassword/:token
   * Requires: Valid reset token from email link
   * 
   * Input:
   * - token: Reset token from email link (in URL)
   * - password: New password (strength validated)
   * 
   * Flow:
   * 1. User clicks link in reset email
   * 2. Browser navigates to /reset-password/:token
   * 3. ResetPassword page extracts token from URL
   * 4. User enters new password
   * 5. Form validates password strength
   * 6. Called with token and new password
   * 7. Backend verifies token is valid and not expired
   * 8. Backend updates password
   * 9. Token is invalidated (can't reuse)
   * 10. Success page shown, user redirected to login
   * 
   * Output:
   * - success: true
   * - message: "Password reset successfully"
   * 
   * Error Scenarios:
   * - Invalid token
   * - Token expired (older than 1 hour)
   * - Token already used
   * - Password doesn't meet requirements
   * - User not found
   * 
   * Used in: ResetPassword.jsx
   */
  resetPassword: async (token, password) => {
    const response = await client.put(`/auth/resetpassword/${token}`, { password });
    return response.data;
  },

  /**
   * ACTIVATE ACCOUNT
   * 
   * Purpose: Complete account activation after OTP verification
   * Endpoint: POST /auth/activate-account
   * Requires: OTP verification data
   * 
   * Input:
   * - data: { email, otp, verificationCode }
   * 
   * Flow:
   * 1. Used as alternative to verifyEmail
   * 2. Validates OTP matches what was sent
   * 3. Marks account as activated
   * 4. Returns auth tokens
   * 5. User can now login and use app
   * 
   * Output:
   * - token: JWT access token
   * - refreshToken: Token for refreshing
   * - activated: true
   * 
   * Error Scenarios:
   * - Invalid OTP
   * - OTP expired
   * - Account already activated
   * - Email not found
   * 
   * Used in: ActivateAccount.jsx (OTP verification)
   */
  activateAccount: async (data) => {
    const response = await client.post('/auth/activate-account', data);
    return response.data;
  },
};
