import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Edit, Trash2, Download, Search, Plus, FileText, AlertCircle, Upload } from 'lucide-react';
import client from '@/services/apiClient';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GRADES, SUBJECTS } from '@/utils/subjects';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

const ManageResources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        grade: '',
        subject: ''
    });
    const [editFile, setEditFile] = useState(null);
    const [updating, setUpdating] = useState(false);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const { data } = await client.get('/resources/my-resources');
            setResources(data);
        } catch (error) {
            console.error("Failed to fetch resources", error);
            toast.error("Failed to load your resources");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this resource? This action cannot be undone.")) return;

        try {
            await client.delete(`/resources/${id}`);
            toast.success("Resource deleted successfully");
            setResources(resources.filter(r => r.id !== id));
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete resource");
        }
    };

    const openEditModal = (resource) => {
        setEditingResource(resource);
        setEditFormData({
            title: resource.title,
            description: resource.description,
            grade: resource.grade.toString(),
            subject: resource.subject
        });
        setEditFile(null);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const data = new FormData();
            data.append('title', editFormData.title);
            data.append('description', editFormData.description);
            data.append('grade', editFormData.grade);
            data.append('subject', editFormData.subject);
            if (editFile) data.append('file', editFile);

            const response = await client.put(`/resources/${editingResource.id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success("Resource updated successfully");
            // The response backend sends { message, resource }
            setResources(resources.map(r => r.id === editingResource.id ? response.data.resource : r));
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Update failed", error);
            toast.error(error.response?.data?.message || "Failed to update resource");
        } finally {
            setUpdating(false);
        }
    };

    const filteredResources = resources.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Study Materials</h1>
                        <p className="text-slate-500 text-sm mt-1">View, edit, or remove resources you've shared with the zone.</p>
                    </div>
                    <Link to="/teacher/upload-resource">
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-md flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Upload New
                        </Button>
                    </Link>
                </div>

                <Card className="border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search by title or subject..."
                                className="pl-9 bg-white border-slate-200"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <CardContent className="p-0">
                        {filteredResources.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
                                <FileText className="w-12 h-12 text-slate-200" />
                                <p>{searchQuery ? "No resources match your search." : "You haven't uploaded any resources yet."}</p>
                                {!searchQuery && (
                                    <Link to="/teacher/upload-resource">
                                        <Button variant="outline" size="sm">Get Started</Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Resource Title</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredResources.map((resource) => (
                                            <tr key={resource.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900 text-sm">{resource.title}</p>
                                                            <p className="text-xs text-slate-500 truncate max-w-[200px]">{resource.description}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 w-fit">
                                                            Grade {resource.grade}
                                                        </span>
                                                        <span className="text-xs text-slate-500 font-medium">{resource.subject}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${resource.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                        resource.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {resource.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {new Date(resource.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                    <a
                                                        href={`http://localhost:5000${resource.fileUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Download"
                                                    >
                                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                    </a>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-slate-400 hover:text-indigo-600"
                                                        title="Edit"
                                                        onClick={() => openEditModal(resource)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-slate-400 hover:text-red-600"
                                                        title="Delete"
                                                        onClick={() => handleDelete(resource.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit Resource</DialogTitle>
                            <DialogDescription>
                                Update the details of your study material.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                    id="edit-title"
                                    value={editFormData.title}
                                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-grade">Grade</Label>
                                    <Select
                                        value={editFormData.grade}
                                        onValueChange={(val) => setEditFormData({ ...editFormData, grade: val })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {GRADES.map(g => (
                                                <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-subject">Subject</Label>
                                    <Select
                                        value={editFormData.subject}
                                        onValueChange={(val) => setEditFormData({ ...editFormData, subject: val })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SUBJECTS.map(s => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                    className="min-h-[100px]"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Update File (Optional)</Label>
                                <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50/50">
                                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                    <p className="text-xs text-gray-600 font-medium">
                                        {editFile ? editFile.name : "Click to select a new file"}
                                    </p>
                                    <Input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setEditFile(e.target.files[0])}
                                    />
                                </div>
                            </div>
                            <DialogFooter className="mt-6">
                                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                    Cancel
                                </Button>
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

export default ManageResources;
