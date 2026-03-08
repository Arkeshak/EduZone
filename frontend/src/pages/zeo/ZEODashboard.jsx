import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, School, Wallet, FileCheck, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import LoadingSpinner from '@/components/LoadingSpinner';
import client from '@/services/apiClient';

/**
 * ZEODashboard Component
 * @desc The master administration dashboard for Zonal Education Officers.
 *       Provides a high-level overview of the entire educational zone, including aggregated 
 *       statistics for schools, students, system-wide pending approvals, and total donation funds.
 *       Integrates Recharts for visual data representation.
 */
const ZEODashboard = () => {
  const [loading, setLoading] = useState(true);

  // Mock data for the dashboard chart
  const weeklyRequestData = [
    { name: 'Mon', requests: 4 },
    { name: 'Tue', requests: 7 },
    { name: 'Wed', requests: 3 },
    { name: 'Thu', requests: 8 },
    { name: 'Fri', requests: 12 },
    { name: 'Sat', requests: 5 },
    { name: 'Sun', requests: 2 },
  ];

  const [stats, setStats] = useState({
    totalSchools: 10,
    totalStudents: 12450,
    pendingApprovals: 15,
    donationFund: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch real data
        const [donationsRes, welfareRes] = await Promise.all([
          client.get('/donations/stats'),
          client.get('/welfare')
        ]);

        const pendingApprovals = welfareRes.data.filter(r => r.status === 'Approved by Principal').length; // Ready for ZEO
        const totalSchools = 10; // Fixed
        const totalStudents = 12450;

        setStats({
          totalSchools,
          totalStudents,
          pendingApprovals,
          donationFund: donationsRes.data.donationFund || 0
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (value) => {
    if (value >= 1000000) return `Rs. ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `Rs. ${(value / 1000).toFixed(1)}K`;
    return `Rs. ${value}`;
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zonal Overview</h1>
          <p className="text-gray-500">Overall statistics for Hatton Education Zone.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-blue-50 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
                <School className="w-4 h-4 mr-2" /> Total Schools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats.totalSchools}</div>
              <p className="text-xs text-blue-500 mt-1">+2 from last year</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
                <Users className="w-4 h-4 mr-2" /> Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{stats.totalStudents.toLocaleString()}</div>
              <p className="text-xs text-purple-500 mt-1">+120 new enrollments</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 flex items-center">
                <FileCheck className="w-4 h-4 mr-2" /> Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">15</div>
              <p className="text-xs text-orange-500 mt-1">Requires immediate attention</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center">
                <Wallet className="w-4 h-4 mr-2" /> Donation Fund
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{formatCurrency(stats.donationFund)}</div>
              <p className="text-xs text-green-500 mt-1">+50k this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Activity */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>Weekly Welfare Requests</CardTitle>
              <CardDescription>Number of incoming requests over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyRequestData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  <Bar dataKey="requests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-sm">Request #R-2024-{100 + i}</p>
                    <p className="text-xs text-gray-500">Hatton High School</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold px-2 py-1 bg-orange-100 text-orange-700 rounded-full">Pending</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ZEODashboard;
