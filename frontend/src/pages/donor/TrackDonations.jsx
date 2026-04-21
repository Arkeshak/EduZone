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

  /**
   * DATA FETCHING: Donation History
   * Purpose: Retrieves all verified and pending donations made by the current user.
   * Action: Calls GET /api/donations with pagination parameters.
   */
  const fetchDonations = async () => {
    try {
      const { data } = await client.get('/donations?page=1&limit=50');
      // Step: Normalize list extraction from paginated response
      const list = data.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setDonations(list);
    } catch (error) {
      console.error("Failed to fetch donation history", error);
    } finally {
      setLoading(false);
    }
  };
   /**
   * RECEIPT GENERATOR (CLIENT-SIDE)
   * Purpose: Provides an immediate, downloadable proof of contribution.
   * Action: Opens a new print-formatted browser window and populates it with a dynamic HTML/CSS receipt template.
   * Validation: Prompts user to allow popups if blocked.
   */
  const handleDownloadReceipt = (donation) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    // ... logic ...
    if (!printWindow) {
      alert("Please allow popups to download receipts");
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Donation Receipt - ${donation.request?.referenceCode || `TXN-${donation.id}`}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; line-height: 1.6; padding: 40px; }
            .receipt-card { border: 2px solid #e2e8f0; padding: 40px; border-radius: 20px; max-width: 600px; margin: auto; }
            .header { text-align: center; border-bottom: 2px dashed #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #2563eb; margin: 0 0 10px 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
            .label { font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
            .value { font-weight: 600; font-size: 16px; }
            .amount { font-size: 24px; color: #2563eb; font-weight: 900; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <h1>OFFICIAL DONATION RECEIPT</h1>
              <p style="margin: 0; color: #64748b; font-weight: 500;">Eduzone Welfare System</p>
            </div>
            
            <div class="row">
              <span class="label">Date</span>
              <span class="value">${new Date(donation.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div class="row">
              <span class="label">Receipt No.</span>
              <span class="value">RCPT-${new Date().getFullYear()}-${String(donation.id).padStart(4, '0')}</span>
            </div>
            
            <div class="row">
              <span class="label">Reference ID</span>
              <span class="value">${donation.request?.referenceCode || `TXN-${donation.id}`}</span>
            </div>

            <div class="row">
              <span class="label">Beneficiary</span>
              <span class="value">${donation.request?.category || 'General Welfare Fund'}</span>
            </div>
            
            <div class="row">
              <span class="label">Payment Method</span>
              <span class="value">${donation.paymentMethod ? donation.paymentMethod.replace('_', ' ') : 'Bank Transfer'}</span>
            </div>
            
            <div class="row" style="border: none; margin-top: 30px; align-items: center;">
              <span class="label" style="font-size: 16px;">Total Amount</span>
              <span class="amount">LKR ${Number(donation.amount).toLocaleString()}</span>
            </div>
            
            <div class="footer">
              <p>This is an electronically generated receipt for Eduzone Welfare System.<br/>Thank you for your generous contribution!</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.setTimeout(function(){ window.close(); }, 500); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
          /* EMPTY STATE: Encourages first-time donatons */
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
            {/* 
              IMPACT DASHBOARD
              Summarizes total LKR value and quantity of contributions.
            */}
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
