import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout'; // Main portal layout
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // UI Library cards
import { Button } from '@/components/ui/button'; // UI Library buttons
import { Badge } from '@/components/ui/badge'; // UI Library badges
import { School, Search, Filter, Info, Target, TrendingUp } from 'lucide-react'; // Icons
import { toast } from 'sonner'; // Notifications
import client from '@/services/apiClient'; // API tool
import LoadingSpinner from '@/components/LoadingSpinner'; // Loader
import donationHero from '@/assets/donation_hero.png'; // Header image
import { Input } from '@/components/ui/input'; // Text input
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'; // Modal/Popup
import { Progress } from '@/components/ui/progress'; // Progress bar

/**
 * BROWSE WELFARE REQUESTS PAGE
 * 
 * Purpose: Allows donors and the public to view verified student needs 
 * and choose which ones to support financially.
 */
const BrowseWelfareRequests = () => {
  // STATE: Master list of all requests from the server
  const [requests, setRequests] = useState([]);
  
  // STATE: The list currently shown (after search/filter is applied)
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // STATE: Search bar text and category selection
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // STATE: Controls the "Details" popup for a specific request
  const [selectedReq, setSelectedReq] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const navigate = useNavigate();

  const CATEGORIES = ['All', 'Books', 'Uniforms', 'Fees', 'Medical', 'Transport', 'Equipment', 'Food', 'Hostel'];

  // FETCH DATA: Gets only "Published" (Fully Approved) requests
  const fetchRequests = async () => {
    try {
      const { data } = await client.get('/welfare/published');
      // Unwrap data array from backend response
      const requestList = data.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setRequests(requestList);
      setFilteredRequests(requestList);
    } catch (error) {
      console.error("Failed to load requests", error);
      toast.error("Failed to load requests");
      setRequests([]);
      setFilteredRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // FILTER LOGIC: Updates the 'filteredRequests' whenever search or category changes
  useEffect(() => {
    let result = requests;

    // Search by student name, school, or ID
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.studentName?.toLowerCase().includes(lowerSearch) || 
        r.schoolName?.toLowerCase().includes(lowerSearch) ||
        r.description?.toLowerCase().includes(lowerSearch) ||
        r.referenceId?.toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by specific category (e.g., "Books")
    if (selectedCategory !== 'All') {
      result = result.filter(r => r.category === selectedCategory);
    }

    setFilteredRequests(result);
  }, [searchTerm, selectedCategory, requests]);

  // ACTION: Navigates to the donation payment page
  const handleDonate = (req) => {
    navigate(`/donor/make-donation?requestId=${req.id}&amount=${req.amountRequired || req.cost}&ref=${req.referenceId || req.id}&school=${req.schoolName}`);
  };

  // ACTION: Opens the detail modal
  const openDetails = (req) => {
    setSelectedReq(req);
    setIsDetailModalOpen(true);
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* TOP HERO SECTION: Catchy header with image */}
        <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden shadow-xl mb-8 group">
          <div className="absolute inset-0">
            <img src={donationHero} alt="Donate" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/40 to-transparent"></div>
          </div>
          <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">Change a Life Today</h1>
            <p className="text-blue-100 max-w-lg text-base md:text-xl font-medium">Browse verified student needs and contribute directly to their educational success.</p>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white p-4 rounded-xl shadow-sm border">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by student, school, or request ID..." 
              className="pl-10 h-11 border-gray-200 focus-visible:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* CATEGORY TABS */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat 
                  ? 'bg-blue-600 text-white shadow-md scale-105' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* EMPTY STATE: Shown if no requests match filters */}
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 px-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Filter className="w-10 h-10 opacity-20" />
            </div>
            <p className="text-xl font-semibold">No matching requests found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search keywords.</p>
            <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }} className="mt-2 text-blue-600">
              Clear all filters
            </Button>
          </div>
        ) : (
          /* REQUEST GRID: List of clickable request cards */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((req) => {
              const reqAmount = req.amountRequired || req.cost;
              const progress = Math.min(100, Math.round((req.collectedAmount / reqAmount) * 100)); // Calculate funding percentage
              const remaining = Math.max(0, reqAmount - req.collectedAmount);

              return (
                <Card key={req.id} className="group flex flex-col h-full hover:shadow-2xl transition-all duration-300 border-none ring-1 ring-gray-100 overflow-hidden relative text-slate-900">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  
                  <CardHeader className="pb-3 px-6 pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none font-bold px-3 py-1">
                        {req.category}
                      </Badge>
                      <div className="text-right">
                        <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest">Goal</span>
                        <span className="font-black text-slate-800">LKR {Number(req.amountRequired || req.cost).toLocaleString()}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold group-hover:text-blue-600 transition-colors">
                      {req.referenceId || `#${req.id}`}
                    </CardTitle>
                    <div className="flex items-center text-xs text-gray-500 font-medium">
                      <School className="w-3.5 h-3.5 mr-1.5" />
                      {req.schoolName}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-grow px-6 pb-2">
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed italic">
                      "{req.description}"
                    </p>
                    
                    {/* PROGRESS BAR SECTION */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-end text-sm">
                        <span className="text-gray-500 font-medium">Raised: <span className="text-blue-600 font-bold">LKR {Number(req.collectedAmount).toLocaleString()}</span></span>
                        <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2.5 bg-gray-100" />
                      <div className="flex justify-between items-center text-[11px] text-gray-400 font-bold uppercase tracking-tighter">
                        <span>{req.grade} Student</span>
                        <span>{remaining > 0 ? `LKR ${Number(remaining).toLocaleString()} left` : 'Fully Funded!'}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-6 pt-4 flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-gray-200 hover:bg-gray-50 hover:border-blue-200"
                      onClick={() => openDetails(req)}
                    >
                      <Info className="w-4 h-4 mr-2" /> Details
                    </Button>
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:shadow-lg transition-all"
                      onClick={() => handleDonate(req)}
                      disabled={progress >= 100}
                    >
                      {progress >= 100 ? 'Completed' : 'Donate'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAIL POPUP: Shows full info when user clicks "Details" */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-2xl text-slate-900">
          {selectedReq && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2 text-blue-600">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-widest">Active Welfare Request</span>
                </div>
                <DialogTitle className="text-2xl font-black">
                  Request {selectedReq.referenceId || `#${selectedReq.id}`}
                </DialogTitle>
                <DialogDescription className="text-base pt-2">
                  Supporting a student from <span className="font-bold text-slate-900 underline decoration-blue-500 decoration-2">{selectedReq.schoolName}</span>
                </DialogDescription>
              </DialogHeader>
              
              {/* INFORMATION GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y my-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</span>
                  <div className="font-bold text-slate-800">{selectedReq.category}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Student</span>
                  <div className="font-bold text-slate-800">{selectedReq.grade} Level</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Division</span>
                  <div className="font-bold text-slate-800">{selectedReq.division || 'Hatton Central'}</div>
                </div>
              </div>

              <div className="space-y-4 py-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-gray-400" />
                  Request Description
                </h4>
                <p className="text-gray-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedReq.description}
                </p>
                
                {/* FUNDING PROGRESS BAR */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase">Current Progress</p>
                      <p className="text-lg font-black text-blue-900">LKR {Number(selectedReq.collectedAmount).toLocaleString()} / {Number(selectedReq.amountRequired || selectedReq.cost).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-blue-600">{Math.min(100, Math.round((selectedReq.collectedAmount / (selectedReq.amountRequired || selectedReq.cost)) * 100))}%</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="ghost" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 font-bold px-8 text-white"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleDonate(selectedReq);
                  }}
                  disabled={selectedReq.collectedAmount >= (selectedReq.amountRequired || selectedReq.cost)}
                >
                  Confirm & Donate
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BrowseWelfareRequests;
