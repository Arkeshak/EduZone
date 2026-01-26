import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
// Fixing imports: Table is separate in shadcn usually or custom.
// Using native HTML table or checking project structure. The previous file had specific imports.
// Let's use standard table structure based on previous file.
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import client from '@/api/client';

const ReportReview = () => {
  const [month, setMonth] = useState('February 2024');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch reports
    const fetchReports = async () => {
      try {
        const { data } = await client.get('/reports');
        setReports(data || []);
      } catch (error) {
        console.error("Failed to load reports", error);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [month]); // Note: Real backend might need month filter query param

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">School Reports Review</h1>
            <p className="text-gray-600">Track monthly performance reports from schools.</p>
          </div>
          {/* Month selector UI remains same */}
        </div>

        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">

          {reports.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No reports submitted.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Month</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">School Name</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Avg Attendance</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Staff Attendance</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Dropouts</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b">
                    <td className="px-4 py-3 font-medium">{report.month}</td>
                    <td className="px-4 py-3">{report.schoolName || 'Unknown School'}</td>
                    <td className="px-4 py-3 text-center">{report.averageAttendance}%</td>
                    <td className="px-4 py-3 text-center">{report.staffAttendance}%</td>
                    <td className="px-4 py-3 text-center">{report.dropoutCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportReview;
