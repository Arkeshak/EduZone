import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, Mail, Lock, AlertCircle, School, Building, Heart, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { authApi } from '@/services/authService';

// Background Images
import eduBg from '../assets/education_hero.png';
import donationBg from '../assets/donation_hero.png';
import heroBg from '../assets/hero-bg.png';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');

  // Configuration for different roles
  const roleConfig = {
    teacher: {
      title: 'Teacher Portal',
      icon: GraduationCap,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600',
      gradient: 'from-blue-900/90 to-slate-900/90',
      image: eduBg,
      borderColor: 'border-blue-500/30',
      glow: 'shadow-[0_0_40px_rgba(59,130,246,0.2)]',
      defaultEmail: 'teacher@edu.lk'
    },
    principal: {
      title: 'Principal Access',
      icon: School,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600',
      gradient: 'from-purple-900/90 to-slate-900/90',
      image: heroBg,
      borderColor: 'border-purple-500/30',
      glow: 'shadow-[0_0_40px_rgba(168,85,247,0.2)]',
      defaultEmail: 'principal@edu.lk'
    },
    zeo: {
      title: 'ZEO Administration',
      icon: Building,
      color: 'text-orange-400',
      bgColor: 'bg-orange-600',
      gradient: 'from-orange-900/90 to-slate-900/90',
      image: eduBg, // Reusing education bg for admin but with different overlay
      borderColor: 'border-orange-500/30',
      glow: 'shadow-[0_0_40px_rgba(234,88,12,0.2)]',
      defaultEmail: 'zeo@edu.lk'
    },
    donor: {
      title: 'Donor Hub',
      icon: Heart,
      color: 'text-pink-400',
      bgColor: 'bg-pink-600',
      gradient: 'from-pink-900/90 to-slate-900/90',
      image: donationBg,
      borderColor: 'border-pink-500/30',
      glow: 'shadow-[0_0_40px_rgba(236,72,153,0.2)]',
      defaultEmail: 'donor@example.com'
    },
    default: {
      title: 'EduZone Login',
      icon: GraduationCap,
      color: 'text-white',
      bgColor: 'bg-slate-700',
      gradient: 'from-slate-900/90 to-slate-950/90',
      image: eduBg,
      borderColor: 'border-white/10',
      glow: 'shadow-[0_0_40px_rgba(255,255,255,0.1)]',
      defaultEmail: ''
    }
  };

  const currentConfig = roleConfig[roleParam] || roleConfig.default;
  const IconComponent = currentConfig.icon;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authApi.login(formData);
      const token = data.token || data.accessToken || data;

      login(token);

      // Decode role to navigate
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload.role?.toLowerCase();

      // Basic validation to ensure they logged into the correct portal
      if (roleParam && roleParam !== userRole) {
        // You might allow this or block it.
      }

      navigate(`/${userRole}/dashboard`);

    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentConfig.image}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${currentConfig.gradient} backdrop-blur-sm`}></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-500">
        <Link to="/" className="inline-flex items-center text-sm text-slate-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        {/* Glass Card */}
        <div className={`bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 p-6 sm:p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${currentConfig.borderColor} ${currentConfig.glow} transition-all duration-500`}>

          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 ${currentConfig.bgColor} rounded-2xl mb-6 shadow-lg shadow-black/20 transform hover:scale-110 transition-transform duration-300 rotate-3`}>
              <IconComponent className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">{currentConfig.title}</h1>
            <p className="text-slate-300 text-sm font-medium uppercase tracking-widest opacity-80">Hatton Zonal Education Office</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200 text-sm backdrop-blur-md">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all"
                  placeholder="enter your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-white transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all"
                  placeholder="enter your password"
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
            <div className="flex justify-end pt-1">
              <Link to="/forgot-password" className={`text-sm ${currentConfig.color} hover:text-white transition-colors opacity-80 hover:opacity-100`}>
                Forgot Password?
              </Link>
            </div>


            <button
              type="submit"
              disabled={loading}
              className={`w-full ${currentConfig.bgColor} hover:brightness-110 text-white py-3.5 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all transform hover:-translate-y-0.5 mt-2`}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-4">
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
