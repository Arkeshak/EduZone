import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, X, Search, Info } from 'lucide-react';
import { toast } from 'sonner';
import client from '@/services/apiClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import StatusBadge from '@/components/StatusBadge';

/**
 * WelfareApproval Component (ZEO Portal)
 * Handles the final publishing of welfare requests to the Donor Portal.
 * Includes history tracking for published and rejected requests.
 */
const WelfareApproval = () => {
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('All');

  // Rejection Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [selectedSchool]);

  const fetchSchools = async () => {
    try {
      const { data } = await client.get('/schools');
      setSchools(data);
    } catch (error) {
      console.error("Failed to fetch schools");
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const query = selectedSchool !== 'All' ? `?schoolId=${selectedSchool}` : '';
      const { data } = await client.get(`/welfare${query}`);
      // Handle paginated response: { data: [], total: X ... }
      const requestList = data.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setAllRequests(requestList);
    } catch (error) {
      console.error("Failed to fetch approvals", error);
      toast.error("Failed to fetch requests");
      setAllRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await client.patch(`/welfare/${id}/status`, { status: 'PUBLISHED' });
      toast.success(`Request published to Donor Portal!`);
      fetchRequests();
    } catch (error) {
      toast.error("Failed to publish request");
    }
  };

  const openRejectModal = (id) => {
    setRejectingRequestId(id);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const submitRejection = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }

    setUpdating(true);
    try {
      await client.patch(`/welfare/${rejectingRequestId}/status`, { 
        status: 'REJECTED', 
        remarks: rejectionReason 
      });
      toast.success(`Request rejected.`);
      setIsRejectModalOpen(false);
      fetchRequests();
    } catch (error) {
      toast.error("Failed to reject request");
    } finally {
      setUpdating(false);
    }
  };

  if (loading && allRequests.length === 0) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  // Data Splitting for Tabs
  const pendingRequests = allRequests.filter(r => r.status === 'PRINCIPAL_APPROVED');
  const publishedRequests = allRequests.filter(r => ['PUBLISHED', 'PARTIALLY_FUNDED', 'FULLY_FUNDED', 'TRANSFERRED'].includes(r.status));
  const rejectedRequests = allRequests.filter(r => r.status === 'REJECTED');

  const renderRequestCard = (request, isPending) => (
    <Card key={request.id} className={`overflow-hidden transition-shadow hover:shadow-md ${isPending ? 'border-l-4 border-l-blue-500' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <div className="space-y-1">
          <CardTitle className="text-lg">{request.student?.name || 'Unknown Student'}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium">{request.schoolData?.name || request.school?.name || 'Unknown School'}</span>
            <span>•</span>
            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{request.category || request.type}</span>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </CardHeader>
      <CardContent className="pb-4">
        <div className="bg-slate-50 p-3 rounded-md mb-3 flex justify-between items-center text-sm">
          <div>
            <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">Required Funds</span>
            <span className="text-lg font-black text-blue-600">LKR {Number(request.amountRequired || request.cost).toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">Submitted By</span>
            <span className="font-medium">{request.teacher?.name || 'Teacher'}</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 italic">"{request.description}"</p>
        
        {request.status === 'REJECTED' && request.approvals?.find(a => a.decision === 'REJECTED')?.remarks && (
          <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-700 flex gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span><strong>Rejection Reason:</strong> {request.approvals.find(a => a.decision === 'REJECTED').remarks}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50/50 border-t py-3 flex justify-end space-x-3">
        <Button variant="ghost" size="sm" onClick={() => window.open(request.evidenceUrl, '_blank')} disabled={!request.evidenceUrl}>
          View Evidence
        </Button>
        {isPending && (
          <>
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => openRejectModal(request.id)}>
              Reject
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handlePublish(request.id)}>
              <Globe className="w-4 h-4 mr-2" /> Publish to Donors
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welfare Administration</h1>
            <p className="text-gray-600">Review principal-approved requests and publish to common donor platform.</p>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
            <Search className="w-4 h-4 text-gray-400 ml-2" />
            <select
              className="bg-transparent px-2 py-1.5 text-sm focus:outline-none min-w-[180px]"
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
            >
              <option value="All">All Schools</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="bg-slate-100 p-1 mb-4">
            <TabsTrigger value="pending" className="data-[state=active]:bg-white">Pending ({pendingRequests.length})</TabsTrigger>
            <TabsTrigger value="published" className="data-[state=active]:bg-white">Published History ({publishedRequests.length})</TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-white">Rejected ({rejectedRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
                <p className="text-gray-400 font-medium italic">No requests are currently waiting for your approval.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {pendingRequests.map(req => renderRequestCard(req, true))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="published">
            {publishedRequests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
                <p className="text-gray-400 font-medium italic">You haven't published any requests yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {publishedRequests.map(req => renderRequestCard(req, false))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected">
            {rejectedRequests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
                <p className="text-gray-400 font-medium italic">No rejected requests in history.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {rejectedRequests.map(req => renderRequestCard(req, false))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Rejection Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <X className="w-5 h-5" /> Reject Welfare Request
            </DialogTitle>
            <DialogDescription>
              This request will be sent back to the teacher. Please provide a clear reason for the rejection.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitRejection} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="zeo-rejection-reason" className="text-sm font-bold">Reason for Rejection *</Label>
              <Textarea
                id="zeo-rejection-reason"
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="min-h-[120px] focus-visible:ring-red-500"
                placeholder="E.g., Request doesn't meet regional guidelines, excessive cost without proof..."
                required
              />
            </div>
            <DialogFooter className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="destructive" disabled={updating} className="min-w-[120px]">
                {updating ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WelfareApproval;
