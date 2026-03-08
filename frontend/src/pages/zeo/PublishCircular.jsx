import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import client from '@/services/apiClient';

const PublishCircular = () => {
  const [loading, setLoading] = useState(false);



  const handlePublish = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Get form data
    const title = e.target.title.value;
    const content = e.target.content.value;

    // Determine audience
    let targetAudience = 'all';
    const principals = e.target.principals.checked;
    const teachers = e.target.teachers.checked;

    if (principals && !teachers) targetAudience = 'principals';
    if (!principals && teachers) targetAudience = 'teachers';

    try {
      await client.post('/circulars', { title, content, targetAudience });
      toast.success('Circular published successfully!');
      // Reset form or redirect
    } catch (error) {
      toast.error('Failed to publish circular');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Publish New Circular</h1>
          <p className="text-gray-600">Create and distribute announcements to schools.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Circular Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePublish} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Subject / Title</Label>
                <Input id="title" placeholder="e.g. Term 1 Examination Guidelines" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Message Content</Label>
                <Textarea id="content" placeholder="Type your message here..." className="min-h-[200px]" required />
              </div>

              <div className="space-y-2">
                <Label>Recipients</Label>
                <div className="flex gap-6 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="principals" />
                    <label htmlFor="principals" className="text-sm font-medium">All Principals</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="teachers" />
                    <label htmlFor="teachers" className="text-sm font-medium">All Teachers</label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Attachment</Label>
                <Input type="file" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button">Save Draft</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Publishing...' : 'Publish Circular'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PublishCircular;
