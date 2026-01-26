import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Upload, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const UploadResource = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API upload
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      toast.success('Resource uploaded successfully!');
      // Reset form usually
    }, 1500);
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
            Your study resource has been submitted. It will be visible to students after ZEO approval.
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
                <Input id="title" placeholder="e.g. Grade 10 Mathematics Past Papers" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                        <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maths">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="it">ICT</SelectItem>
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
                />
              </div>

              <div className="space-y-2">
                <Label>File Upload</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Upload className="w-10 h-10 text-gray-400" />
                    <p className="text-sm text-gray-600 font-medium">Click to browse or drag file here</p>
                    <p className="text-xs text-gray-500">PDF, DOCX, images up to 10MB</p>
                    <Input type="file" className="opacity-0 absolute inset-0 w-full h-full cursor-pointer hidden" />
                  </div>
                </div>
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
