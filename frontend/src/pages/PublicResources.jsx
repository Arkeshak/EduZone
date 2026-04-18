/**
 * PUBLIC RESOURCES PAGE
 * 
 * File Purpose: Display educational resources available to all users
 * Used for: Browsing and downloading teaching materials, study guides
 * 
 * Features:
 * - Search by title
 * - Filter by subject and grade
 * - Display resource cards (title, teacher, grade, subject)
 * - Download/view resource file
 * - Pagination for large lists
 * 
 * Access: Public (no login required)
 * Data: Resources uploaded by teachers marked as PUBLISHED
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SUBJECTS, GRADES } from '@/utils/subjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, BookOpen, Download, Filter, GraduationCap, ArrowLeft, FileText } from 'lucide-react';
import client from '@/services/apiClient';
import heroBg from '../assets/education_hero.png';

const PublicResources = () => {
    {/* 
      STATE MANAGEMENT
      
      Purpose: Manage resources, loading, search, and filters
      
      State Variables:
      - resources: Array of resource objects fetched from backend
      - loading: Boolean indicating if resources are being fetched
      - searchTerm: User's search query text
      - filters: Object with grade and subject filters
    */}
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ grade: 'All', subject: 'All' });

    {/* 
      EFFECT: Fetch Resources When Filters Change
      
      Purpose: Refetch resources whenever filter changes
      Triggers: When component mounts or filters updated
      Flow:
      1. useEffect detects filters changed
      2. Calls fetchResources()
      3. Passes current filters to API
      4. Updates resources state
      5. Sets loading to false
    */}
    useEffect(() => {
        fetchResources();
    }, [filters]);

    {/* 
      FETCH RESOURCES FUNCTION
      
      Purpose: Retrieve resources from backend API
      Endpoint: GET /resources/public?grade=&subject=&search=
      
      Process:
      1. Set loading to true
      2. Build query parameters from filters and search
      3. Call API with parameters
      4. Update resources state with response
      5. Handle errors in console
      6. Set loading to false
      
      Query Parameters:
      - grade: Specific grade level (or 'All')
      - subject: Subject name (or 'All')
      - search: Search term from search box
      
      Error Handling:
      - Logs errors to console
      - Doesn't show error toast (graceful degradation)
      - Sets loading to false to stop spinner
    */}
    const fetchResources = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.grade !== 'All') params.append('grade', filters.grade);
            if (filters.subject !== 'All') params.append('subject', filters.subject);
            if (searchTerm) params.append('search', searchTerm);

            const response = await client.get(`/resources/public?${params.toString()}`);
            setResources(response.data);
        } catch (error) {
            console.error("Failed to fetch resources", error);
        } finally {
            setLoading(false);
        }
    };

    {/* 
      HANDLE SEARCH FUNCTION
      
      Purpose: Process search form submission
      Triggered: When user clicks search button or presses Enter
      
      Flow:
      1. Prevent default form submission
      2. Call fetchResources()
      3. API request sent with searchTerm parameter
      4. Results updated in UI
    */}
    const handleSearch = (e) => {
        e.preventDefault();
        fetchResources();
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">

            {/* NAVIGATION BAR - Fixed at top */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    {/* 
                      BACK TO HOME LINK
                      Purpose: Navigate back to landing page
                      Icon: Left arrow
                      Text: "Back to Home"
                      Color: Gray, blue on hover
                      Location: Top left
                      Used for: Quick exit from resources page
                    */}
                    <Link to="/" className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-semibold">Back to Home</span>
                    </Link>

                    {/* 
                      BRAND/LOGO
                      Purpose: Display EduZone Library branding
                      Elements:
                      - Graduation cap icon in blue circle
                      - "EduZone Library" text
                      Location: Center/right of nav
                      Used for: Branding and navigation context
                    */}
                    <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-blue-600 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">EduZone Library</span>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION - Page header with background */}
            <div className="relative pt-32 pb-20 bg-slate-900 overflow-hidden">
                {/* Background image with gradient overlay */}
                <div className="absolute inset-0 z-0">
                    <img src={heroBg} className="w-full h-full object-cover opacity-20 blur-sm" alt="Library Background" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-50"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6">
                    {/* 
                      PAGE TYPE BADGE
                      Purpose: Identify this as resource hub
                      Text: "Digital Resource Hub"
                      Icon: Book open icon
                      Background: Semi-transparent blue
                      Location: Top of hero
                      Used for: Quick identification of page purpose
                    */}
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-widest border border-blue-500/30">
                        <BookOpen className="w-3 h-3 mr-2" /> Digital Resource Hub
                    </div>

                    {/* 
                      MAIN HEADLINE
                      Purpose: Attract attention and explain value
                      Text: "Unlock Knowledge, Anytime, Anywhere."
                      Parts:
                      - Main text: "Unlock Knowledge,"
                      - Gradient part: "Anytime, Anywhere." (blue to purple)
                      Size: Large responsive (4xl mobile, 5xl tablet)
                      Used for: Primary hook and value proposition
                    */}
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        Unlock Knowledge, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Anytime, Anywhere.</span>
                    </h1>

                    {/* 
                      SUBHEADING
                      Purpose: Explain resource collection
                      Text: Describes curated materials from expert teachers
                      Color: Medium gray
                      Max width: Limited to 2xl
                      Used for: Secondary explanation and context
                    */}
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Access a curated collection of study materials, past papers, and notes uploaded by expert teachers from the Hatton Zone.
                    </p>

                    {/* SEARCH FORM - Glossy search bar */}
                    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mt-8">
                        <div className="relative group">
                            {/* Blurred glow effect behind search */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>

                            {/* Search input container */}
                            <div className="relative flex bg-white rounded-2xl shadow-xl overflow-hidden">
                                {/* Search icon */}
                                <div className="pl-4 flex items-center pointer-events-none">
                                    <Search className="w-5 h-5 text-gray-400" />
                                </div>

                                {/* 
                                  SEARCH INPUT FIELD
                                  Purpose: Accept search query from user
                                  Placeholder: Instructional text
                                  Type: Text input
                                  Height: Large (14 units, 56px)
                                  Size: Large font (text-lg)
                                  Action: On change, updates searchTerm state
                                  Used for: Searching resources by title/keywords
                                */}
                                <Input
                                    type="text"
                                    placeholder="Search resources by title or keywords..."
                                    className="border-0 focus-visible:ring-0 shadow-none h-14 text-lg bg-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />

                                {/* 
                                  SEARCH BUTTON
                                  Purpose: Submit search query
                                  Color: Dark gray (slate-900)
                                  Size: Large (h-14, px-8)
                                  Hover: Lighter gray
                                  Text: "Search"
                                  Type: Submit button
                                  Action: Calls handleSearch() on click
                                  Used for: Trigger resource search
                                */}
                                <Button type="submit" className="h-14 px-8 rounded-none bg-slate-900 hover:bg-slate-800 text-white font-medium">
                                    Search
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* FILTERS & RESULTS SECTION */}
            <div className="max-w-7xl mx-auto px-6 pb-24 -mt-10 relative z-20">

                {/* 
                  FILTER CONTROLS
                  Purpose: Allow users to filter resources
                  Filters Available:
                  - Grade: Select specific grade level
                  - Subject: Select specific subject
                  Both have "All" option to show all results
                  Layout: Horizontal flex with gap
                  Used for: Narrow down resources by criteria
                */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                    <FilterSelect
                        label="Grade"
                        value={filters.grade}
                        onChange={(val) => setFilters({ ...filters, grade: val })}
                        options={GRADES}
                    />
                    <FilterSelect
                        label="Subject"
                        value={filters.subject}
                        onChange={(val) => setFilters({ ...filters, subject: val })}
                        options={SUBJECTS}
                    />
                </div>

                {/* 
                  RESULTS GRID
                  Purpose: Display search and filtered results
                  States:
                  - Loading: Show skeleton cards
                  - Has results: Show resource cards in grid
                  - No results: Show empty state message
                  Layout: Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
                  Used for: Main content area showing resources
                */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        /* Skeleton cards while loading */
                        [1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)
                    ) : resources.length > 0 ? (
                        /* Resource cards when data loaded */
                        resources.map((resource) => (
                            <ResourceCard key={resource.id} resource={resource} />
                        ))
                    ) : (
                    /* 
                          EMPTY STATE
                          Purpose: Show when no resources match criteria
                          Elements:
                          - Filter icon in circle
                          - "No resources found" heading
                          - Suggestion to adjust filters
                          Used for: Helpful message when search returns nothing
                        */
                    <div className="col-span-full text-center py-20">
                        <div className="bg-white inline-flex p-4 rounded-full shadow-sm mb-4">
                            <Filter className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">No resources found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your search or filters to find what you need.</p>
                    </div>
                    )}
                </div>

            </div>
        </div>
    );
};

