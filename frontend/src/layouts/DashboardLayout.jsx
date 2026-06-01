import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; // Access global auth state
import {
  Menu, X, Home, LogOut, User, FileText, Users, DollarSign, BarChart3, Bell, GraduationCap, LayoutDashboard
} from 'lucide-react'; 
import { API_BASE_URL } from '@/services/apiClient';

/**
 * DASHBOARD LAYOUT COMPONENT
 * 
 * Purpose: Provides a consistent navigation framework for all authenticated users.
 */
const DashboardLayout = ({ children }) => {
  // state to toggle sidebar visibility on mobile screens
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // hooks and global values
  const { role, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirects to login after clearing authentication state
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * ROLE-BASED NAVIGATION CONFIGURATION
   * Purpose: Returns specific menu links based on the user's role.
   */
  const getRoleNavigation = () => {
    const safeRole = role ? role.toLowerCase() : '';
    switch (safeRole) {
      case 'teacher':
        return [
          { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
          { name: 'Submit Request', path: '/teacher/submit-request', icon: FileText },
          { name: 'Track Requests', path: '/teacher/track-requests', icon: BarChart3 },
          { name: 'Manage Resources', path: '/teacher/manage-resources', icon: LayoutDashboard },
          { name: 'Upload Resource', path: '/teacher/upload-resource', icon: FileText },
          { name: 'View Circulars', path: '/teacher/circulars', icon: Bell },
          { name: 'Profile', path: '/teacher/profile', icon: User },
        ];
      case 'principal':
        return [
          { name: 'Dashboard', path: '/principal/dashboard', icon: LayoutDashboard },
          { name: 'Review Requests', path: '/principal/review-requests', icon: FileText },
          { name: 'Received Funds', path: '/principal/received-funds', icon: DollarSign },
          { name: 'Submit Report', path: '/principal/submit-report', icon: BarChart3 },
          { name: 'View Circulars', path: '/principal/circulars', icon: Bell },
          { name: 'Profile', path: '/principal/profile', icon: User },
        ];
      case 'zeo':
        return [
          { name: 'Dashboard', path: '/zeo/dashboard', icon: LayoutDashboard },
          { name: 'User Management', path: '/zeo/users', icon: Users },
          { name: 'Welfare Approval', path: '/zeo/welfare-approval', icon: FileText },
          { name: 'Donations', path: '/zeo/donations', icon: DollarSign },
          { name: 'Publish Circular', path: '/zeo/publish-circular', icon: Bell },
          { name: 'Analytics', path: '/zeo/analytics', icon: BarChart3 },
          { name: 'Profile', path: '/zeo/profile', icon: User },
        ];
      case 'donor':
        return [
          { name: 'Dashboard', path: '/donor/dashboard', icon: LayoutDashboard },
          { name: 'Browse Requests', path: '/donor/browse-requests', icon: FileText },
          { name: 'Track Donations', path: '/donor/track-donations', icon: BarChart3 },
          { name: 'Profile', path: '/donor/profile', icon: User },
        ];
      default:
        return [];
    }
  };

  const navigation = getRoleNavigation();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* MOBILE OVERLAY: Dims screen when sidebar is open */}
      <div
        className={`fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* SIDEBAR: Main vertical navigation menu */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}>
        
        {/* LOGO AREA */}
        <div className="flex items-center h-20 px-6 border-b border-white/10">
          <GraduationCap className="w-8 h-8 text-blue-400 mr-3" />
          <h1 className="text-2xl font-bold tracking-tight text-white">EduZone</h1>
          {/* Close button for mobile */}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto">
            <X className="w-6 h-6 text-slate-400 hover:text-white" />
          </button>
        </div>

        <div className="px-4 py-8">
          {/* SIDEBAR PROFILE CARD */}
          {user && (
            <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden flex-shrink-0 shadow-lg border border-white/20">
                {user?.profilePicture ? (
                  <img src={`${API_BASE_URL}${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                    {(user?.fullName || user?.name)?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-blue-300 uppercase tracking-wider font-semibold mb-0.5">Signed in as</p>
                <p className="font-bold text-white truncate leading-tight">{user.fullName || user.name}</p>
                <p className="text-xs text-slate-400 capitalize">{role}</p>
              </div>
            </div>
          )}

          {/* LIST OF NAVIGATION LINKS */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 translate-x-1'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white hover:translate-x-1'
                    }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-blue-200' : 'text-slate-500 group-hover:text-white'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* LOGOUT BUTTON (Bottom) */}
        <div className="absolute bottom-0 w-full p-6 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-300 rounded-lg hover:bg-red-500/10 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* VIEWPORT: Header + Content area */}
      <div className="lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
        
        {/* HEADER: Subtitle and quick profile access */}
        <header className="sticky top-0 z-30 flex items-center h-20 px-6 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm lg:px-10 justify-between">
          <div className="flex items-center">
            {/* Hamburger button for mobile */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 p-2 rounded-md hover:bg-slate-100 text-slate-600">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-800 truncate">Hatton Zonal Education Office</h2>
          </div>
          <div className="flex items-center space-x-4">
            {/* NAVIGATE TO PROFILE TOOL: Click on profile bubble */}
            <button 
              onClick={() => navigate(`/${role?.toLowerCase()}/profile`)}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg overflow-hidden border-2 border-white/80 cursor-pointer hover:scale-105 hover:ring-2 hover:ring-blue-400 active:scale-95 transition-all duration-200"
              title="View Profile"
            >
              {user?.profilePicture ? (
                <img src={`${API_BASE_URL}${user.profilePicture}`} alt="User" className="w-full h-full object-cover" />
              ) : (
                <span className="drop-shadow-sm">{(user?.fullName || user?.name)?.charAt(0) || 'U'}</span>
              )}
            </button>
          </div>
        </header>

        {/* MAIN BODY: Where children components render */}
        <main className="flex-1 p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
