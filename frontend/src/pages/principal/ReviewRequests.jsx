import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import client, { API_BASE_URL } from '@/services/apiClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StatusBadge from '@/components/StatusBadge';

const ReviewRequests = () => {
    const [allRequests, setAllRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectingRequestId, setRejectingRequestId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    /**
     * DATA FETCHING: Welfare Requests
     * Purpose: Retrieves all welfare requests for the Principal's school.
     * Action: Calls GET /api/welfare and stores the result in allRequests state.
     */
    const fetchRequests = async () => {
        try {
            const { data } = await client.get('/welfare');
            // Normalize response to ensure an array is stored
            const requestList = data.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
            setAllRequests(requestList);
        } catch (error) {
            toast.error("Failed to fetch requests");
            setAllRequests([]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * APPROVAL HANDLER
     * Purpose: Advances a request to the ZEO approval phase.
     * Action: Updates the request status to 'PRINCIPAL_APPROVED'.
     * Used for: Confirming that the request is valid at the school level.
     */
    const handleApprove = async (id) => {
        try {
            await client.patch(`/welfare/${id}/status`, { status: 'PRINCIPAL_APPROVED' });
            toast.success("Request Approved successfully.");
            fetchRequests(); // Refresh list to reflect new status
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to approve request");
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
            await client.patch(`/welfare/${rejectingRequestId}/status`, { status: 'REJECTED', remarks: rejectionReason });
            toast.success("Request Rejected successfully.");
            setIsRejectModalOpen(false);
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reject request");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

    const pendingRequests = allRequests.filter(r => r.status === 'SUBMITTED');
    const approvedRequests = allRequests.filter(r => ['PRINCIPAL_APPROVED', 'ZEO_APPROVED', 'PUBLISHED', 'PARTIALLY_FUNDED', 'FULLY_FUNDED', 'TRANSFERRED'].includes(r.status));
    const rejectedRequests = allRequests.filter(r => r.status === 'REJECTED');

    const renderRequestCard = (request, isPending) => (
        <Card key={request.id}>
            <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{request.student?.name || 'Unknown Student'}</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{request.category}</span>
                        {!isPending && <StatusBadge status={request.status} />}
                    </div>
                    <p className="text-sm text-gray-500">Grade: {request.student?.currentGrade} • Cost: Rs. {request.amountRequired || request.cost}</p>
                    <p className="text-sm mt-2">{request.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Requested by: {request.teacher?.name} on {new Date(request.createdAt).toLocaleDateString()}</p>
                    
                    {request.status === 'REJECTED' && request.approvals?.find(a => a.decision === 'REJECTED')?.remarks && (
                        <p className="text-xs text-red-600 mt-2 font-medium bg-red-50 p-2 rounded-md inline-block">
                            Rejection Reason: {request.approvals.find(a => a.decision === 'REJECTED').remarks}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 self-start md:self-center">
                    {/* 
                      VIEW EVIDENCE BUTTON
                      Purpose: Displays supporting documentation uploaded by the teacher.
                      Action: Opens the file URL in a new browser tab.
                    */}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                            const url = `${API_BASE_URL}${request.evidenceUrl}`;
                            console.log('Opening evidence:', url);
                            window.open(url, '_blank');
                        }} 
                        disabled={!request.evidenceUrl}
                    >
                        <Eye className="w-4 h-4 mr-2" /> Evidence
                    </Button>
                    {isPending && (
                        /* ACTION BUTTONS: Only shown for 'SUBMITTED' requests */
                        <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(request.id)}>
                                <Check className="w-4 h-4 mr-2" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => openRejectModal(request.id)}>
                                <X className="w-4 h-4 mr-2" /> Reject
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Review Welfare Requests</h1>
                    <p className="text-gray-600">Approve or reject incoming student welfare requests, and track request history.</p>
                </div>

                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="mb-4 bg-gray-100/50 p-1">
                        <TabsTrigger value="pending" className="data-[state=active]:bg-white">Pending ({pendingRequests.length})</TabsTrigger>
                        <TabsTrigger value="approved" className="data-[state=active]:bg-white">Approved / Forwarded ({approvedRequests.length})</TabsTrigger>
                        <TabsTrigger value="rejected" className="data-[state=active]:bg-white">Rejected ({rejectedRequests.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending">
                        {pendingRequests.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                                <p className="text-gray-500">No pending requests found.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {pendingRequests.map(req => renderRequestCard(req, true))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="approved">
                        {approvedRequests.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                                <p className="text-gray-500">No approved requests found in history.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {approvedRequests.map(req => renderRequestCard(req, false))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="rejected">
                        {rejectedRequests.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                                <p className="text-gray-500">No rejected requests found in history.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {rejectedRequests.map(req => renderRequestCard(req, false))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* 
              REJECTION DIALOG
              Purpose: Collects and submits the rationale for denying a request.
              Action: Updates status to 'REJECTED' along with the provided remarks.
              Validation: Rejection reason is mandatory.
            */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Reject Welfare Request</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this request. This reason will be fully visible to the teacher who submitted it.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitRejection} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rejection-reason" className="font-semibold">Reason for Rejection *</Label>
                            <Textarea
                                id="rejection-reason"
                                value={rejectionReason}
                                onChange={e => setRejectionReason(e.target.value)}
                                className="min-h-[100px] border-red-200 focus:ring-red-500 placeholder:text-gray-400"
                                placeholder="E.g., Missing documents, incomplete cost details, etc."
                                required
                            />
                        </div>
                        <DialogFooter className="mt-6 flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsRejectModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={updating}>
                                {updating ? "Rejecting..." : "Submit Rejection"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default ReviewRequests;
