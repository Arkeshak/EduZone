import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; // Custom hook to access global authentication state
import { GraduationCap, Mail, Lock, AlertCircle, School, Building, Heart, ArrowLeft, Eye, EyeOff } from 'lucide-react'; // Icons for the UI
import LoadingSpinner from '@/components/LoadingSpinner'; // Component to show during API calls
import FormInput from '@/components/FormInput'; // REUSABLE COMPONENT: Standardizes all inputs
import { authApi } from '@/services/authService'; // API library for authentication requests

// Background Images for different roles
import eduBg from '../assets/education_hero.png';
import donationBg from '../assets/donation_hero.png';
import heroBg from '../assets/hero-bg.png';

/**
 * LOGIN PAGE COMPONENT
 * 
 * File Purpose: Unified login interface supporting multiple roles (Teacher, Principal, ZEO, Donor)
 * Why: Centralizes authentication logic and provides a consistent brand experience.
 */
const Login = () => {
  // state for form fields (email and password)
  const [formData, setFormData] = useState({ email: '', password: '' });
  
  // state to toggle password visibility (show/hide text)
  const [showPassword, setShowPassword] = useState(false);
  
  // state to store and display login error messages
  const [error, setError] = useState('');
  
  // state to track if an API request is in progress
  const [loading, setLoading] = useState(false);
  
  // Access global login function from AuthContext
  const { login } = useAuth();
  
  // Hook for programmatic navigation (redirecting user)
  const navigate = useNavigate();
  
  // Hook to read URL query parameters (?role=...)
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');

  /**
   * ROLE CONFIGURATION OBJECT
   * Purpose: Maps role IDs to specific UI themes (colors, icons, backgrounds)
   * When it runs: Used during every render to determine styling
   */
  const roleConfig = {
    teacher: {
      title: 'Teacher Portal',
      icon: GraduationCap,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600',
      gradient: 'from-blue-900/90 to-slate-900/90',
      image: eduBg,
      borderColor: 'border-blue-500/30',
      glow: 'shadow-[0_0_40px_rgba(59,130,246,0.2)]'
    },
    principal: {
      title: 'Principal Access',
      icon: School,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600',
      gradient: 'from-purple-900/90 to-slate-900/90',
      image: heroBg,
      borderColor: 'border-purple-500/30',
      glow: 'shadow-[0_0_40px_rgba(168,85,247,0.2)]'
    },
    zeo: {
      title: 'ZEO Administration',
      icon: Building,
      color: 'text-orange-400',
      bgColor: 'bg-orange-600',
      gradient: 'from-orange-900/90 to-slate-900/90',
      image: eduBg, 
      borderColor: 'border-orange-500/30',
      glow: 'shadow-[0_0_40px_rgba(234,88,12,0.2)]'
    },
    donor: {
      title: 'Donor Hub',
      icon: Heart,
      color: 'text-pink-400',
      bgColor: 'bg-pink-600',
      gradient: 'from-pink-900/90 to-slate-900/90',
      image: donationBg,
      borderColor: 'border-pink-500/30',
      glow: 'shadow-[0_0_40px_rgba(236,72,153,0.2)]'
    },
    default: {
      title: 'EduZone Login',
      icon: GraduationCap,
      color: 'text-white',
      bgColor: 'bg-slate-700',
      gradient: 'from-slate-900/90 to-slate-950/90',
      image: eduBg,
      borderColor: 'border-white/10',
      glow: 'shadow-[0_0_40px_rgba(255,255,255,0.1)]'
    }
  };

  // Determine current UI theme based on the 'role' parameter in the URL
  const currentConfig = roleConfig[roleParam] || roleConfig.default;
  const IconComponent = currentConfig.icon;

  /**
   * FORM SUBMISSION HANDLER
   * Purpose: Authenticates user and redirects to correct dashboard
   * When it runs: When user clicks "Sign In" or presses Enter
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setError('');       // Clear previous errors
    setLoading(true);   // show spinner

    try {
      // Call authentication API
      const data = await authApi.login(formData);
      const token = data.token || data.accessToken || data;

      // Save token to global state and localStorage
      login(token);

      // Extract role from token to determine where to redirect
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload.role?.toLowerCase();

      // Navigate to the user's dashboard (e.g., /teacher/dashboard)
      navigate(`/${userRole}/dashboard`);

    } catch (err) {
      console.error('Login Error:', err);
      // Display specific server error or generic fallback
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false); // hide spinner
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* BACKGROUND LAYER: Dynamic image based on role */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentConfig.image}
          alt="Background"
          className="w-full h-full object-cover"
        />
        {/* Transparent colored overlay for contrast over background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentConfig.gradient} backdrop-blur-sm`}></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-500">
        {/* EXIT ACTION: Navigation back to landing page */}
        <Link to="/" className="inline-flex items-center text-sm text-slate-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        {/* MAIN LOGIN CARD: High-premium glassmorphism effect */}
        <div className={`bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 p-6 sm:p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${currentConfig.borderColor} ${currentConfig.glow} transition-all duration-500`}>

          {/* BRANDING SECTION */}
          <div className="text-center mb-8">
            {/* ROLE ICON: Animated circle with role-specific icon */}
            <div className={`inline-flex items-center justify-center w-20 h-20 ${currentConfig.bgColor} rounded-2xl mb-6 shadow-lg shadow-black/20 transform hover:scale-110 transition-transform duration-300 rotate-3`}>
              <IconComponent className="w-10 h-10 text-white" />
            </div>
            {/* PRIMARY HEADING: Dynamic based on role */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">{currentConfig.title}</h1>
            {/* SECONDARY INFO: Organization name */}
            <p className="text-slate-300 text-sm font-medium uppercase tracking-widest opacity-80">Hatton Zonal Education Office</p>
          </div>

          {/* GLOBAL ERROR DISPLAY: Shows when handleSubmit fails */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200 text-sm backdrop-blur-md">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* EMAIL INPUT: Powered by reusable FormInput component */}
            <FormInput
              label="Email Address"
              icon={Mail}
              type="email"
              required
              placeholder="enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            {/* PASSWORD INPUT: Includes complex logic for visibility toggle */}
            <div className="relative">
              <FormInput
                label="Password"
                icon={Lock}
                type={showPassword ? "text" : "password"}
                required
                placeholder="enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {/* EYE BUTTON: Toggles whether password is plain text or dots */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[42px] text-slate-400 hover:text-white transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* SECONDARY ACTION: Navigation to password recovery */}
            <div className="flex justify-end pt-1">
              <Link to="/forgot-password" className={`text-sm ${currentConfig.color} hover:text-white transition-colors opacity-80 hover:opacity-100`}>
                Forgot Password?
              </Link>
            </div>

            {/* MAIN ACTION BUTTON: Role-specific color with loading state */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${currentConfig.bgColor} hover:brightness-110 text-white py-3.5 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all transform hover:-translate-y-0.5 mt-2`}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          {/* CARD FOOTER: Links and legalese */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-4">
            {/* CONDITIONAL CONTENT: Only show registration link for Donors */}
            {roleParam === 'donor' && (
              <p className="text-sm text-slate-300">
                New donor?{' '}
                <Link to="/donor/register" className={`${currentConfig.color} font-bold hover:text-white transition-colors`}>
                  Register Account
                </Link>
              </p>
            )}
            <p className="text-xs text-slate-500">
              Protected by Zonal Govt. Security Policy
            </p>
          </div>
        </div>
      </div >
    </div >
  );
};

export default Login;
