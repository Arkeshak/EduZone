/**
 * PRINCIPAL DASHBOARD PAGE
 * 
 * File Purpose: Main landing page for school principals
 * Used for: Quick overview of pending approvals, school metrics, recent activity
 * 
 * Features:
 * - Statistics: Pending welfare approvals, monthly report status, total students
 * - Recent activity showing new welfare requests requiring approval
 * - Quick links to: Review requests, Received funds, Submit report, View circulars
 * - School-scoped data (only their school's data)
 * 
 * Data: Fetches welfare requests for school and generates stats
 * Security: Only shows data relevant to principal's school
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { FileText, CheckCircle, XCircle, AlertCircle, BarChart3, ArrowUpRight, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import client from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';

/**
 * PrincipalDashboard Component
 * @desc The central hub for School Principals.
 *       Displays key school metrics including pending welfare approvals,
 *       monthly report status, and recent activity within their specific school.
 */
const PrincipalDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    monthlyReports: 'Pending',
    totalStudents: 1250, // Should come from API eventually
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch Real Welfare Requests count
      const { data } = await client.get('/welfare');
      
      // Handle paginated response structure
      const requests = data.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      
      const pendingCount = requests.filter(r => r.status === 'SUBMITTED' || r.status === 'Pending').length;

      // Fetch School Info (if we had an endpoint for current school stats, e.g. /schools/me)
      const savedStats = JSON.parse(localStorage.getItem('mock_school_stats') || '{}');

      setStats({
        pendingApprovals: pendingCount,
        monthlyReports: 'Pending', // Hardcoded until Reports API exists
        totalStudents: savedStats.current_school_id || 1250,
        recentActivity: requests.slice(0, 3).map(r => ({
          id: r.id,
          text: `New Request: ${r.studentName}`,
          time: new Date(r.createdAt).toLocaleDateString(),
          type: 'info'
        }))
      });

    } catch (error) {
      console.error("Failed to load principal stats", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold Tracking-tight mb-2">Welcome, {user?.name}</h1>
          <p className="text-gray-500">Overview of {user?.school} welfare and reporting status.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Requests</CardTitle>
              <FileText className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.pendingApprovals}</div>
              <p className="text-xs text-gray-500 mt-1">Welfare requests awaiting your review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Monthly Report</CardTitle>
              <BarChart3 className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.monthlyReports === 'Pending' ? 'text-orange-600' : 'text-green-600'}`}>
                {stats.monthlyReports}
              </div>
              <p className="text-xs text-gray-500 mt-1">Status for current month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalStudents}</div>
              <p className="text-xs text-gray-500 mt-1">Enrolled students</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest welfare requests submitted</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500">No recent activity.</p>
              ) : (
                <div className="space-y-4">
                  {stats.recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-start pb-4 border-b last:border-0 last:pb-0">
                      <div className="mt-1 w-2 h-2 rounded-full mr-3 bg-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Actions</CardTitle>
              <CardDescription>Tasks requiring your immediate attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.pendingApprovals > 0 ? (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-orange-900">Review Welfare Requests</h4>
                      <p className="text-sm text-orange-700">You have {stats.pendingApprovals} requests to review</p>
                    </div>
                  </div>
                  <a href="/principal/review-requests" className="text-sm font-medium text-orange-800 hover:underline">Review</a>
                </div>
              ) : (
                <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <p className="text-sm text-green-700 font-medium">No pending actions required.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PrincipalDashboard;
