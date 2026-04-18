import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, FileText, ArrowRight, Building, Clock, Wallet, ShieldAlert, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import client from '@/services/apiClient';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

const DonationManagement = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Transfer Form State
  const [transferRef, setTransferRef] = useState('');
  const [transferProof, setTransferProof] = useState(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await client.get('/donations');
      setDonations(data);
    } catch (error) {
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndTransfer = async () => {
    if (!transferRef) {
      toast.error("Please enter a bank transfer reference");
      return;
    }
    if (!transferProof) {
      toast.error("Please upload the transfer proof");
      return;
    }

    setTransferLoading(true);
    try {
      // 1. Verify the Donation
      await client.patch(`/donations/${selectedDonation.id}/verify`, { status: 'VERIFIED' });

      // 2. Record the Transfer
      const formData = new FormData();
      formData.append('requestId', selectedDonation.welfareRequestId);
      formData.append('donationId', selectedDonation.id);
      formData.append('amount', selectedDonation.amount);
      formData.append('transferReference', transferRef);
      if (transferProof) {
        formData.append('proof', transferProof);
      }

      await client.post('/transfers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success("Donation verified and funds transferred to school!");
      setIsTransferModalOpen(false);
      setTransferRef('');
      setTransferProof(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification or transfer failed");
    } finally {
      setTransferLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await client.patch(`/donations/${selectedDonation.id}/verify`, {
        status: 'REJECTED',
        rejectionReason: rejectionReason
      });
      toast.success("Donation rejected");
      setIsModalOpen(false);
      setRejectionReason('');
      fetchData();
    } catch (error) {
      toast.error("Failed to reject donation");
    }
  };

  const openTransferModal = (donation) => {
    setSelectedDonation(donation);
    setIsTransferModalOpen(true);
  };

  const openRejectModal = (donation) => {
    setSelectedDonation(donation);
    setIsModalOpen(true);
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center p-20"><Clock className="w-8 h-8 animate-spin text-blue-600" /></div></DashboardLayout>;

  // Filter Data with Search
  const filteredDonations = donations.filter(d => 
    !searchTerm || 
    d.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.request?.referenceCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingDonations = filteredDonations.filter(d => d.status === 'PENDING');
  const verifiedDonations = filteredDonations.filter(d => d.status === 'VERIFIED' || d.status === 'Verified');
  const rejectedDonations = filteredDonations.filter(d => d.status === 'REJECTED' || d.status === 'Rejected');

  const renderDonationTable = (data, isPending = false) => (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden divide-y divide-slate-100">
      {data.length === 0 ? (
        <div className="p-20 text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-10" />
          <p className="font-medium italic">No donations found in this category.</p>
        </div>
      ) : (
        data.map((donation) => (
          <div key={donation.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors gap-6 border-l-4 border-transparent hover:border-blue-500">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-900">{donation.donorName || "Anonymous Donor"}</h3>
                <Badge className={
                  donation.status === 'VERIFIED' || donation.status === 'Verified' ? 'bg-green-100 text-green-700' :
                  donation.status === 'REJECTED' || donation.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }>
                  {donation.status || 'PENDING'}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                <p className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(donation.createdAt).toLocaleDateString()}</p>
                <p className="flex items-center gap-1.5 font-bold text-blue-600 uppercase tracking-tighter">
                  <Wallet className="w-4 h-4" /> {donation.request?.referenceCode || 'General Pool'}
                </p>
              </div>

              {donation.request && (
                <div className="text-sm font-medium text-slate-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 flex items-center gap-2">
                  <span className="font-bold text-blue-700 underline decoration-blue-200 uppercase text-[10px] tracking-widest">{donation.request.category}:</span>
                  <span className="line-clamp-1">{donation.request.description}</span>
                </div>
              )}
              
              {(donation.status === 'REJECTED' || donation.status === 'Rejected') && donation.rejectionReason && (
                 <div className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded border border-red-100 flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5" /> REJECTED: {donation.rejectionReason}
                 </div>
              )}
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right min-w-[140px]">
                <p className="text-2xl font-black text-slate-900 tracking-tight">LKR {Number(donation.amount).toLocaleString()}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{donation.paymentMethod}</p>
              </div>

              <div className="flex gap-2">
                {donation.receiptUrl && (
                  <Button
                    variant="outline"
                    className="h-10 border-slate-200"
                    onClick={() => window.open(`http://localhost:5000/${donation.receiptUrl}`, '_blank')}
                  >
                    <FileText className="w-4 h-4 mr-2" /> Proof
                  </Button>
                )}

                {isPending && (
                  <div className="flex gap-2">
                    <Button
                      className="h-10 bg-blue-600 hover:bg-blue-700 shadow-blue-100 shadow-md"
                      onClick={() => openTransferModal(donation)}
                    >
                      Verify & Transfer
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-10 text-red-600 hover:bg-red-50"
                      onClick={() => openRejectModal(donation)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white p-4 rounded-xl shadow-sm border mb-6">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search donor name, reference ID, or payment method..." 
              className="pl-10 h-11 border-gray-200 focus-visible:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
             <Filter className="w-4 h-4" />
             <span>Active Filter: All Zones</span>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="bg-slate-100/50 mb-4 h-11 p-1">
            <TabsTrigger value="pending" className="gap-2 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Clock className="w-4 h-4 text-amber-600" /> Pending ({pendingDonations.length})
            </TabsTrigger>
            <TabsTrigger value="verified" className="gap-2 px-6 data-[state=active]:bg-white">
              <Check className="w-4 h-4 text-green-600" /> History ({verifiedDonations.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2 px-6 data-[state=active]:bg-white">
              <X className="w-4 h-4 text-red-600" /> Rejected ({rejectedDonations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
             {renderDonationTable(pendingDonations, true)}
          </TabsContent>
          <TabsContent value="verified">
             {renderDonationTable(verifiedDonations, false)}
          </TabsContent>
          <TabsContent value="rejected">
             {renderDonationTable(rejectedDonations, false)}
          </TabsContent>
        </Tabs>

        {/* Transfer & Verification Modal */}
        <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-black">
                <Building className="w-6 h-6 text-blue-600" /> Transfer & Verify
              </DialogTitle>
              <DialogDescription className="font-medium text-slate-500">
                Authorized Fund Release to School Bank Account
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6 border-y my-2 overflow-y-auto max-h-[70vh]">
              <div className="bg-slate-900 p-6 rounded-2xl text-white flex justify-between items-center shadow-2xl">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Donor Contribution</p>
                  <p className="text-lg font-bold">{selectedDonation?.donorName || 'Anonymous Donor'}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-blue-400 tracking-tighter">LKR {Number(selectedDonation?.amount).toLocaleString()}</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase">{selectedDonation?.paymentMethod}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Target className="w-3.5 h-3.5" /> Target School Bank Interface
                </h4>
                {selectedDonation?.request?.schoolData ? (
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="col-span-2">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Holder</p>
                       <p className="text-lg font-black text-slate-800">{selectedDonation.request.schoolData.accountName || 'Principal Welfare Account'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bank</p>
                      <p className="text-sm font-bold text-slate-700">{selectedDonation.request.schoolData.bankName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Branch</p>
                      <p className="text-sm font-bold text-slate-700">{selectedDonation.request.schoolData.branch}</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Number</p>
                      <p className="text-2xl font-black text-blue-600 font-mono tracking-tighter">{selectedDonation.request.schoolData.accountNumber}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-4 text-amber-800">
                    <ShieldAlert className="w-8 h-8 opacity-50" />
                    <div>
                      <p className="font-bold">Missing School Metadata</p>
                      <p className="text-xs">Bank details for this school were not found in the manifest. Manual validation required.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-dashed">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Zonal Office Remittance Details</h4>
                <div className="space-y-4 font-bold">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase tracking-wider">Transfer Reference / Slip ID</label>
                    <input
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-mono text-lg"
                      placeholder="TRX-XXXX-XXXX"
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase tracking-wider">Remittance Proof Engagement</label>
                    <input
                      type="file"
                      className="w-full px-4 py-2 border rounded-xl text-sm bg-white cursor-pointer"
                      onChange={(e) => setTransferProof(e.target.files[0])}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button variant="ghost" className="font-bold" onClick={() => setIsTransferModalOpen(false)}>Abort</Button>
              <Button
                onClick={handleVerifyAndTransfer}
                className="bg-blue-600 hover:bg-blue-700 font-bold px-8 shadow-lg shadow-blue-100"
                disabled={transferLoading}
              >
                {transferLoading ? "Transmitting..." : "Authorize Fund Release"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rejection Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" /> Reject Transaction
              </DialogTitle>
              <DialogDescription>
                Provide a structured reason for invalidating this donor receipt.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <textarea
                className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-red-500 focus:outline-none min-h-[120px] font-medium"
                placeholder="Reason (e.g., Mismatched Amount, Counterfeit Receipt, Account Name Inconsistency...)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700 font-bold px-8 shadow-lg shadow-red-100">Invalidate Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

// Internal Target Icon
const Target = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export default DonationManagement;
