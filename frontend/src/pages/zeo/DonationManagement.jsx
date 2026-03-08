import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, FileText, ArrowRight, Building } from 'lucide-react';
import { toast } from 'sonner';
import client from '@/services/apiClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await client.get('/donations');
      console.log('Donations received in frontend:', data);
      setDonations(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
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
      await client.patch(`/donations/${selectedDonation.id}/verify`, { status: 'Verified' });

      // 2. Record the Transfer
      const formData = new FormData();
      formData.append('requestId', selectedDonation.welfareRequestId);
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
      console.error(error);
      toast.error(error.response?.data?.message || "Verification or transfer failed");
    } finally {
      setTransferLoading(true);
    }
  };

  const handleVerifyOnly = async (id) => {
    try {
      await client.patch(`/donations/${id}/verify`, { status: 'Verified' });
      toast.success("Donation verified successfully!");
      fetchData();
    } catch (error) {
      toast.error("Failed to verify donation");
    }
  };

  const openTransferModal = (donation) => {
    setSelectedDonation(donation);
    setIsTransferModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await client.patch(`/donations/${selectedDonation.id}/verify`, {
        status: 'Rejected',
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

  const openRejectModal = (donation) => {
    setSelectedDonation(donation);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Donation Verification</h1>
          <p className="text-gray-600">Review incoming donations and verify them against provided proofs.</p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-500">Loading donations...</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
              <FileText className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-lg font-medium">No donations for review.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {donations.map((donation) => (
                <div key={donation.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{donation.donorName || "Anonymous"}</h3>
                      <Badge variant={
                        donation.status === 'Verified' ? 'success' :
                          donation.status === 'Rejected' ? 'destructive' : 'secondary'
                      } className={
                        donation.status === 'Verified' ? 'bg-green-100 text-green-700' :
                          donation.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }>
                        {donation.status?.replace(/_/g, ' ') || 'Pending'}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                      <p className="flex items-center gap-1.5"><Building className="w-4 h-4" /> {new Date(donation.createdAt).toLocaleDateString()}</p>
                      <p className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-blue-500" />
                        {donation.request ? (
                          <span className="font-semibold text-blue-600">Ref: {donation.request.referenceId}</span>
                        ) : (
                          <span className="text-amber-600 italic">Unlinked Donation</span>
                        )}
                      </p>
                    </div>

                    {donation.request && (
                      <p className="text-sm text-slate-600 bg-blue-50/50 p-2 rounded-md border border-blue-100 line-clamp-1">
                        <span className="font-semibold">{donation.request.category}:</span> {donation.request.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right min-w-[140px]">
                      <p className="text-2xl font-black text-slate-900 tracking-tight">LKR {Number(donation.amount).toLocaleString()}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{donation.paymentMethod}</p>
                    </div>

                    <div className="flex gap-2">
                      {donation.receiptUrl && (
                        <Button
                          variant="outline"
                          className="border-slate-200"
                          onClick={() => window.open(`http://localhost:5000/${donation.receiptUrl}`, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-2" /> Proof
                        </Button>
                      )}

                      {donation.status === 'PENDING' && (
                        <>
                          <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => openTransferModal(donation)}
                          >
                            <Check className="w-4 h-4 mr-2" /> Verify & Transfer
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => openRejectModal(donation)}
                          >
                            <X className="w-4 h-4 mr-2" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transfer & Verification Modal */}
        <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Transfer to School & Verify
              </DialogTitle>
              <DialogDescription>
                Review donor payment and record your transfer to the school's bank account.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Donor Summary */}
              <div className="bg-slate-50 p-4 rounded-lg border flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Donor Payment</p>
                  <p className="text-lg font-bold">{selectedDonation?.donorName}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-green-600">LKR {Number(selectedDonation?.amount).toLocaleString()}</p>
                  <p className="text-xs font-medium text-slate-500">{selectedDonation?.paymentMethod}</p>
                </div>
              </div>

              {/* School Bank Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 border-b pb-1">Destination School Bank Details</h4>
                {selectedDonation?.request?.schoolData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100 uppercase tracking-tight text-xs">
                    <div>
                      <p className="font-bold text-blue-400 mb-1">Bank Name</p>
                      <p className="text-sm font-black text-slate-700">{selectedDonation.request.schoolData.bankName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-bold text-blue-400 mb-1">Branch</p>
                      <p className="text-sm font-black text-slate-700">{selectedDonation.request.schoolData.branch || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-bold text-blue-400 mb-1">Account Number</p>
                      <p className="text-lg font-black text-blue-700">{selectedDonation.request.schoolData.accountNumber || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-bold text-blue-400 mb-1">Account Holder</p>
                      <p className="text-sm font-black text-slate-700">{selectedDonation.request.schoolData.accountName || 'Principal Account'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 text-amber-700 text-sm rounded-lg border border-amber-100 italic">
                    School bank details not available. Please contact the school.
                  </div>
                )}
              </div>

              {/* ZEO Transfer Action */}
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 gap-4 text-sm font-medium">
                  <div className="space-y-2">
                    <label>Bank Transfer Reference (Receipt No)</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                      placeholder="Enter the transaction reference..."
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Upload Transfer Proof (Image/PDF)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        className="w-full px-3 py-1.5 border rounded-md text-sm bg-white"
                        onChange={(e) => setTransferProof(e.target.files[0])}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setIsTransferModalOpen(false)}>Cancel</Button>
              <Button
                onClick={handleVerifyAndTransfer}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
                disabled={transferLoading}
              >
                {transferLoading ? "Processing..." : "Confirm & Transfer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rejection Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Donation</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this donation. This will be visible to the donor.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <textarea
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none min-h-[100px]"
                placeholder="Reason for rejection (e.g., Receipt is unclear, Transaction ID mismatch...)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <DialogFooter className="sm:justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700">Confirm Rejection</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
};

export default DonationManagement;
