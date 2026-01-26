import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';
import { Check, X, FileText } from 'lucide-react';
import client from '@/api/client';

const ReviewWelfareRequests = () => {
  console.log('Rendering ReviewWelfareRequests'); // DEBUG LOG
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await client.get('/welfare');
        // Backend filters by role automatically, but we ensure frontend state matches
        setRequests(data);
      } catch (error) {
        toast.error("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const status = action === 'approve' ? 'Approved by Principal' : 'Rejected';
      await client.patch(`/welfare/${id}/status`, { status });

      setRequests(requests.filter(req => req.id !== id));

      if (action === 'approve') {
        toast.success(`Request approved and forwarded to ZEO.`);
      } else {
        toast.error(`Request rejected.`);
      }
    } catch (error) {
      toast.error("Failed to update request status");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Review Welfare Requests</h1>
          <p className="text-gray-600">Approve or reject requests submitted by teachers.</p>
        </div>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed text-gray-500">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg">No pending requests to review</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">{request.studentName}</CardTitle>
                    <p className="text-sm text-gray-500">Grade: {request.grade} • Teacher: {request.teacher?.name || 'Unknown'}</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    {request.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-md">
                      <span className="text-xs text-gray-500 uppercase font-semibold">Welfare Type</span>
                      <p className="font-medium text-gray-900">{request.category}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <span className="text-xs text-gray-500 uppercase font-semibold">Estimated Cost</span>
                      <p className="font-medium text-gray-900">LKR {Number(request.cost).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-gray-700">Description:</span>
                    <p className="text-gray-600 text-sm leading-relaxed">{request.description}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-3 bg-gray-50 pt-4">
                  <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => handleAction(request.id, 'reject')}>
                    <X className="w-4 h-4 mr-2" /> Reject
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(request.id, 'approve')}>
                    <Check className="w-4 h-4 mr-2" /> Approve & Forward
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReviewWelfareRequests;
