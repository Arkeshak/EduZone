import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Search, 
  FileText, 
  Calendar, 
  Users, 
  Eye, 
  Send, 
  Clock, 
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import client from '@/services/apiClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PublishCircular = () => {
  const [loading, setLoading] = useState(false);
  const [circulars, setCirculars] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCircular, setSelectedCircular] = useState(null);
  const [activeTab, setActiveTab] = useState('compose');

  useEffect(() => {
    fetchCirculars();
  }, []);

  const fetchCirculars = async () => {
    try {
      const { data } = await client.get('/circulars');
      setCirculars(data);
    } catch (error) {
      toast.error('Failed to load circular history');
    } finally {
      setFetching(false);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setLoading(true);

    const title = e.target.title.value;
    const message = e.target.content.value;

    const recipients = [];
    if (e.target.principals.checked) recipients.push('PRINCIPAL');
    if (e.target.teachers.checked) recipients.push('TEACHER');

    const finalRecipients = recipients.length > 0 ? recipients : ['PRINCIPAL', 'TEACHER'];

    try {
      await client.post('/circulars', { 
        title, 
        message, 
        recipients: finalRecipients 
      });
      toast.success('Circular published successfully!');
      e.target.reset();
      fetchCirculars(); // Refresh history
      setActiveTab('history'); // Switch to history to see the result
    } catch (error) {
      toast.error('Failed to publish circular');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCirculars = circulars.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Official Circulars</h1>
            <p className="text-slate-500 text-sm font-medium">Draft, distribute and archive high-priority zonal announcements.</p>
          </div>
          <Badge className="w-fit bg-blue-100 text-blue-700 hover:bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider">
             Administrative Interface
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-100/50 p-1 mb-6">
            <TabsTrigger value="compose" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-8 py-2.5 font-bold flex gap-2">
              <Send className="w-4 h-4" /> Compose New
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-8 py-2.5 font-bold flex gap-2">
              <Clock className="w-4 h-4" /> Sent Records ({circulars.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose">
            <div className="max-w-4xl mx-auto">
              <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-600 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                     </div>
                     <div>
                       <CardTitle className="text-lg">Drafting Interface</CardTitle>
                       <CardDescription>Prepare your official communication carefully.</CardDescription>
                     </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-8">
                  <form onSubmit={handlePublish} className="space-y-8">
                    <div className="space-y-3">
                      <Label htmlFor="title" className="text-xs font-black text-slate-400 uppercase tracking-widest">Formal Subject / Title</Label>
                      <Input 
                        id="title" 
                        placeholder="e.g. Mandatory Professional Development Workshop - May 2024" 
                        className="h-12 border-slate-200 focus:ring-blue-500 font-bold"
                        required 
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="content" className="text-xs font-black text-slate-400 uppercase tracking-widest">Message Body</Label>
                      <Textarea 
                        id="content" 
                        placeholder="Enter the full content of your announcement here..." 
                        className="min-h-[250px] border-slate-200 focus:ring-blue-500 font-medium leading-relaxed" 
                        required 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                      <div className="space-y-4">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Target Stakeholders</Label>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors border-slate-200 w-full group">
                            <Checkbox id="principals" className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600">School Principals</p>
                              <p className="text-[10px] text-slate-400">Distribute to all verified Head of Schools</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors border-slate-200 w-full group">
                            <Checkbox id="teachers" className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600">Academic Staff</p>
                              <p className="text-[10px] text-slate-400">Broadcast to all active regional teachers</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest italic opacity-50">Advanced Options (Upcoming)</Label>
                         <div className="p-8 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center opacity-40">
                           <ArrowUpRight className="w-8 h-8 text-slate-300 mb-2" />
                           <p className="text-[10px] uppercase font-black tracking-tighter text-slate-400">Scheduled Dispatch & File Attachments</p>
                         </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                      <Button variant="ghost" type="button" className="font-bold text-slate-500 h-12 px-8">Discard Draft</Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-12 px-10 font-bold shadow-lg shadow-blue-100" disabled={loading}>
                        {loading ? 'Transmitting...' : 'Dispatch Circular'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Filter sent records by subject..." 
                  className="pl-10 h-11 bg-white border-slate-200 shadow-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {fetching ? (
                <div className="p-20 flex justify-center"><Clock className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : filteredCirculars.length === 0 ? (
                <div className="p-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                  <p className="text-slate-500 font-bold">Archive is currently empty.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCirculars.map((circular) => (
                    <Card key={circular.id} className="group hover:border-blue-500 transition-all border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
                      <CardHeader className="p-5 pb-0">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-green-100 text-green-700 border-green-200 font-black text-[10px] uppercase tracking-widest">{circular.status}</Badge>
                          <span className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter"><Calendar className="w-3 h-3 mr-1" /> {new Date(circular.createdAt).toLocaleDateString()}</span>
                        </div>
                        <CardTitle className="text-lg font-black tracking-tight line-clamp-2 text-slate-800 group-hover:text-blue-600 transition-colors uppercase">
                          {circular.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-5">
                        <p className="text-slate-500 text-sm line-clamp-3 mb-6 font-medium leading-relaxed">
                          {circular.message}
                        </p>
                        
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                          <div className="flex -space-x-2">
                            {circular.recipients?.map((r, idx) => (
                               <div key={idx} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center" title={r.role}>
                                  <Users className="w-3 h-3 text-slate-600" />
                               </div>
                            ))}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="font-black text-[10px] uppercase tracking-widest text-blue-600 hover:bg-blue-50"
                            onClick={() => setSelectedCircular(circular)}
                          >
                            Read Full <Eye className="w-3 h-3 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* View Details Modal */}
        <Dialog open={!!selectedCircular} onOpenChange={() => setSelectedCircular(null)}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-2">
                 <FileText className="w-4 h-4" /> Official Zonal Announcement
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                {selectedCircular?.title}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-4 pt-2 font-bold text-slate-400 uppercase text-[10px]">
                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> Published: {new Date(selectedCircular?.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center"><Users className="w-3 h-3 mr-1" /> Recipients: {selectedCircular?.recipients?.map(r => r.role).join(', ')}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="py-8 border-t border-slate-100 mt-4">
              <div className="prose prose-slate max-w-none">
                <p className="whitespace-pre-wrap text-slate-700 font-medium leading-loose text-lg font-serif italic">
                  {selectedCircular?.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
               <Button onClick={() => setSelectedCircular(null)} className="font-bold bg-slate-900">Close Archive</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PublishCircular;
