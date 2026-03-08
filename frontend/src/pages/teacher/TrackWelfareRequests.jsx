import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Edit, Trash2 } from 'lucide-react';
import client from '@/services/apiClient';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

/**
 * TrackWelfareRequests Component
 * @desc Displays a tabular view of all welfare requests submitted by the logged-in teacher.
 *       Allows teachers to edit or delete requests that are still in the 'SUBMITTED' status.
 *       Uses Radix UI modal for editing request details.
 */
const TrackWelfareRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [editFormData, setEditFormData] = useState({ description: '', category: '', cost: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await client.get('/welfare');
        setRequests(data);
      } catch (error) {
        console.error("Failed to fetch requests", error);
        toast.error("Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this welfare request?")) return;
    try {
      await client.delete(`/welfare/${id}`);
      toast.success("Request deleted successfully");
      setRequests(requests.filter(req => req.id !== id));
    } catch (error) {
      console.error("Delete failed", error);
      toast.error(error.response?.data?.message || "Failed to delete request");
    }
  };

  const openEditModal = (req) => {
    setEditingRequest(req);
    setEditFormData({
      description: req.description || '',
      category: req.category || req.type || '',
      cost: req.cost || req.amountRequired || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const response = await client.put(`/welfare/${editingRequest.id}`, {
        description: editFormData.description,
        category: editFormData.category,
        cost: editFormData.cost
      });
      toast.success("Request updated successfully");
      setRequests(requests.map(req => req.id === editingRequest.id ? { ...req, ...response.data.request, cost: editFormData.cost, category: editFormData.category } : req));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Update failed", error);
      toast.error(error.response?.data?.message || "Failed to update request");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl mb-6 font-bold">Track Welfare Requests</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-10 text-center text-gray-500">You haven't submitted any requests yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.student?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.category || request.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LKR {request.cost}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={request.status} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        {request.status === 'SUBMITTED' ? (
                          <>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600" onClick={() => openEditModal(request)} title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600" onClick={() => handleDelete(request.id)} title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Welfare Request</DialogTitle>
              <DialogDescription>Make changes to your request. Only submitted requests can be edited.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category / Type</Label>
                <Input
                  id="edit-category"
                  value={editFormData.category}
                  onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cost">Estimated Cost (LKR)</Label>
                <Input
                  id="edit-cost"
                  type="number"
                  value={editFormData.cost}
                  onChange={e => setEditFormData({ ...editFormData, cost: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="min-h-[100px]"
                  required
                />
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={updating}>
                  {updating ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TrackWelfareRequests;
