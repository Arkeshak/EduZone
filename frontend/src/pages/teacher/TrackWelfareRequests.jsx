import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Edit, Trash2, FileText, CheckCircle, AlertCircle, Clock, Heart, ExternalLink, Info } from 'lucide-react';
import client from '@/services/apiClient';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TrackWelfareRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [editFormData, setEditFormData] = useState({ description: '', category: '', amountRequired: '' });
  const [welfareTypes, setWelfareTypes] = useState([]);
  const [updating, setUpdating] = useState(false);

  // Delete State
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Donations Modal
  const [isDonationsModalOpen, setIsDonationsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestDonations, setRequestDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);

  /**
   * DATA FETCHING: Welfare Requests
   * Purpose: Retrieves all welfare requests submitted by the current teacher.
   * Action: 
   * 1. Calls GET /api/welfare.
   * 2. Unwraps the paginated response to extract the request array.
   * 3. Updates the 'requests' state for rendering.
   */
  const fetchRequests = async () => {
    try {
      const { data } = await client.get('/welfare');
      // Step: Normalize different possible API response structures
      const requestList = data.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setRequests(requestList);
    } catch (error) {
      console.error("Failed to fetch requests", error);
      toast.error("Failed to fetch requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const { data } = await client.get('/welfare-types');
      // data is already unwrapped by apiClient interceptor
      setWelfareTypes(Array.isArray(data) ? data.map(t => t.name) : []);
    } catch (err) {
      console.error('Failed to fetch types', err);
      setWelfareTypes(['Books', 'Uniforms', 'Fees', 'Other']);
    }
  };

  const confirmDelete = async () => {
    try {
      await client.delete(`/welfare/${requestToDelete}`);
      toast.success("Request deleted successfully");
      setRequests(requests.filter(req => req.id !== requestToDelete));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete request");
    }
  };

  const openEditModal = (req) => {
    setEditingRequest(req);
    setEditFormData({
      description: req.description || '',
      category: req.category || req.type || '',
      amountRequired: req.amountRequired || req.cost || ''
    });
    setIsEditModalOpen(true);
  };

  /**
   * UPDATE HANDLER
   * Purpose: Allows editing a request before it is approved or if it was rejected.
   * Action: Submits updated description/category/amount to the backend via PUT.
   */
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // API call to modify existing record
      await client.put(`/welfare/${editingRequest.id}`, {
        description: editFormData.description,
        category: editFormData.category,
        amountRequired: editFormData.amountRequired
      });
      toast.success("Request updated successfully");
      fetchRequests(); // Step: Re-fetch list to show latest changes
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update request");
    } finally {
      setUpdating(false);
    }
  };

  const openDonationsModal = async (req) => {
    setSelectedRequest(req);
    setIsDonationsModalOpen(true);
    setLoadingDonations(true);
    try {
      const { data } = await client.get(`/donations?welfareRequestId=${req.id}`);
      setRequestDonations(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      toast.error("Failed to load donations");
    } finally {
      setLoadingDonations(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  // Filter Data for Tabs
  const activeRequests = requests.filter(r => ['SUBMITTED', 'PRINCIPAL_APPROVED', 'ZEO_APPROVED', 'PUBLISHED', 'PARTIALLY_FUNDED'].includes(r.status));
  const fundedRequests = requests.filter(r => ['FULLY_FUNDED', 'TRANSFERRED'].includes(r.status));
  const rejectedRequests = requests.filter(r => r.status === 'REJECTED');

  /**
   * DATA TABLE RENDERER
   * Purpose: Reusable function to display request lists in different tabs.
   * Action: Renders table headers, iterating rows, and showing conditional action buttons.
   * Elements: Status badges, progress bars, and manage buttons (Edit/Delete).
   */
  const renderTable = (data, showActions = false) => (
    <div className="overflow-x-auto bg-white rounded-xl border shadow-sm">
      <table className="w-full">
        {/* ... table content ... */}
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Student / ID</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Type & Amount</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Funding Progress</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Status / Feedback</th>
            {showActions && <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Manage</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map(request => (
            <tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-6 py-4">
                <div className="font-bold text-slate-900">{request.student?.name || 'Assigned Student'}</div>
                <div className="text-[10px] text-slate-400 font-mono">REF: {request.referenceCode || `#${request.id}`}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-slate-700">{request.category || request.type}</div>
                <div className="text-sm font-black text-blue-600">LKR {Number(request.amountRequired || request.cost).toLocaleString()}</div>
              </td>
              <td className="px-6 py-4">
                {['PUBLISHED', 'PARTIALLY_FUNDED', 'FULLY_FUNDED', 'TRANSFERRED'].includes(request.status) ? (
                  <div className="space-y-2 max-w-[150px]">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-400">Received</span>
                      <span className="text-blue-600">
                        {Math.round((request.donations?.reduce((sum, d) => sum + Number(d.amount), 0) / Number(request.amountRequired || request.cost)) * 100)}%
                      </span>
                    </div>
                    <Progress value={(request.donations?.reduce((sum, d) => sum + Number(d.amount), 0) / Number(request.amountRequired || request.cost)) * 100} className="h-1.5 bg-slate-100" />
                    <button 
                      onClick={() => openDonationsModal(request)}
                      className="flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase"
                    >
                      <Heart className="w-3 h-3 fill-current" /> {request.donations?.length || 0} Contributions
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-300 font-medium italic">Not yet published</span>
                )}
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={request.status} />
                {request.status === 'REJECTED' && request.approvals?.find(a => a.decision === 'REJECTED')?.remarks && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-md border border-red-100 max-w-xs font-medium">
                    Reason: {request.approvals.find(a => a.decision === 'REJECTED').remarks}
                  </div>
                )}
              </td>
              {showActions && (
                <td className="px-6 py-4 text-right">
                  {request.status === 'SUBMITTED' ? (
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => openEditModal(request)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => { setRequestToDelete(request.id); setIsDeleteDialogOpen(true); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : request.status === 'REJECTED' ? (
                    <Button variant="outline" size="sm" className="h-8 text-xs font-bold hover:bg-blue-50 text-blue-600 border-blue-100" onClick={() => openEditModal(request)}>
                      Revise Request
                    </Button>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">Read Only</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Welfare Requests</h1>
            <p className="text-slate-500 text-sm">Monitor implementation and funding progress for your students.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={() => window.location.href='/teacher/submit-welfare'}>
            + New Request
          </Button>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-4 bg-slate-100/50 p-1">
            <TabsTrigger value="active" className="gap-2 data-[state=active]:bg-white">
              <Clock className="w-4 h-4" /> Active ({activeRequests.length})
            </TabsTrigger>
            <TabsTrigger value="funded" className="gap-2 data-[state=active]:bg-white">
              <CheckCircle className="w-4 h-4" /> Funded ({fundedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2 data-[state=active]:bg-white">
              <AlertCircle className="w-4 h-4" /> Rejected ({rejectedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeRequests.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed text-slate-400 flex flex-col items-center">
                <FileText className="w-12 h-12 mb-4 opacity-10 text-slate-900" />
                <p className="font-medium italic">No active requests found.</p>
              </div>
            ) : (
              renderTable(activeRequests, true)
            )}
          </TabsContent>

          <TabsContent value="funded">
            {fundedRequests.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed text-slate-400 flex flex-col items-center">
                <CheckCircle className="w-12 h-12 mb-4 opacity-10 text-green-900" />
                <p className="font-medium italic">No requests have been fully funded yet.</p>
              </div>
            ) : (
              renderTable(fundedRequests, false)
            )}
          </TabsContent>

          <TabsContent value="rejected">
            {rejectedRequests.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed text-slate-400 flex flex-col items-center">
                <AlertCircle className="w-12 h-12 mb-4 opacity-10 text-red-900" />
                <p className="font-medium italic">Great! No requests have been rejected.</p>
              </div>
            ) : (
              renderTable(rejectedRequests, true)
            )}
          </TabsContent>
        </Tabs>

        {/* 
          EDIT MODAL
          Purpose: Provides a form interface to correct or update request details.
          Action: Updates component state via handleUpdate on submission.
        */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" /> Edit Welfare Request
              </DialogTitle>
              <DialogDescription>
                Correct any details requested by the Principal or ZEO.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category" className="font-bold">Category</Label>
                <select
                  id="edit-category"
                  value={editFormData.category}
                  onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                >
                  <option value="">Select Category</option>
                  {welfareTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-amount" className="font-bold">Required Amount (LKR)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  value={editFormData.amountRequired}
                  onChange={e => setEditFormData({ ...editFormData, amountRequired: e.target.value })}
                  className="focus-visible:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="font-bold">Detailed Reason</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="min-h-[120px] focus-visible:ring-blue-500"
                  required
                />
              </div>
              <DialogFooter className="mt-6 flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-[120px]" disabled={updating}>
                  {updating ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete AlertDialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the welfare request for this student.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
                Yes, Delete Request
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 
          DONATIONS BREAKDOWN MODAL
          Purpose: Transparently shows which donors have contributed to the request.
          Action: Fetches donation list for the specific request ID from the backend.
        */}
        <Dialog open={isDonationsModalOpen} onOpenChange={setIsDonationsModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 animate-pulse" /> Donation Breakdown
              </DialogTitle>
              <DialogDescription>
                Beneficiary: {selectedRequest?.student?.name} ({selectedRequest?.category})
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
               {loadingDonations ? (
                 <LoadingSpinner />
               ) : requestDonations.length === 0 ? (
                 <div className="py-10 text-center text-slate-400 italic">No verified donations found for this request.</div>
               ) : (
                 <div className="space-y-3">
                    {requestDonations.map(donation => (
                      <div key={donation.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600">
                             <Heart className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">{donation.donorName}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{new Date(donation.createdAt).toLocaleDateString()} via {donation.paymentMethod}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-blue-600">LKR {Number(donation.amount).toLocaleString()}</p>
                          <Badge className="text-[9px] bg-green-100 text-green-700 border-green-200 uppercase font-bold">VERIFIED</Badge>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-dashed mt-4">
                       <div className="flex justify-between items-center px-2">
                         <span className="text-sm font-bold text-slate-500 uppercase">Total Received</span>
                         <span className="text-xl font-black text-slate-900 underline decoration-blue-500">
                           LKR {requestDonations.reduce((sum, d) => sum + Number(d.amount), 0).toLocaleString()}
                         </span>
                       </div>
                    </div>
                 </div>
               )}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsDonationsModalOpen(false)} className="bg-slate-900 text-white rounded-xl">Close Overview</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TrackWelfareRequests;
