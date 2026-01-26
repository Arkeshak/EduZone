import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';
import client from '@/api/client';

const SubmitReport = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    month: '',
    averageAttendance: '',
    staffAttendance: '',
    dropoutCount: '',
    remarks: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await client.post('/reports', formData);
      setSubmitted(true);
      toast.success('Monthly report submitted successfully');
    } catch (error) {
      toast.error('Failed to submit report');
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Submit Monthly Performance Report</h1>

        <Card>
          <CardHeader>
            <CardTitle>School Performance Data</CardTitle>
            <CardDescription>Enter metrics for the current month</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Report Month</Label>
                  <Input type="month" name="month" required value={formData.month} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Average Attendance (%)</Label>
                  <Input type="number" name="averageAttendance" min="0" max="100" placeholder="e.g. 85" required value={formData.averageAttendance} onChange={handleChange} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Staff Attendance (%)</Label>
                  <Input type="number" name="staffAttendance" min="0" max="100" placeholder="e.g. 95" required value={formData.staffAttendance} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Dropout Count</Label>
                  <Input type="number" name="dropoutCount" min="0" placeholder="0" required value={formData.dropoutCount} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Special Remarks / Issues</Label>
                <Input name="remarks" placeholder="Any critical issues to report..." value={formData.remarks} onChange={handleChange} />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SubmitReport;
