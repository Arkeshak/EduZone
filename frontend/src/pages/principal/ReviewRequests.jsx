import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import client from '@/services/apiClient';
import LoadingSpinner from '@/components/LoadingSpinner';

const ReviewRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await client.get('/welfare');
            // Filter for 'SUBMITTED' requests (which means Pending Principal Approval)
            setRequests(data.filter(r => r.status === 'SUBMITTED'));
        } catch (error) {
            toast.error("Failed to fetch requests");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        let reason = null;
        if (status === 'Rejected') {
            reason = prompt("Please provide a reason for rejection (e.g., 'Incomplete documents'):");
            if (!reason) return; // Cancel if no reason provided
        }

        try {
            // status should be 'PRINCIPAL_APPROVED' or 'REJECTED'
            await client.patch(`/welfare/${id}/status`, { status, rejectionReason: reason });
            toast.success(`Request ${status === 'PRINCIPAL_APPROVED' ? 'Approved' : 'Rejected'}`);
            fetchRequests(); // Refresh list
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Review Welfare Requests</h1>
                    <p className="text-gray-600">Approve or reject incoming student welfare requests.</p>
                </div>

                {requests.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                        <p className="text-gray-500">No pending requests found.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {requests.map(request => (
                            <Card key={request.id}>
                                <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{request.student?.name || 'Unknown Student'}</h3>
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{request.category}</span>
                                        </div>
                                        <p className="text-sm text-gray-500">Grade: {request.student?.currentGrade} • Cost: Rs. {request.cost}</p>
                                        <p className="text-sm mt-2">{request.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">Requested by: {request.teacher?.name}</p>
                                    </div>

                                    <div className="flex items-center gap-2 self-start md:self-center">
                                        <Button variant="outline" size="sm" onClick={() => window.open(request.evidenceUrl, '_blank')} disabled={!request.evidenceUrl}>
                                            <Eye className="w-4 h-4 mr-2" /> Evidence
                                        </Button>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(request.id, 'PRINCIPAL_APPROVED')}>
                                            <Check className="w-4 h-4 mr-2" /> Approve
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleAction(request.id, 'REJECTED')}>
                                            <X className="w-4 h-4 mr-2" /> Reject
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ReviewRequests;
