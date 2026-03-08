import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, Calendar } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import client from '@/services/apiClient';

const PrincipalCirculars = () => {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCirculars = async () => {
      try {
        // Fetch from API (Assuming endpoint /circulars created later or generic one)
        const { data } = await client.get('/circulars');
        setCirculars(Array.isArray(data) ? data : []);
      } catch (error) {
        setCirculars([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCirculars();
  }, []);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Circulars & Announcements</h1>
          <p className="text-gray-600">Official updates from the Zonal Education Office</p>
        </div>

        <div className="space-y-4">
          {circulars.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border border-dashed">
              <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No circulars received.</p>
            </div>
          ) : (
            circulars.map((circular) => (
              <Card key={circular.id || Math.random()} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{circular.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(circular.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{circular.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PrincipalCirculars;
