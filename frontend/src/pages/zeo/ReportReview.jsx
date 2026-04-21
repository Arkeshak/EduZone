import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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

/**
 * REPORT REVIEW PAGE
 * 
 * File Purpose: Administrative oversight for monitoring regional academic performance.
 * Features:
 * - Monthly Metrics: Tracking student/staff attendance and dropout rates.
 * - Discovery: Filtering reports by school name and month.
 * - Data Export: CSV generation for off-system analysis.
 * - Evaluation: Individual report deeper-dive with Principal remarks.
 */

const ReportReview = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  /**
   * DATA INITIALIZATION
   * Purpose: Gathers all validated school performance reports for the zone.
   * API: GET /reports
   */
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await client.get('/reports');
      const reportsList = data.success ? data.data : (Array.isArray(data) ? data : []);
      setReports(reportsList);
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

  /**
   * CSV EXPORT HANDLER
   * Purpose: Facilitates offline analysis by converting filtered UI data into CSV.
   * Logic: Standard String.join mapping with URI encoded Blob download.
   */
  const handleExportCSV = () => {
    if (filteredReports.length === 0) {
      toast.error("No reports to export");
      return;
    }

    const headers = ['Reporting Month', 'School Name', 'Student Attendance (%)', 'Staff Attendance (%)', 'Dropouts'];
    
    const csvContent = [
      headers.join(','),
      ...filteredReports.map(r => {
        const school = `"${(r.schoolName || 'Unknown School').replace(/"/g, '""')}"`;
        return `${r.month},${school},${r.averageAttendance},${r.staffAttendance},${r.dropoutCount}`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `school_reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("CSV exported successfully");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Academic Performance Oversight</h1>
            <p className="text-slate-500 text-sm font-medium">Review monthly metrics, attendance trends, and dropout statistics from regional schools.</p>
          </div>
          <div className="flex gap-2">
             <Button 
               variant="outline" 
               className="font-bold text-xs uppercase tracking-widest h-10 border-slate-200"
               onClick={handleExportCSV}
             >
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
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           className="font-bold text-blue-600 hover:bg-blue-50"
                           onClick={() => setSelectedReport(report)}
                         >
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

      <Dialog open={!!selectedReport} onOpenChange={(open) => { if(!open) setSelectedReport(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-black">Monthly Evaluation Report</DialogTitle>
                <DialogDescription>
                  Detailed review for <span className="font-bold text-slate-900">{selectedReport.schoolName || 'Unknown'}</span> 
                  {' '}for the month of <b>{selectedReport.month}</b>.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Student Attendance</p>
                    <p className={`text-2xl font-black ${parseFloat(selectedReport.averageAttendance) >= 90 ? 'text-green-600' : 'text-orange-500'}`}>
                      {selectedReport.averageAttendance}%
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Staff Attendance</p>
                    <p className="text-2xl font-black text-slate-700">
                      {selectedReport.staffAttendance}%
                    </p>
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-red-900">Reported Dropouts</h4>
                    <p className="text-xs font-medium text-red-700/80">Students who left in this month</p>
                  </div>
                  <div className="text-2xl font-black text-red-600">
                    <AlertCircle className="inline w-5 h-5 mr-1 -mt-1" />
                    {selectedReport.dropoutCount}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Principal's Remarks</h4>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-sm text-slate-600 italic">
                    {selectedReport.remarks ? `"${selectedReport.remarks}"` : "No additional remarks were provided for this month's report."}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={() => setSelectedReport(null)} className="w-full font-bold">
                  Acknowledge & Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ReportReview;
