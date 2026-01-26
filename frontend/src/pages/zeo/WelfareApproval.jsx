import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Globe, X } from 'lucide-react';
import { toast } from 'sonner';
import client from '@/api/client';

const WelfareApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await client.get('/welfare'); // ZEO sees all
      // Filter for "Approved by Principal" which are ready for ZEO
      const pendingZEO = data.filter(r => r.status === 'Approved by Principal');
      setRequests(pendingZEO);
    } catch (error) {
      console.error("Failed to fetch approvals", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await client.patch(`/welfare/${id}/status`, { status: 'Approved by ZEO' });
      setRequests(requests.filter(r => r.id !== id));
      toast.success(`Request published to Donor Portal!`);
    } catch (error) {
      toast.error("Failed to publish request");
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Are you sure you want to reject this request?")) return;
    try {
      await client.patch(`/welfare/${id}/status`, { status: 'Rejected by ZEO' });
      setRequests(requests.filter(r => r.id !== id));
      toast.success(`Request rejected.`);
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Welfare Request Final Approval</h1>
          <p className="text-gray-600">Review principal-approved requests and publish to donors.</p>
        </div>

        <div className="grid gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{request.studentName}</CardTitle>
                  <p className="text-sm text-gray-500">{request.school} • Approved by Principal</p>
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
