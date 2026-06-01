import { useState } from 'react';
import { validatePassword } from '@/utils/passwordValidation'; // Utility to check password strength
import { useNavigate, Link } from 'react-router-dom'; // Hooks for navigation
import { GraduationCap, User, Mail, Lock, Phone, MapPin, AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react'; // UI Icons
import LoadingSpinner from '@/components/LoadingSpinner'; // Loader for API calls
import FormInput from '@/components/FormInput'; // REUSABLE COMPONENT: Standardizes all inputs
import { authApi } from '@/services/authService'; // API library for donor registration
import donationBg from '../assets/donation_hero.png'; // Background brand image

/**
 * DONOR REGISTRATION PAGE COMPONENT
 * 
 * File Purpose: Allows new institutional or individual donors to join the EduZone platform.
 * Features: Multi-step flow (Form -> Email Verification -> Success).
 */
const DonorRegistration = () => {
  // state for all registration fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    organizationName: '',
  });

  // state to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // state for the 6-digit email verification code
  const [verificationCode, setVerificationCode] = useState('');

  // state to toggle between registration form and verification screen
  const [isVerifying, setIsVerifying] = useState(false);

  // Error/Success and Loading indicators
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /**
   * INITIAL REGISTRATION SUBMISSION
   * Purpose: Validates form and triggers verification email
   * When it runs: When user clicks "Register as Donor"
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
   * EMAIL VERIFICATION COMPLETION
   * Purpose: Validates the one-time code and activates account
   * When it runs: After user enters the 6-digit code from their email
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
      // Auto-redirect to login page after a brief success message
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Verification failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * SUCCESS SCREEN UI
   * Purpose: Congratulate the user on successful registration
   */
  if (success) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* BRANDED BACKGROUND with green success overlay */}
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

  /**
   * VERIFICATION SCREEN UI
   * Purpose: Collect the verification code sent to email
   */
  if (isVerifying) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* BRANDED BACKGROUND with pink donor overlay */}
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

          {/* ERROR ALERT BOX */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200 text-sm backdrop-blur-md">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
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

  // MAIN REGISTRATION FORM UI
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* BRANDED BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <img src={donationBg} alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/90 to-slate-900/90 backdrop-blur-sm"></div>
      </div>

      <div className="max-w-2xl w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
        {/* EXIT ACTION */}
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

        {/* REGISTRATION CARD */}
        <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 md:p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200 text-sm backdrop-blur-md">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* FULL NAME INPUT (Using reusable FormInput) */}
              <FormInput
                label="Full Name"
                icon={User}
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="enter your name...."
              />

              {/* EMAIL INPUT (Using reusable FormInput) */}
              <FormInput
                label="Email Address"
                icon={Mail}
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="enter your email...."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* PASSWORD INPUT (Using reusable FormInput + Toggle) */}
              <div className="relative">
                <FormInput
                  label="Password"
                  icon={Lock}
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="enter your password...."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[42px] text-slate-400 hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* CONFIRM PASSWORD INPUT (Using reusable FormInput + Toggle) */}
              <div className="relative">
                <FormInput
                  label="Confirm Password"
                  icon={Lock}
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="enter your confirm password...."
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-[42px] text-slate-400 hover:text-white transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* PHONE NUMBER (Using reusable FormInput) */}
            <FormInput
              label="Phone Number"
              icon={Phone}
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="enter your phone number...."
            />

            {/* ADDRESS (Using reusable FormInput as textarea) */}
            <FormInput
              label="Address"
              icon={MapPin}
              required
              as="textarea"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="enter your address...."
              className="min-h-[100px]"
            />

            {/* ORGANIZATION NAME (Optional) */}
            <FormInput
              label="Organization Name (Optional)"
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
              placeholder="enter your organization (optional)...."
            />

            {/* PRIMARY SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 hover:scale-[1.02] text-white py-3.5 rounded-xl font-bold shadow-[0_4px_14px_rgba(236,72,153,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Register as Donor'}
            </button>
          </form>

          {/* FOOTER NAVIGATION */}
          <div className="mt-8 text-center pt-6 border-t border-white/10">
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
