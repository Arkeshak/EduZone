import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, Mail, Lock, AlertCircle, School, Building, Heart, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { authApi } from '@/api/authApi';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');

  // Configuration for different roles
  const roleConfig = {
    teacher: {
      title: 'Teacher Login',
      icon: GraduationCap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600',
      gradient: 'from-blue-50 to-blue-100',
      defaultEmail: 'teacher@edu.lk'
    },
    principal: {
      title: 'Principal Login',
      icon: School,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600',
      gradient: 'from-purple-50 to-purple-100',
      defaultEmail: 'principal@edu.lk'
    },
    zeo: {
      title: 'ZEO Administration',
      icon: Building,
      color: 'text-orange-600',
      bgColor: 'bg-orange-600',
      gradient: 'from-orange-50 to-orange-100',
      defaultEmail: 'zeo@edu.lk'
    },
    donor: {
      title: 'Donor Login',
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-600',
      gradient: 'from-pink-50 to-pink-100',
      defaultEmail: 'donor@example.com'
    },
    default: {
      title: 'EduZone Login',
      icon: GraduationCap,
      color: 'text-gray-700',
      bgColor: 'bg-gray-800',
      gradient: 'from-gray-50 to-gray-200',
      defaultEmail: ''
    }
  };

  const currentConfig = roleConfig[roleParam] || roleConfig.default;
  const IconComponent = currentConfig.icon;

  useEffect(() => {
    // Pre-fill email if role is selected (for mock convenience)
    if (currentConfig.defaultEmail) {
      setFormData(prev => ({ ...prev, email: currentConfig.defaultEmail }));
    }
  }, [roleParam]);

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
      const userRole = payload.role;

      // Basic validation to ensure they logged into the correct portal
      if (roleParam && roleParam !== userRole) {
        // You might allow this or block it. For now, we'll warn but allow redirect to proper dashboard.
        // Or strictly: throw new Error(`You cannot login as ${userRole} from ${roleParam} portal.`);
      }

      navigate(`/${userRole}/dashboard`);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentConfig.gradient} flex items-center justify-center p-4`}>
      <div className="max-w-md w-full">
        <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 ${currentConfig.bgColor} rounded-full mb-4 shadow-lg transform transition-transform hover:scale-105`}>
            <IconComponent className="w-10 h-10 text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${currentConfig.color} mb-2`}>{currentConfig.title}</h1>
          <p className="text-gray-600">Hatton Zonal Education Office</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8 border border-white/50">
          <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500 transition-all"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end mt-1">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${currentConfig.bgColor} text-white py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium shadow-md transition-all`}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Login'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-3">
            {roleParam === 'donor' && (
              <p className="text-sm text-gray-600">
                New donor?{' '}
                <Link to="/donor/register" className="text-pink-600 hover:underline font-medium">
                  Register here
                </Link>
              </p>
            )}
            <p className="text-xs text-gray-400">
              Protected by Zonal Govt. Security Policy
            </p>
          </div>
        </div>
      </div >
    </div >
  );
};

export default Login;
