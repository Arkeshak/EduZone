import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent } from '@/app/components/ui/card';
import { Heart, TrendingUp } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Link } from 'react-router-dom';
import client from '@/api/client';
import LoadingSpinner from '@/components/LoadingSpinner';

const DonorDashboard = () => {
  const [stats, setStats] = useState({
    totalContributed: 0,
    studentsImpacted: 0,
    history: []
  });
  const [loading, setLoading] = useState(true);

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

      const total = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
      const impacted = new Set(donations.map(d => d.requestId)).size; // Unique requests supported

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
          <Card className="bg-white flex flex-col justify-center items-center p-6 border-dashed border-2 border-gray-200">
            <p className="text-center text-gray-500 mb-4">Ready to help more?</p>
            <Link to="/donor/browse-requests">
              <Button className="bg-blue-600 hover:bg-blue-700">Browse New Requests</Button>
            </Link>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Donation Impact History</h2>
          <Card>
            <CardContent className="p-0">
              {stats.history.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                  <p>No donations yet. Start your journey today!</p>
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
