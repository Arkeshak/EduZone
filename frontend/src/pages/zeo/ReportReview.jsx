import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  FileText, 
  Download, 
  School as SchoolIcon, 
  Calendar,
  ChevronRight,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import client from '@/services/apiClient';

const ReportReview = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await client.get('/reports');
      setReports(data || []);
    } catch (error) {
      console.error("Failed to load reports", error);
      toast.error("Failed to load school reports");
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSchool = report.schoolName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMonth = filterMonth ? report.month?.startsWith(filterMonth) : true;
    return matchesSchool && matchesMonth;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Academic Performance Oversight</h1>
            <p className="text-slate-500 text-sm font-medium">Review monthly metrics, attendance trends, and dropout statistics from regional schools.</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="font-bold text-xs uppercase tracking-widest h-10 border-slate-200">
               <Download className="w-3.5 h-3.5 mr-2" /> Export CSV
             </Button>
          </div>
        </div>

        {/* Discovery Bar */}
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-slate-50/30">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search by school name..." 
                  className="pl-10 h-11 bg-white border-slate-200 shadow-sm font-medium focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative w-full md:w-64">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <Input 
                  type="month"
                  className="pl-10 h-11 bg-white border-slate-200 shadow-sm font-medium cursor-pointer"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                />
              </div>
              <Button 
                variant="ghost" 
                className="h-11 font-bold text-slate-500 hover:text-blue-600"
                onClick={() => { setSearchQuery(''); setFilterMonth(''); }}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          {loading ? (
            <div className="p-20 flex justify-center"><Clock className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : filteredReports.length === 0 ? (
            <div className="p-20 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-100" />
              <h3 className="text-lg font-bold text-slate-900">No reports found</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">Try adjusting your filters or search terms to find specific school records.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-left font-black text-slate-400 text-[10px] uppercase tracking-widest">Reporting Month</th>
                    <th className="px-6 py-4 text-left font-black text-slate-400 text-[10px] uppercase tracking-widest">Institution Info</th>
                    <th className="px-6 py-4 text-center font-black text-slate-400 text-[10px] uppercase tracking-widest">Student Att.</th>
                    <th className="px-6 py-4 text-center font-black text-slate-400 text-[10px] uppercase tracking-widest">Staff Att.</th>
                    <th className="px-6 py-4 text-center font-black text-slate-400 text-[10px] uppercase tracking-widest">Dropouts</th>
                    <th className="px-6 py-4 text-right font-black text-slate-400 text-[10px] uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="font-bold text-slate-900">{report.month}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                             <SchoolIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-none">{report.schoolName || 'Unknown School'}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-tighter">Verified Official Report</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <div className="inline-flex items-center gap-1 font-black text-slate-700">
                           {parseFloat(report.averageAttendance) >= 90 ? (
                             <TrendingUp className="w-3 h-3 text-green-500" />
                           ) : (
                             <TrendingDown className="w-3 h-3 text-orange-500" />
                           )}
                           {report.averageAttendance}%
                         </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <Badge variant="outline" className="border-slate-200 font-bold bg-white text-slate-600">
                           {report.staffAttendance}%
                         </Badge>
                      </td>
                      <td className="px-6 py-5 text-center">
                         {parseInt(report.dropoutCount) > 0 ? (
                           <div className="flex items-center justify-center gap-1 text-red-600 font-black">
                             <AlertCircle className="w-3 h-3" /> {report.dropoutCount}
                           </div>
                         ) : (
                           <span className="text-slate-400 font-medium">0</span>
                         )}
                      </td>
                      <td className="px-6 py-5 text-right">
                         <Button variant="ghost" size="sm" className="font-bold text-blue-600 hover:bg-blue-50">
                           Review <ChevronRight className="w-4 h-4 ml-1" />
                         </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportReview;
