import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, Calendar, Eye, Clock, FileText, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import client from '@/services/apiClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TeacherCirculars = () => {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCircular, setSelectedCircular] = useState(null);

  useEffect(() => {
    fetchCirculars();
  }, []);

  const fetchCirculars = async () => {
    try {
      const { data } = await client.get('/circulars');
      setCirculars(data);
    } catch (error) {
      console.error("Failed to load circulars");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center p-20">
        <Clock className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Zonal Circulars</h1>
            <p className="text-slate-500 text-sm font-medium">Official announcements and academic guidelines for all staff.</p>
          </div>
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
            Staff Portal
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circulars.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">No announcements released yet.</p>
            </div>
          ) : (
            circulars.map((circular) => (
              <Card 
                key={circular.id} 
                className="group hover:border-blue-500 transition-all border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 flex flex-col cursor-pointer"
                onClick={() => setSelectedCircular(circular)}
              >
                <CardHeader className="p-6 pb-2">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-slate-100 text-slate-600 border-slate-200 font-black text-[9px] uppercase tracking-widest">
                       Official Notice
                    </Badge>
                    <span className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      <Calendar className="w-3.5 h-3.5 mr-1" /> {new Date(circular.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-black tracking-tight line-clamp-2 text-slate-800 group-hover:text-blue-600 transition-colors uppercase leading-tight">
                    {circular.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 flex-1">
                  <p className="text-slate-500 text-sm line-clamp-3 mb-6 font-medium leading-relaxed">
                    {circular.message}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Education Office</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="font-black text-[10px] uppercase tracking-widest text-blue-600 hover:bg-blue-50 h-8 px-3"
                    >
                      Read Now <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Focused Reading View */}
        <Dialog open={!!selectedCircular} onOpenChange={() => setSelectedCircular(null)}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-2">
                 <FileText className="w-4 h-4" /> Official Staff Announcement
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                {selectedCircular?.title}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-4 pt-2 font-bold text-slate-400 uppercase text-[10px]">
                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> Posted: {new Date(selectedCircular?.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center underline decoration-slate-200">Zonal Education Authority</span>
              </DialogDescription>
            </DialogHeader>

            <div className="py-8 border-y border-slate-100 mt-4 border-dashed">
              <div className="prose prose-slate max-w-none">
                <p className="whitespace-pre-wrap text-slate-700 font-medium leading-[1.8] text-lg font-serif">
                  {selectedCircular?.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
               <Button onClick={() => setSelectedCircular(null)} className="font-bold bg-slate-900 px-8 h-12 shadow-lg">Acknowledged</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TeacherCirculars;
