import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Heart, FileText, Download, Calendar, ExternalLink, ShieldCheck } from 'lucide-react';
import client from '@/services/apiClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';

const TrackDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const { data } = await client.get('/donations?page=1&limit=50');
      // API returns { data: [...], total: X }
      const list = data.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setDonations(list);
    } catch (error) {
      console.error("Failed to fetch donation history", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = (donation) => {
    // If we have a stored reference code or ID, we can redirect to a receipt view or download
    if (donation.receiptReference) {
      // In a real app, this might open a window for printing or download a generated PDF
      window.open(`/donor/receipt?id=${donation.id}`, '_blank');
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Contribution Legacy</h1>
            <p className="text-slate-500 font-medium mt-1 italic">Tracking the impact of your generosity across the Hatton Education Zone.</p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-blue-700 uppercase tracking-wider">Verified Records</span>
          </div>
        </div>

        {donations.length === 0 ? (
          <Card className="border-none shadow-xl bg-slate-50/50">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                <Heart className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No Contributions Recorded</h3>
              <p className="text-slate-500 max-w-sm mt-2">You haven't made any donations yet. Browse verified student requests and make your first impact today.</p>
              <Button 
                className="mt-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 px-8"
                onClick={() => window.location.href = '/donor/browse-requests'}
              >
                Find a Student to Support
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
               <Card className="p-4 border-none shadow-sm bg-blue-600 text-white">
                  <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Total Impact</p>
                  <p className="text-2xl font-black italic">LKR {donations.reduce((sum, d) => sum + Number(d.amount), 0).toLocaleString()}</p>
               </Card>
               <Card className="p-4 border-none shadow-sm bg-white">
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Total Requests Funded</p>
                  <p className="text-2xl font-black text-slate-900">{donations.length}</p>
               </Card>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-[180px] font-bold text-slate-400 text-[10px] uppercase pl-8">Submission Date</TableHead>
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase">Beneficiary / Allocation</TableHead>
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase">Payment Method</TableHead>
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase text-right">Amount (LKR)</TableHead>
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase text-center">Protocol Status</TableHead>
                    <TableHead className="w-[100px] pr-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((donation) => (
                    <TableRow key={donation.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                      <TableCell className="pl-8 py-5">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-slate-300" />
                          <span className="font-medium text-slate-600">{new Date(donation.createdAt).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">
                            {donation.request?.category || 'General Welfare Fund'}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
                            {donation.request?.referenceCode || `TXN-${donation.id}`}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] border-slate-100 bg-slate-50 text-slate-500 font-bold">
                          {donation.paymentMethod?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-black text-slate-900 tracking-tight">
                          {Number(donation.amount).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={donation.status} />
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex justify-end gap-2">
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                            onClick={() => handleDownloadReceipt(donation)}
                            title="View Receipt"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TrackDonations;
