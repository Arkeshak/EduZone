import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { FileText, Check, X, Download } from 'lucide-react';
import { toast } from 'sonner';
import client from '@/api/client';

const ResourceApproval = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data } = await client.get('/resources/pending');
      setResources(data);
    } catch (error) {
      console.error("Failed to load resources", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const status = action === 'approve' ? 'Approved' : 'Rejected';
      await client.put(`/resources/${id}/status`, { status });

      setResources(resources.filter(r => r.id !== id));
      if (action === 'approve') {
        toast.success('Resource approved and published to Zone Library.');
      } else {
        toast.success('Resource rejected.');
      }
    } catch (error) {
      toast.error("Failed to update resource status");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Review Study Resources</h1>
          <p className="text-gray-600">Approve study materials uploaded by teachers.</p>
        </div>

        <div className="space-y-4">
          {!loading && resources.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No pending resources to review.</p>
          ) : (
            resources.map(resource => (
              <Card key={resource.id}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{resource.title}</h3>
                      <p className="text-sm text-gray-500">{resource.subject} • {resource.teacherName} ({resource.schoolName})</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <Badge variant="outline">{new Date(resource.createdAt).toLocaleDateString()}</Badge>
                        <a href={resource.fileUrl} target="_blank" rel="noreferrer">
                          <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                            <Download className="w-3 h-3 mr-1" /> Preview
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleAction(resource.id, 'reject')}>
                      <X className="w-4 h-4 mr-2" /> Reject
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(resource.id, 'approve')}>
                      <Check className="w-4 h-4 mr-2" /> Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResourceApproval;
