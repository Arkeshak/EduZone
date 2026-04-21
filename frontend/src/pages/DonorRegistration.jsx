/**
 * DONOR REGISTRATION PAGE  
 * 
 * File Purpose: Allow donors to create new accounts
 * Used for: Donor signup with email verification
 * 
 * Features:
 * - Full name, email, password form
 * - Optional organization name and phone
 * - Password strength validation
 * - Email verification step
 * - Loading/error states
 * - Account activation after verification
 * 
 * Flow: Fill form → Submit → Receive verification email → Enter code → Account activated → Redirect to login
 */

import { useState } from 'react';
import { validatePassword } from '@/utils/passwordValidation';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock, Phone, MapPin, AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { authApi } from '@/services/authService';
import donationBg from '../assets/donation_hero.png';

const DonorRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    organizationName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * REGISTRATION FORM HANDLER
   * Purpose: Collects donor details and initiates the account creation process.
   * Action: 
   * 1. Validates password equality and strength.
   * 2. Calls backend registration API.
   * 3. Switches the UI to the 'Verification' screen on success.
   * Validation: 
   * - Checks if passwords match.
   * - Uses a helper utility for password complexity.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Pre-submission Validation: Password matching
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Pre-submission Validation: Password complexity (uppercase, numbers, etc)
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      // API call to create unverified donor account
      await authApi.registerDonor({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      // Toggle to verification code entry screen
      setIsVerifying(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * EMAIL VERIFICATION HANDLER
   * Purpose: Validates the 6-digit code sent to the user's email.
   * Action:
   * 1. Submits email and code to the verification endpoint.
   * 2. Shows the success screen and redirects to login.
   * Validation: Displays error if code is incorrect or expired.
   */
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.verifyEmail({
        email: formData.email,
        code: verificationCode
      });
      setSuccess(true);
      // Brief delay to allow user to see the success message
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Verification failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN
  // Purpose: Shown after successful email verification
  // Elements: Success check icon, confirmation message
  // Action: Automatically redirects user to login page after 2 seconds
  if (success) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img src={donationBg} alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 to-slate-900/90 backdrop-blur-sm"></div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] max-w-md w-full text-center relative z-10 animate-in fade-in zoom-in">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Registration Successful!</h2>
          <p className="text-slate-300 mb-6">Your email has been verified. You can now login.</p>
        </div>
      </div>
    );
  }

  // VERIFICATION SCREEN
  // Purpose: Shown after user submits registration form
  // Action: Expects user to enter the 6-digit code from their email
  // Elements: Large numeric input for verification code
  if (isVerifying) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img src={donationBg} alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-pink-900/90 to-slate-900/90 backdrop-blur-sm"></div>
        </div>

        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 text-center relative z-10 animate-in fade-in zoom-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-600 rounded-2xl mb-6 shadow-lg shadow-pink-600/30 rotate-3">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Verify Your Email</h2>
          <p className="text-slate-300 mb-8">We've sent a 6-digit code to <b>{formData.email}</b>. Please enter it below.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200 text-sm backdrop-blur-md">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            {/* 
              VERIFICATION CODE INPUT
              Purpose: Collect the unique code sent to the email address
              Action: Updates verificationCode state
              Validation: Maximum 6 characters
            */}
            <input
              type="text"
              required
              maxLength="6"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full text-center text-4xl tracking-[1em] py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all font-mono"
              placeholder="000000"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3.5 rounded-xl font-bold shadow-lg disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Verify Email'}
            </button>
          </form>
          <button
            onClick={() => setIsVerifying(false)}
            className="mt-6 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Back to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img src={donationBg} alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/90 to-slate-900/90 backdrop-blur-sm"></div>
      </div>

      <div className="max-w-2xl w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <Link to="/login" className="inline-flex items-center text-sm text-slate-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
        </Link>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-600 rounded-2xl mb-6 shadow-lg shadow-pink-600/30 rotate-3 transform hover:scale-110 transition-transform">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Donor Registration</h1>
          <p className="text-pink-200 text-lg font-medium">Join us in supporting students in need</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 md:p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200 text-sm backdrop-blur-md">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                {/* 
                  FULL NAME INPUT FIELD
                  Purpose: Collect donor's full name
                  Icon: User icon inside input on left
                  Validation: Required field
                  Action: On change, updates formData.name state
                  Used for: Identifying donor for records
                */}
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all"
                    placeholder="enter your name...."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                {/* 
                  EMAIL INPUT FIELD
                  Purpose: Collect donor's email address (will be verified)
                  Icon: Mail icon inside input on left
                  Validation: Required field, must be valid email format
                  Action: On change, updates formData.email state
                  Used for: Login credentials and verification code delivery
                */}
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-white transition-colors" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all"
                    placeholder="enter your email...."
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                {/* 
                  PASSWORD INPUT FIELD
                  Purpose: Collect strong password for account
                  Icon: Lock icon inside input on left
                  Visibility: Hidden by default (shows as dots)
                  Toggle: Eye icon on right to show/hide password
                  Validation: Required field, must be strong password
                  Requirements: Minimum 8 chars, uppercase, lowercase, number, special char
                  Action: On change, updates formData.password state
                  Used for: Account security
                */}
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-white transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all"
                    placeholder="enter your password...."
                  />
                  {/* 
                    PASSWORD VISIBILITY TOGGLE (Password Field)
                    Purpose: Show/hide password text
                    Icon: Eye icon (closed when hidden, open when visible)
                    Action: Click to toggle visibility
                    Location: Right side inside password field
                    Used for: Verify password was typed correctly
                  */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Confirm Password</label>
                {/* 
                  CONFIRM PASSWORD INPUT FIELD
                  Purpose: Verify password was typed correctly (must match Password field)
                  Icon: Lock icon inside input on left
                  Visibility: Hidden by default (shows as dots)
                  Toggle: Eye icon on right to show/hide
                  Validation: Required field, must match password field
                  Action: On change, updates formData.confirmPassword state
                  Used for: Prevent typos, ensure user knows their password
                */}
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-white transition-colors" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all"
                    placeholder="enter your confirm password...."
                  />
                  {/* 
                    CONFIRM PASSWORD VISIBILITY TOGGLE
                    Purpose: Show/hide confirm password text
                    Icon: Eye icon (closed when hidden, open when visible)
                    Action: Click to toggle visibility
                    Location: Right side inside field
                    Used for: Check both passwords match
                  */}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Phone Number</label>
              {/* 
                PHONE NUMBER INPUT FIELD
                Purpose: Collect donor's contact phone number
                Icon: Phone icon inside input on left
                Validation: Required field
                Format: Tel input type (accepts phone numbers)
                Action: On change, updates formData.phone state
                Used for: Contact information and verification
              */}
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-white transition-colors" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all"
                  placeholder="enter your phone number...."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Address</label>
              {/* 
                ADDRESS TEXTAREA FIELD
                Purpose: Collect donor's physical address
                Icon: Location/map pin icon at top left
                Validation: Required field
                Type: Textarea (multi-line text)
                Height: Minimum 100px (about 4 lines)
                Action: On change, updates formData.address state
                Used for: Mailing address and contact purposes
              */}
              <div className="relative group">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-white transition-colors" />
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all min-h-[100px]"
                  placeholder="enter your address...."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Organization Name (Optional)</label>
              {/* 
                ORGANIZATION NAME INPUT FIELD
                Purpose: Collect donor's organization/company name
                Optional: Not required (for individual donors)
                Icon: None
                Action: On change, updates formData.organizationName state
                Used for: Records if donor is from an organization
              */}
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all"
                placeholder="enter your organization (optional)...."
              />
            </div>

            {/* 
              REGISTER AS DONOR BUTTON (Main Submit Button)
              Purpose: Submit registration form and create donor account
              Color: Pink (donor portal color)
              Size: Full width
              States:
              - Normal: Pink, clickable, scalable on hover
              - Hover: Brighter pink, scales up slightly (1.02x)
              - Loading: Shows spinner, disabled, opacity reduced
              Action: Click to validate form and submit to backend
              Result on success: Account created, verification email sent, shows verification screen
              Result on failure: Error message shown above form
              Used for: Main registration action
            */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 hover:scale-[1.02] text-white py-3.5 rounded-xl font-bold shadow-[0_4px_14px_rgba(236,72,153,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Register as Donor'}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/10">
            {/* 
              LOGIN LINK (Footer)
              Purpose: Navigate to login page for existing donors
              Text: "Already have an account? Login here"
              Color: Pink (donor portal color) - brighter on hover
              Location: Bottom of registration form
              Action: Click to go to login page
              Used for: Existing donors who accidentally came to registration instead of login
            */}
            <p className="text-sm text-slate-300">
              Already have an account?{' '}
              <Link to="/login" className="text-pink-400 hover:text-white transition-colors font-bold">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorRegistration;
