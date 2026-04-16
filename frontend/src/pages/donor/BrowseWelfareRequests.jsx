import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { School } from 'lucide-react';
import { toast } from 'sonner';
import client from '@/services/apiClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import donationHero from '@/assets/donation_hero.png';

const BrowseWelfareRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const { data } = await client.get('/welfare/published');
      setRequests(data);
    } catch (error) {
      console.error("Failed to load requests", error);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDonate = (req) => {
    navigate(`/donor/make-donation?requestId=${req.id}&amount=${req.cost}&ref=${req.referenceId || req.id}`);
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Hero Section */}
        <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden shadow-lg mb-8">
          <div className="absolute inset-0">
            <img src={donationHero} alt="Donate" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent"></div>
          </div>
          <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Donate to Students</h1>
            <p className="text-blue-100 max-w-lg text-base md:text-lg">Browse verified welfare requests and make a direct impact on a student's future today.</p>
          </div>
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
                    <span className="font-bold text-pink-600">LKR {Number(req.cost).toLocaleString()}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight">Ref: {req.referenceId || `#${req.id}`}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Grade: {req.grade}</p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">{req.description}</p>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <School className="w-4 h-4 mr-2" />
                    {req.schoolName || 'Unknown School'}
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
