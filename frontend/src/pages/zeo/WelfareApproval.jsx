import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, X } from 'lucide-react';
import { toast } from 'sonner';
import client from '@/services/apiClient';

const WelfareApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('All');

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [selectedSchool]); // Refetch on school change

  const fetchSchools = async () => {
    try {
      const { data } = await client.get('/schools');
      setSchools(data);
    } catch (error) {
      console.error("Failed to fetch schools");
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Build query string
      const query = selectedSchool !== 'All' ? `?schoolId=${selectedSchool}` : '';
      console.log('Fetching requests with query:', query);
      const { data } = await client.get(`/welfare${query}`);
      console.log('Raw Data received:', data);

      // Filter for "PRINCIPAL_APPROVED" which are ready for ZEO
      // Note: Backend might return all statuses for ZEO, so we still filter by status here for SAFETY
      const pendingZEO = data.filter(r => r.status === 'PRINCIPAL_APPROVED');
      console.log('Filtered Pending ZEO:', pendingZEO);
      setRequests(pendingZEO);
    } catch (error) {
      console.error("Failed to fetch approvals", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await client.patch(`/welfare/${id}/status`, { status: 'PUBLISHED' }); // Matches allowed enum
      setRequests(requests.filter(r => r.id !== id));
      toast.success(`Request published to Donor Portal!`);
    } catch (error) {
      toast.error("Failed to publish request");
    }
  };

  const handleReject = async (id) => {
    // if (!confirm("Are you sure you want to reject this request?")) return;
    const reason = prompt("Please enter the reason for rejection:");
    if (!reason) return;

    try {
      await client.patch(`/welfare/${id}/status`, { status: 'REJECTED', remarks: reason });
      setRequests(requests.filter(r => r.id !== id));
      toast.success(`Request rejected.`);
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welfare Request Final Approval</h1>
            <p className="text-gray-600">Review principal-approved requests and publish to donors.</p>
          </div>

          <div className="w-full md:w-64">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
            >
              <option value="All">All Schools</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{request.student?.name || 'Unknown Student'}</CardTitle>
                  <p className="text-sm text-gray-500">{request.schoolData?.name || 'Unknown School'} • Approved by Principal</p>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Verified by Principal</Badge>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-md mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs uppercase text-gray-500 font-bold">Type</span>
                    <p>{request.category || request.type}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-gray-500 font-bold">Amount Needed</span>
                    <p className="text-lg font-bold text-blue-600">LKR {request.cost}</p>
                  </div>
                </div>
                <p className="text-gray-700">{request.description}</p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-3">
                <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => handleReject(request.id)}>Reject</Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handlePublish(request.id)}>
                  <Globe className="w-4 h-4 mr-2" /> Publish to Donors
                </Button>
              </CardFooter>
            </Card>
          ))}
          {!loading && requests.length === 0 && (
            <p className="text-center text-gray-500 py-10">No pending requests to publish.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WelfareApproval;
