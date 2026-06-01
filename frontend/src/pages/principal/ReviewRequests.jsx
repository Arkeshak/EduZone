import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout'; // Our standard layout wrapper
import { Card, CardContent } from '@/components/ui/card'; // UI Library components
import { Button } from '@/components/ui/button'; // UI Library components
import { Check, X, Eye } from 'lucide-react'; // Icons
import { toast } from 'sonner'; // Notification alerts
import client, { API_BASE_URL } from '@/services/apiClient'; // API client for backend calls
import LoadingSpinner from '@/components/LoadingSpinner'; // Loading icon
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'; // Modal/Popup
import { Textarea } from '@/components/ui/textarea'; // Multi-line input
import { Label } from '@/components/ui/label'; // Input label
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'; // Tab switching system
import StatusBadge from '@/components/StatusBadge'; // Custom badge showing status colors

/**
 * REVIEW REQUESTS PAGE (Principal)
 * 
 * Purpose: This is where a Principal reviews requests submitted by their teachers.
 * They can either 'Approve' (send to ZEO) or 'Reject' (send back to teacher).
 */
const ReviewRequests = () => {
    // STATE: Stores all welfare requests fetched from the database
    const [allRequests, setAllRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // STATE: Rejection Modal management (stores ID and the typed reason)
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectingRequestId, setRejectingRequestId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [updating, setUpdating] = useState(false);

    // FETCH DATA: Runs when the page first opens
    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await client.get('/welfare');
            // Clean up the data array before saving to state
            const requestList = data.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
            setAllRequests(requestList);
        } catch (error) {
            toast.error("Failed to fetch requests");
            setAllRequests([]);
        } finally {
            setLoading(false);
        }
    };

    // ACTION: Approves a request and sends it forward to the ZEO level
    const handleApprove = async (id) => {
        try {
            await client.patch(`/welfare/${id}/status`, { status: 'PRINCIPAL_APPROVED' });
            toast.success("Request Approved successfully.");
            fetchRequests(); // Reload the list to show the change
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to approve request");
        }
    };

    // ACTION: Opens the rejection popup
    const openRejectModal = (id) => {
        setRejectingRequestId(id);
        setRejectionReason('');
        setIsRejectModalOpen(true);
    };

    // ACTION: Submits the rejection reason to the server
    const submitRejection = async (e) => {
        e.preventDefault();
        if (!rejectionReason.trim()) {
            toast.error("Rejection reason is required.");
            return;
        }

        setUpdating(true);
        try {
            // Update status to REJECTED and add the principal's remarks
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

    // DATA SPLITTING: We divide the main list into 3 tabs based on their status
    const pendingRequests = allRequests.filter(r => r.status === 'SUBMITTED'); // New requests from teachers
    const approvedRequests = allRequests.filter(r => ['PRINCIPAL_APPROVED', 'ZEO_APPROVED', 'PUBLISHED', 'PARTIALLY_FUNDED', 'FULLY_FUNDED', 'TRANSFERRED'].includes(r.status));
    const rejectedRequests = allRequests.filter(r => r.status === 'REJECTED');

    // HELPER: Renders a single request item
    const renderRequestCard = (request, isPending) => (
        <Card key={request.id} className="text-slate-900">
            <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{request.student?.name || 'Unknown Student'}</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{request.category}</span>
                        {!isPending && <StatusBadge status={request.status} />}
                    </div>
                    <p className="text-sm text-gray-500">Grade: {request.student?.currentGrade} • Cost: Rs. {request.amountRequired || request.cost}</p>
                    <p className="text-sm mt-2 text-slate-700 leading-relaxed italic">"{request.description}"</p>
                    <p className="text-xs text-gray-400 mt-1">Requested by: {request.teacher?.name} on {new Date(request.createdAt).toLocaleDateString()}</p>
                    
                    {/* Show WHY it was rejected if it is in the rejected list */}
                    {request.status === 'REJECTED' && request.approvals?.find(a => a.decision === 'REJECTED')?.remarks && (
                        <p className="text-xs text-red-600 mt-2 font-medium bg-red-50 p-2 rounded-md inline-block">
                            Rejection Reason: {request.approvals.find(a => a.decision === 'REJECTED').remarks}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 self-start md:self-center">
                    {/* VIEW EVIDENCE: Opens the uploaded proof document in a new tab */}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-slate-700 border-slate-200"
                        onClick={() => {
                            const url = `${API_BASE_URL}${request.evidenceUrl}`;
                            window.open(url, '_blank');
                        }} 
                        disabled={!request.evidenceUrl}
                    >
                        <Eye className="w-4 h-4 mr-2" /> Evidence
                    </Button>
                    {isPending && (
                        /* DECISION BUTTONS: Only shown for new (Submitted) requests */
                        <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(request.id)}>
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
                {/* PAGE HEADER */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Review Welfare Requests</h1>
                    <p className="text-gray-600">Approve teacher submissions or reject them with feedback.</p>
                </div>

                {/* TABS: Switch between different request lists */}
                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="mb-4 bg-gray-100/50 p-1">
                        <TabsTrigger value="pending" className="data-[state=active]:bg-white">Pending ({pendingRequests.length})</TabsTrigger>
                        <TabsTrigger value="approved" className="data-[state=active]:bg-white">Approved history ({approvedRequests.length})</TabsTrigger>
                        <TabsTrigger value="rejected" className="data-[state=active]:bg-white">Rejected history ({rejectedRequests.length})</TabsTrigger>
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

            {/* REJECTION POPUP: Collects the reason for denying a request */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent className="sm:max-w-[425px] text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="font-bold">Reject Welfare Request</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this request. This will be shown to the teacher.
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
