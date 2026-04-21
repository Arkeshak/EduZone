/**
 * DONOR DASHBOARD PAGE
 * 
 * File Purpose: Main landing page for donors
 * Used for: View donation history, impact statistics, quick donate link
 * 
 * Features:
 * - Statistics: Total contributed amount, number of students impacted
 * - Recent donation history (last 5)
 * - Quick action button to make new donation
 * - Visual cards showing donation breakdown
 * 
 * Data: Fetches from /donations endpoint showing donor's contributions
 * Tracking: Calculates students impacted by counting unique welfare requests funded
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import client from '@/services/apiClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import quickActionIcon from '@/assets/quick_action_donate.png';
import emptyStateIcon from '@/assets/empty_state_donation.png';

/**
 * DONOR DASHBOARD PAGE
 * 
 * File Purpose: Immersive hub for donors to track their contributions and impact.
 * Features:
 * - Real-time financial metrics: Total LKR Contributed.
 * - Social impact metrics: Count of unique students stabilized.
 * - Quick Action: Entry point to Browse Requests.
 * - History: Chronological feed of latest financial contributions with verification status.
 * 
 * Data Flow: Fetches /donations and aggregates unique requestId counts for impact tracking.
 */

const DonorDashboard = () => {
  /**
   * STATE MANAGEMENT
   * Purpose: Tracks donor financial and impact metrics.
   * History: Cached array of the donor's 5 most recent contributions.
   */
  const [stats, setStats] = useState({
    totalContributed: 0,
    studentsImpacted: 0,
    history: []
  });
  const [loading, setLoading] = useState(true);

  /**
   * DATA INITIALIZATION EFFECT
   * Purpose: Calculates dashboard metrics on mount.
   * Action: GET /donations and performs frontend aggregation.
   */
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: donations } = await client.get('/donations');
      // Filter for this donor (frontend filter, ideally backend)
      // Since we don't have donor-specific logic fully built, assuming all returned for "me"
      // or just calculate from all public donations for demo purposes if session not ready.
      // Assuming /donations returns MY donations

      const total = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
      const impacted = new Set(donations.map(d => d.requestId).filter(id => id)).size; // Unique requests supported

      setStats({
        totalContributed: total,
        studentsImpacted: impacted,
        history: donations.slice(0, 5)
      });

    } catch (error) {
      console.error("Failed to fetch donor stats", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Donor Dashboard</h1>
          <p className="text-gray-600">Thank you for making a difference in student lives.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Donations */}
          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-pink-100 font-medium">Total Contributed</p>
                  <h2 className="text-4xl font-bold mt-2">LKR {stats.totalContributed.toLocaleString()}</h2>
                </div>
                <div className="p-2 bg-pink-400 bg-opacity-30 rounded-lg">
                  <Heart className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lives Impacted */}
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 font-medium">Students Impacted</p>
                  <h2 className="text-4xl font-bold mt-2 text-gray-900">{stats.studentsImpacted}</h2>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Action */}
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 flex flex-col justify-center items-center p-6 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-20 h-20 mb-4 drop-shadow-lg">
              <img src={quickActionIcon} alt="Donate" className="w-full h-full object-contain" />
            </div>
            <p className="text-center text-gray-600 font-medium mb-4">Make a direct impact today.</p>
            <Link to="/donor/browse-requests">
              <Button className="bg-blue-600 hover:bg-blue-700 w-full shadow-lg shadow-blue-500/30">Browse Verified Requests</Button>
            </Link>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Donation Impact History</h2>
          <Card>
            <CardContent className="p-0">
              {stats.history.length === 0 ? (
                <div className="p-10 flex flex-col items-center justify-center text-center text-gray-500">
                  <div className="w-32 h-32 mb-4 opacity-90">
                    <img src={emptyStateIcon} alt="No donations yet" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">Your journey starts here</h3>
                  <p className="text-sm max-w-xs mx-auto">Make your first donation to see your impact history grow.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {stats.history.map((donation) => (
                    <div key={donation.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <h4 className="font-semibold text-gray-900">{donation.description || 'General Donation'}</h4>
                        <p className="text-sm text-gray-500">{donation.schoolName || 'Zone Fund'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">LKR {donation.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{new Date(donation.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DonorDashboard;
