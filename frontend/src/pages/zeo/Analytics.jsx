import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {

  const requestsData = [
    { name: 'Jan', approved: 40, rejected: 24, pending: 24 },
    { name: 'Feb', approved: 30, rejected: 13, pending: 22 },
    { name: 'Mar', approved: 20, rejected: 98, pending: 22 },
    { name: 'Apr', approved: 27, rejected: 39, pending: 20 },
    { name: 'May', approved: 18, rejected: 48, pending: 21 },
    { name: 'Jun', approved: 23, rejected: 38, pending: 25 },
  ];

  const donationData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 2000 },
    { name: 'Apr', amount: 2780 },
    { name: 'May', amount: 1890 },
    { name: 'Jun', amount: 2390 },
    { name: 'Jul', amount: 3490 },
  ];

  const schoolPerformanceData = [
    { name: 'Hatton Central', passRate: 85, attendance: 92 },
    { name: 'St. Johns', passRate: 78, attendance: 88 },
    { name: 'Highlands', passRate: 92, attendance: 95 },
    { name: 'Valley View', passRate: 65, attendance: 75 },
    { name: 'City High', passRate: 88, attendance: 90 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">System Analytics</h1>
          <p className="text-gray-600">Real-time performance metrics and reports.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Welfare Request Status Chart */}
          <Card className="col-span-2 md:col-span-1 shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle>Welfare Request Overview</CardTitle>
              <CardDescription>Approved vs Rejected vs Pending requests over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={requestsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f3f4f6' }}
                  />
                  <Legend />
                  <Bar dataKey="approved" stackId="a" fill="#4ade80" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="pending" stackId="a" fill="#fbbf24" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="rejected" stackId="a" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Donation Trends Chart */}
          <Card className="col-span-2 md:col-span-1 shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle>Donation Inflow Trends</CardTitle>
              <CardDescription>Monthly donation amounts (LKR)</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={donationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* School Performance Chart */}
          <Card className="col-span-2 shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle>School Performance Summary</CardTitle>
              <CardDescription>Comparison of attendance and pass rates across key schools</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={schoolPerformanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Bar dataKey="passRate" name="Pass Rate %" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="attendance" name="Attendance %" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
