import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Search, BookOpen, Download, Filter, GraduationCap, ArrowLeft, FileText } from 'lucide-react';
import client from '@/api/client';
import heroBg from '../assets/education_hero_v2.png';

const PublicResources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ grade: 'All', subject: 'All' });

    useEffect(() => {
        fetchResources();
    }, [filters]);

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

    const handleSearch = (e) => {
        e.preventDefault();
        fetchResources();
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">

            {/* Navigation (Simplified) */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-semibold">Back to Home</span>
                    </Link>
                    <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-blue-600 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">EduZone Library</span>
                    </div>
                </div>
            </nav>

            {/* Hero Header */}
            <div className="relative pt-32 pb-20 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src={heroBg} className="w-full h-full object-cover opacity-20 blur-sm" alt="Library Background" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-50"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-widest border border-blue-500/30">
                        <BookOpen className="w-3 h-3 mr-2" /> Digital Resource Hub
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        Unlock Knowledge, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Anytime, Anywhere.</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Access a curated collection of study materials, past papers, and notes uploaded by expert teachers from the Hatton Zone.
                    </p>

                    {/* Glossy Search Bar */}
                    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mt-8">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                            <div className="relative flex bg-white rounded-2xl shadow-xl overflow-hidden">
                                <div className="pl-4 flex items-center pointer-events-none">
                                    <Search className="w-5 h-5 text-gray-400" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Search resources by title or keywords..."
                                    className="border-0 focus-visible:ring-0 shadow-none h-14 text-lg bg-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Button type="submit" className="h-14 px-8 rounded-none bg-slate-900 hover:bg-slate-800 text-white font-medium">
                                    Search
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Filters & Results */}
            <div className="max-w-7xl mx-auto px-6 pb-24 -mt-10 relative z-20">

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                    <FilterSelect
                        label="Grade"
                        value={filters.grade}
                        onChange={(val) => setFilters({ ...filters, grade: val })}
                        options={['6', '7', '8', '9', '10', '11', '12', '13']}
                    />
                    <FilterSelect
                        label="Subject"
                        value={filters.subject}
                        onChange={(val) => setFilters({ ...filters, subject: val })}
                        options={['Mathematics', 'Science', 'English', 'History', 'ICT', 'Sinhala', 'Tamil']}
                    />
                </div>

                {/* Results Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)
                    ) : resources.length > 0 ? (
                        resources.map((resource) => (
                            <ResourceCard key={resource.id} resource={resource} />
                        ))
                    ) : (
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
        default: return 'bg-slate-500';
    }
};

const getColorText = (subject) => {
    switch (subject?.toLowerCase()) {
        case 'mathematics': return 'text-blue-600';
        case 'science': return 'text-green-600';
        case 'history': return 'text-orange-600';
        case 'english': return 'text-purple-600';
        default: return 'text-slate-600';
    }
}

export default PublicResources;
