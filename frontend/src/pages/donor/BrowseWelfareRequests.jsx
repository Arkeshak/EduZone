import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { School } from 'lucide-react';
import { toast } from 'sonner';
import client from '@/api/client';
import LoadingSpinner from '@/components/LoadingSpinner';

const BrowseWelfareRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await client.get('/welfare');
        // Only show requests approved by ZEO (Ready for funding)
        const visibleToDonors = data.filter(r => r.status === 'Approved by ZEO');
        setRequests(visibleToDonors);
      } catch (error) {
        console.error("Failed to load requests", error);
        toast.error("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleDonate = (req) => {
    navigate(`/donor/make-donation?requestId=${req.id}&amount=${req.cost}&student=${encodeURIComponent(req.studentName)}`);
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Donate to Students</h1>
          <p className="text-gray-600">Browse verified welfare requests and make a direct impact.</p>
        </div>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-dashed text-gray-500">
            <School className="w-12 h-12 mb-4 opacity-30" />
            <p>No verified requests available at the moment.</p>
            <p className="text-sm">Please check back later.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <Card key={req.id} className="flex flex-col h-full hover:shadow-lg transition-shadow border-t-4 border-t-pink-500">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{req.category}</Badge>
                    <span className="font-bold text-pink-600">LKR {req.cost.toLocaleString()}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight">{req.studentName}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">{req.description}</p>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <School className="w-4 h-4 mr-2" />
                    {req.school}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">{req.priority || 'High'}</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-pink-600 hover:bg-pink-700"
                    onClick={() => handleDonate(req)}
                  >
                    Donate Now
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

export default BrowseWelfareRequests;
