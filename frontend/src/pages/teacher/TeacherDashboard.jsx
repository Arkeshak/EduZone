import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout'; // Our core layout
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react'; // Icons
import LoadingSpinner from '@/components/LoadingSpinner'; // Loader
import client from '@/services/apiClient'; // API tool
import { useAuth } from '@/context/AuthContext'; // Access user info

/**
 * TEACHER DASHBOARD PAGE
 * 
 * Purpose: This is the first screen a teacher sees after logging in.
 * It shows summaries of their welfare requests and quick links to actions.
 */
const TeacherDashboard = () => {
  const { user } = useAuth();
  
  // STATE: Stores total, pending, approved, and rejected counts
  const [stats, setStats] = useState({
    totalRequests: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  
  // STATE: Stores a list of recent status changes to show the user
  const [recentNotifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA: Runs when the page loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all welfare requests for this teacher
        const { data } = await client.get('/welfare');
        
        // Ensure data is in array format (handles different API response styles)
        const requests = data.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);

        // CALCULATE STATS: Count requests by their current status
        const total = requests.length;
        const pending = requests.filter(r => 
          r.status?.toUpperCase() === 'SUBMITTED' || 
          r.status?.toUpperCase().includes('PENDING')
        ).length;
        const approved = requests.filter(r => 
          r.status?.toUpperCase().includes('APPROVED') || 
          r.status?.toUpperCase() === 'PUBLISHED'
        ).length;
        const rejected = requests.filter(r => r.status?.toUpperCase().includes('REJECTED')).length;

        setStats({ totalRequests: total, pending, approved, rejected });

        // CREATE FEED: Take top 3 most recent requests to show as "updates"
        const recent = requests.slice(0, 3).map(r => ({
          id: r.id,
          text: `Request for ${r.studentName}: ${r.status}`,
          time: new Date(r.createdAt).toLocaleDateString(),
          type: r.status.includes('Approved') || r.status.includes('PUBLISHED') ? 'success' : r.status.includes('Rejected') ? 'danger' : 'info'
        }));
        setNotifications(recent);

      } catch (error) {
        console.error("Failed to load dashboard data", error);
        setNotifications([]);
      } finally {
        setLoading(false); // Hide the spinner
      }
    };
    fetchData();
  }, []);

  // Show loading screen while data is arriving
  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER SECTION */}
        <div>
          <h1 className="text-2xl mb-2 font-bold text-slate-900">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.fullName || user?.name}! Overview of your student welfare requests.</p>
        </div>

        {/* SUMMARY CARDS: Top row statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Total Requests" value={stats.totalRequests} color="blue" />
          <StatCard icon={Clock} label="Pending Approval" value={stats.pending} color="yellow" />
          <StatCard icon={CheckCircle} label="Approved" value={stats.approved} color="green" />
          <StatCard icon={XCircle} label="Rejected" value={stats.rejected} color="red" />
        </div>

        {/* MAIN GRID: Actions and Updates */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* QUICK ACTIONS: Buttons for common tasks */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg mb-4 font-semibold text-slate-900">Quick Actions</h2>
            <div className="space-y-3">
              <QuickActionLink to="/teacher/submit-request" title="Submit New Welfare Request" desc="Create a new student welfare request" />
              <QuickActionLink to="/teacher/upload-resource" title="Upload Study Resource" desc="Share educational materials" />
              <QuickActionLink to="/teacher/track-requests" title="Track My Requests" desc="View all submitted welfare requests" />
            </div>
          </div>

          {/* RECENT UPDATES: Notification feed */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg mb-4 font-semibold text-slate-900">Recent Status Updates</h2>
            <div className="space-y-3">
              {recentNotifications.length > 0 ? recentNotifications.map(notif => (
                <div key={notif.id} className={`p-3 border rounded-md ${notif.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                  <p className="text-sm font-medium">{notif.text}</p>
                  <p className="text-xs opacity-70 mt-1">{notif.time}</p>
                </div>
              )) : (
                <p className="text-gray-500 text-sm">No recent updates.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// COMPONENT: A simple box showing a single statistic
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    yellow: "bg-yellow-100 text-yellow-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600"
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className={`w-12 h-12 ${colors[color]} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-2xl font-bold mb-1 text-slate-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
};

// COMPONENT: A clickable card used for navigation
const QuickActionLink = ({ to, title, desc }) => (
  <Link to={to} className="block p-4 border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors">
    <p className="font-medium text-slate-900">{title}</p>
    <p className="text-sm text-gray-600">{desc}</p>
  </Link>
);

export default TeacherDashboard;
