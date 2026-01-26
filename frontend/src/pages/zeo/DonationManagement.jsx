import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Check, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import client from '@/api/client';

const DonationManagement = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      // Fetch donations (Assuming GET /donations/pending exists or we filter)
      // For now, let's fetch all and filter client side or assume backend sorts it
      const { data } = await client.get('/donations');
      // Filter only 'Pending' if needed, but the ZEO might want to see history too.
      // Let's show all for now or filter for the "Pending" view.
      setDonations(data);
    } catch (error) {
      console.error(error);
      // toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (id) => {
    try {
      await client.put(`/donations/${id}/verify`); // Assuming verify endpoint exists
      toast.success("Donation verifying...");
      fetchDonations(); // Refresh
    } catch (error) {
      toast.error("Failed to verify donation");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Donation Management</h1>
          <p className="text-gray-600">Verify and allocate incoming donations.</p>
        </div>

        <div className="bg-white rounded-md border shadow-sm">
          {donations.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
              <FileText className="w-10 h-10 mb-2 opacity-20" />
              <p>No donations found.</p>
            </div>
          ) : (
            <div className="divide-y">
              {donations.map((donation) => (
                <div key={donation.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">{donation.donorName || "Anonymous"}</h3>
                    <p className="text-sm text-gray-500">Date: {new Date(donation.createdAt).toLocaleDateString()}</p>
                    <Badge variant={donation.status === 'Verified' ? 'success' : 'secondary'} className="mt-2">
                      {donation.status || 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">LKR {donation.amount?.toLocaleString()}</p>
                      <p className="text-xs text-slate-500 font-medium">{donation.paymentMethod || 'Online'}</p>
                    </div>
                    {donation.status !== 'Verified' && (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" className="text-red-600 hover:bg-red-50 border-red-100">
                          <X className="w-4 h-4" />
                        </Button>
                        <Button size="icon" className="bg-green-600 hover:bg-green-700" onClick={() => handleAllocate(donation.id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DonationManagement;
