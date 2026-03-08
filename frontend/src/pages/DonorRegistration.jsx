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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      await authApi.registerDonor({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      setIsVerifying(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Verification failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

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
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all"
                placeholder="enter your organization (optional)...."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 hover:scale-[1.02] text-white py-3.5 rounded-xl font-bold shadow-[0_4px_14px_rgba(236,72,153,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Register as Donor'}
            </button>
          </form>

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
