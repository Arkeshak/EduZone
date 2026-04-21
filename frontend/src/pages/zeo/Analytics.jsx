import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

import { useState, useEffect } from 'react';
import client from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Download, FileText, Clock } from 'lucide-react';
import { generatePDFReport } from '@/utils/PDFReportGenerator';
import { toast } from 'sonner';

const Analytics = () => {
  /**
   * DATA STATE MANAGEMENT
   * Purpose: Stores raw time-series data for visualization.
   * RequestsData: Aggregated welfare status trends.
   * DonationData: Monthly revenue inflow.
   * SchoolPerformanceData: Comparative assessment of school attendance/passes.
   */
  const [requestsData, setRequestsData] = useState([]);
  const [donationData, setDonationData] = useState([]);
  const [schoolPerformanceData, setSchoolPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * DATA INITIALIZATION
   * Purpose: Retrieves system-wide performance data for visual reporting.
   * API: GET /reports/analytics
   */
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await client.get('/reports/analytics');
        const analyticsData = data.success ? data.data : data;
        setRequestsData(analyticsData.requestsData || []);
        setDonationData(analyticsData.donationData || []);
        setSchoolPerformanceData(analyticsData.schoolPerformanceData || []);
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  /**
   * PDF REPORT EXPORT HANDLER
   * Purpose: Captures current UI charts into a professional PDF document.
   * Action: Uses specialized PDFReportGenerator to snapshot specified DOM element IDs.
   * Validation: Provides real-time toast feedback on preparation and completion.
   */
  const handleDownloadReport = async () => {
    try {
      toast.loading("Preparing your analytics report...", { id: "pdf-gen" });
      
      const elementIds = ['welfare-chart', 'donation-chart', 'performance-chart'];
      
      await generatePDFReport({
        elementIds,
        title: "Regional Educational Performance Report",
        fileName: `ZEO_Analytics_Hattton_${new Date().toISOString().split('T')[0]}.pdf`
      });
      
      toast.success("Report downloaded successfully!", { id: "pdf-gen" });
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF report", { id: "pdf-gen" });
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Analytics</h1>
            <p className="text-slate-500 font-medium pb-2">Real-time performance metrics and regional oversight reports.</p>
          </div>
          <Button 
            onClick={handleDownloadReport} 
            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all font-bold px-6"
          >
            <Download className="w-4 h-4 mr-2" /> Download Analytics Report
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Welfare Request Status Chart */}
          <Card id="welfare-chart" className="col-span-2 md:col-span-1 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
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
          <Card id="donation-chart" className="col-span-2 md:col-span-1 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
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
          <Card id="performance-chart" className="col-span-2 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
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
                  <Bar dataKey="passRate" name="Staff Attendance %" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="attendance" name="Student Attendance %" fill="#82ca9d" radius={[4, 4, 0, 0]} />
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
