import { useState } from 'react';
import { SUBJECTS, GRADES } from '@/utils/subjects';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import client from '@/services/apiClient';
import { useNavigate } from 'react-router-dom';
import FileUploader from '@/components/FileUploader';

/**
 * UPLOAD RESOURCE PAGE
 * 
 * File Purpose: Creation form for teachers to share study materials.
 * Features:
 * - Metadata capture: Title, Grade, Subject, Description.
 * - Multi-format file support (PDF, JPG, DOC).
 * - Immediate visual feedback on successful upload.
 * 
 * Flow: Fill metadata → Select file → Post multipart form → Show success state.
 */

const UploadResource = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    grade: '',
    subject: ''
  });
  const [file, setFile] = useState(null);

  /**
   * RESOURCE SUBMISSION HANDLER
   * Purpose: Packages metadata and local file for server persistence.
   * Action: POST /resources (Multipart)
   * Validation:
   * - Ensures a file is physically selected before attempting network request.
   * - Sets success state to toggle UI between form and acknowledgment view.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file to upload");

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('grade', formData.grade);
      data.append('subject', formData.subject);
      data.append('file', file);

      await client.post('/resources', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
      toast.success('Resource uploaded successfully!');
    } catch (error) {
      console.error("Upload failed", error);
      toast.error(error.response?.data?.message || "Failed to upload resource");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">Upload Successful!</h2>
          <p className="text-gray-600 text-center max-w-md">
            Your study resource has been submitted and is now visible to students.
          </p>
          <Button onClick={() => setSuccess(false)} className="mt-4">
            Upload Another Resource
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Upload Study Material</h1>
          <p className="text-gray-600">Share educational resources with students across the zone</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resource Details</CardTitle>
            <CardDescription>All fields are required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Resource Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Grade 10 Mathematics Past Papers"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Select
                    required
                    value={formData.grade}
                    onValueChange={(val) => setFormData({ ...formData, grade: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map((g) => (
                        <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    required
                    value={formData.subject}
                    onValueChange={(val) => setFormData({ ...formData, subject: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the content..."
                  className="min-h-[100px]"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2 mt-4">
                <FileUploader
                  id="resource-file"
                  label={`File Upload ${file ? `(${file.name})` : ''}`}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setFile(e.target.files[0])}
                  file={file}
                  helperText={file ? "Change file" : "PDF, JPG, PNG up to 5MB"}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Uploading...' : 'Submit Resource'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UploadResource;
