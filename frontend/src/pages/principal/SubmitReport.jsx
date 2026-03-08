import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CheckCircle, History, Plus } from 'lucide-react';
import client from '@/services/apiClient';

const SubmitReport = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [reports, setReports] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [reportId, setReportId] = useState(null);

  const [formData, setFormData] = useState({
    month: '',
    averageAttendance: '',
    staffAttendance: '',
    dropoutCount: '',
    remarks: ''
  });

  const fetchHistory = async () => {
    try {
      const { data } = await client.get('/reports/my-school');
      setReports(data);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleMonthChange = (e) => {
    const selectedMonth = e.target.value;
    const existing = reports.find(r => r.month === selectedMonth);

    if (existing) {
      setFormData({
        month: existing.month,
        averageAttendance: existing.averageAttendance,
        staffAttendance: existing.staffAttendance,
        dropoutCount: existing.dropoutCount,
        remarks: existing.remarks || ''
      });
      setIsEditing(true);
      setReportId(existing.id);
      toast.info(`Found existing report for ${selectedMonth}. Switching to Edit mode.`);
    } else {
      setFormData({
        month: selectedMonth,
        averageAttendance: '',
        staffAttendance: '',
        dropoutCount: '',
        remarks: ''
      });
      setIsEditing(false);
      setReportId(null);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await client.put(`/reports/${reportId}`, formData);
        toast.success('Monthly report updated successfully');
      } else {
        await client.post('/reports', formData);
        toast.success('Monthly report submitted successfully');
      }
      setSubmitted(true);
      fetchHistory(); // Refresh history
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Report Submitted</h2>
          <p className="text-gray-500 mb-6">The monthly performance report has been sent to the ZEO.</p>
          <Button onClick={() => setSubmitted(false)} variant="outline">Submit Another</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Monthly Performance Reports</h1>
            <p className="text-gray-600">Track and report school metrics to the ZEO.</p>
          </div>
          {isEditing && (
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setFormData({ month: '', averageAttendance: '', staffAttendance: '', dropoutCount: '', remarks: '' });
              setReportId(null);
            }}>
              <Plus className="w-4 h-4 mr-2" /> New Report
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form Column */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Report' : 'Submit New Report'}</CardTitle>
              <CardDescription>
                {isEditing ? `Update metrics for ${formData.month}` : 'Enter metrics for the current or previous month'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Report Month</Label>
                    <Input
                      type="month"
                      name="month"
                      required
                      value={formData.month}
                      onChange={handleMonthChange}
                      disabled={isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Average Attendance (%)</Label>
                    <Input type="number" name="averageAttendance" min="0" max="100" step="0.1" placeholder="e.g. 85" required value={formData.averageAttendance} onChange={handleChange} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Staff Attendance (%)</Label>
                    <Input type="number" name="staffAttendance" min="0" max="100" step="0.1" placeholder="e.g. 95" required value={formData.staffAttendance} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Dropout Count</Label>
                    <Input type="number" name="dropoutCount" min="0" placeholder="0" required value={formData.dropoutCount} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Special Remarks / Issues</Label>
                  <Textarea name="remarks" placeholder="Any critical issues to report..." value={formData.remarks} onChange={handleChange} className="min-h-[100px]" />
                </div>

                <Button type="submit" className="w-full bg-slate-900" disabled={loading}>
                  {loading ? 'Processing...' : (isEditing ? 'Update Report' : 'Submit Report')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* History Column */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" /> History
              </CardTitle>
              <CardDescription>Select a month to edit</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto divide-y">
                {reports.length === 0 ? (
                  <p className="p-4 text-center text-gray-500 text-sm italic">No reports submitted yet.</p>
                ) : (
                  reports.map(r => (
                    <button
                      key={r.id}
                      onClick={() => handleMonthChange({ target: { value: r.month } })}
                      className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex justify-between items-center ${formData.month === r.month ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{r.month}</p>
                        <p className="text-xs text-slate-500">Staff Att: {r.staffAttendance}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-700">{r.averageAttendance}%</p>
                        <p className="text-[10px] text-slate-400">Attendance</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubmitReport;