const FilterSelect = ({ label, value, onChange, options }) => (
    <div className="relative">
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-40 h-10 bg-white border-0 shadow-lg rounded-full px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <SelectValue placeholder={label} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="All">All {label}s</SelectItem>
                {options.map(opt => <SelectItem key={opt} value={opt}>{label === 'Grade' ? `Grade ${opt}` : opt}</SelectItem>)}
            </SelectContent>
        </Select>
    </div>
);

const ResourceCard = ({ resource }) => (
    <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${getColorForSubject(resource.subject)} bg-opacity-10`}>
                <FileText className={`w-6 h-6 ${getColorText(resource.subject)}`} />
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md uppercase tracking-wider">
                Grade {resource.grade}
            </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {resource.title}
        </h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[40px]">
            {resource.description || "No description provided."}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="text-xs text-slate-400">
                By <span className="font-medium text-slate-600">{resource.teacherName || 'Unknown Teacher'}</span>
            </div>
            <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50 font-semibold h-8">
                    <Download className="w-4 h-4 mr-2" /> Download
                </Button>
            </a>
        </div>
    </div>
);

const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-64 animate-pulse">
        <div className="h-10 w-10 bg-slate-100 rounded-xl mb-4"></div>
        <div className="h-6 bg-slate-100 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-slate-100 rounded w-1/2 mb-4"></div>
        <div className="h-16 bg-slate-100 rounded mb-4"></div>
        <div className="h-8 bg-slate-100 rounded mt-auto"></div>
    </div>
);

const getColorForSubject = (subject) => {
    switch (subject?.toLowerCase()) {
        case 'mathematics': return 'bg-blue-500';
        case 'science': return 'bg-green-500';
        case 'history': return 'bg-orange-500';
        case 'english': return 'bg-purple-500';
        case 'sinhala': return 'bg-yellow-600';
        case 'tamil': return 'bg-red-500';
        case 'civics education': return 'bg-teal-500';
        case 'geography': return 'bg-emerald-600';
        case 'health & physical education': return 'bg-lime-500';
        case 'ict':
        case 'information & communication technology': return 'bg-indigo-500';
        case 'art':
        case 'music':
        case 'dancing (traditional)':
        case 'dancing (oriental)':
        case 'dancing (western)': return 'bg-pink-500';
        case 'buddhism':
        case 'hinduism':
        case 'islam':
        case 'christianity':
        case 'catholicism': return 'bg-amber-500';
        default: return 'bg-slate-500';
    }
};

const getColorText = (subject) => {
    switch (subject?.toLowerCase()) {
        case 'mathematics': return 'text-blue-600';
        case 'science': return 'text-green-600';
        case 'history': return 'text-orange-600';
        case 'english': return 'text-purple-600';
        case 'sinhala': return 'text-yellow-700';
        case 'tamil': return 'text-red-600';
        case 'civics education': return 'text-teal-600';
        case 'geography': return 'text-emerald-700';
        case 'health & physical education': return 'text-lime-600';
        case 'ict':
        case 'information & communication technology': return 'text-indigo-600';
        case 'art':
        case 'music':
        case 'dancing (traditional)':
        case 'dancing (oriental)':
        case 'dancing (western)': return 'text-pink-600';
        case 'buddhism':
        case 'hinduism':
        case 'islam':
        case 'christianity':
        case 'catholicism': return 'text-amber-600';
        default: return 'text-slate-600';
    }
}

export default PublicResources;
