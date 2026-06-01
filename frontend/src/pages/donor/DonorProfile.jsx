import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Heart, Award, Edit, Save, Phone, Building } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import client from '@/services/apiClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';

/**
 * DONOR PROFILE PAGE
 * 
 * File Purpose: Management interface for donor identity and impact summary.
 * Features:
 * - Statistics: Cumulative lifetime contribution and total unique students supported.
 * - Profile Management: Update organization name and contact info.
 * - Loyalty Branding: Displays badges (e.g., 'PLATINUM PARTNER') based on donation volume.
 * - Multimedia: Profile picture management.
 */

const DonorProfile = () => {
  const { user: authUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  /**
   * FORM STATE MANAGEMENT
   * Purpose: Manages personal and organizational fields.
   * OrganizationName: Optional field for branding donations from entities.
   */
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organizationName: '',
    contactNumber: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);

  /**
   * IMPACT STATISTICS STATE
   * Purpose: Tracks life-to-date donation impact metrics.
   */
  const [stats, setStats] = useState({
    studentsHelped: 0,
    totalDonated: 0
  });

  /**
   * DATA INITIALIZATION
   * Purpose: Aggregates current donor's profile data and all historical impact stats.
   * Logic:
   * 1. GET /auth/me for current identity.
   * 2. GET /donations to calculate lifetime aggregate student impact.
   * Validation: Filters for verified/completed donations to ensure accurate impact reporting.
   */
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // 1. Fetch User and Profile Data
        const { data: userData } = await client.get('/auth/me');
        
        setFormData({
          fullName: userData.fullName || userData.name || '',
          email: userData.email || '',
          organizationName: userData.profile?.organizationName || '',
          contactNumber: userData.profile?.contactNumber || ''
        });
        setProfilePicture(userData.profilePicture || null);

        // 2. Fetch Donation Statistics
        const { data: donationsData } = await client.get('/donations');
        const donations = Array.isArray(donationsData) ? donationsData : (donationsData.data || []);
        
        // Count unique welfare requests (verified only)
        const uniqueRequests = new Set(
          donations
            .filter(d => d.status === 'VERIFIED' || d.status === 'TRANSFERRED' || d.status === 'COMPLETED')
            .map(d => d.welfareRequestId)
            .filter(id => id !== null)
        );

        const totalValue = donations.reduce((sum, d) => sum + Number(d.amount), 0);

        setStats({
          studentsHelped: uniqueRequests.size,
          totalDonated: totalValue
        });

      } catch (error) {
        console.error("Failed to fetch profile details", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    if (authUser?.id) {
      fetchProfileData();
    }
  }, [authUser?.id]); // Re-fetch if auth user changes

  const handleSave = async () => {
    setUpdating(true);
    try {
      await client.put('/auth/profile', {
        fullName: formData.fullName,
        organizationName: formData.organizationName,
        contactNumber: formData.contactNumber
      });
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      // Sync global state
      await refreshUser();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-none shadow-xl ring-1 ring-slate-100 overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white pb-16 relative">
             <div className="flex flex-row justify-between items-start">
                <div className="space-y-1">
                   <CardTitle className="text-3xl font-black">Donor Identity</CardTitle>
                   <p className="text-blue-100/80 font-medium">Manage your personal and organizational profile</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md"
                  disabled={updating}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {isEditing ? (updating ? 'Saving...' : 'Confirm Changes') : 'Modify Profile'}
                </Button>
             </div>
          </CardHeader>
          
          <CardContent className="relative pt-0 px-8">
            {/* Avatar Section */}
            <div className="absolute -top-12 left-8">
              <ProfilePictureUpload
                currentPicture={profilePicture || authUser?.profilePicture}
                onUploadSuccess={(url) => {
                  setProfilePicture(url);
                  refreshUser();
                }}
                size="md"
                shape="rounded"
                editable={isEditing}
              />
            </div>

            <div className="mt-16 space-y-8">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 border-slate-50">
                <div className="space-y-1">
                  {isEditing ? (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Legal Name</label>
                       <Input
                         className="text-2xl font-black h-auto px-4 py-2 bg-slate-50 border-slate-200 focus:ring-blue-500 rounded-xl"
                         value={formData.fullName}
                         onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                       />
                    </div>
                  ) : (
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{formData.fullName || 'Registered Donor'}</h2>
                  )}
                  <div className="flex items-center gap-2">
                     <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px] font-bold">
                        {stats.totalDonated > 50000 ? 'PLATINUM PARTNER' : 'VERIFIED DONOR'}
                     </Badge>
                     <span className="text-slate-400 text-sm font-medium italic">Member since 2024</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                   <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Lifetime Impact</p>
                      <p className="text-lg font-black text-slate-900">LKR {stats.totalDonated.toLocaleString()}</p>
                   </div>
                   <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 text-center">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Lives Touched</p>
                      <p className="text-lg font-black text-blue-700">{stats.studentsHelped} Students</p>
                   </div>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-6">
                   <div className="group">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Mail className="w-4 h-4" />
                         </div>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</span>
                      </div>
                      <p className="font-bold text-slate-700 pl-11">{formData.email}</p>
                      <p className="text-[10px] text-slate-400 pl-11 mt-1 font-medium italic">* Secondary contact for receipts</p>
                   </div>

                   <div className="group">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Building className="w-4 h-4" />
                         </div>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Organization</span>
                      </div>
                      {isEditing ? (
                        <div className="pl-11">
                           <Input
                             value={formData.organizationName}
                             onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                             className="bg-slate-50 border-slate-200 rounded-xl"
                             placeholder="E.g. Help Foundations"
                           />
                        </div>
                      ) : (
                        <p className="font-bold text-slate-700 pl-11">{formData.organizationName || 'Individual Donor'}</p>
                      )}
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="group">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-violet-50 rounded-lg text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                            <Phone className="w-4 h-4" />
                         </div>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Number</span>
                      </div>
                      {isEditing ? (
                        <div className="pl-11">
                           <Input
                             value={formData.contactNumber}
                             onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                             className="bg-slate-50 border-slate-200 rounded-xl"
                             placeholder="+94 7X XXX XXXX"
                           />
                        </div>
                      ) : (
                        <p className="font-bold text-slate-700 pl-11">{formData.contactNumber || 'Not Provided'}</p>
                      )}
                   </div>

                   <div className="group">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-amber-50 rounded-lg text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                            <Award className="w-4 h-4" />
                         </div>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recognition</span>
                      </div>
                      <div className="pl-11 flex items-center gap-2">
                         <p className="font-bold text-slate-700">Verified Donor</p>
                         <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                            <Save className="w-2 h-2 text-white fill-current" />
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Impact Card */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl mt-4 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
                   <Heart className="w-24 h-24 text-white fill-white" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                   <div className="space-y-2">
                      <h3 className="text-xl font-black text-white">Your Generosity creates Future.</h3>
                      <p className="text-indigo-200 text-sm max-w-lg leading-relaxed font-medium">
                        By funding vetted welfare requests, you have personally stabilized the education journey for <strong>{stats.studentsHelped} vulnerable students</strong> this session.
                      </p>
                   </div>
                   <Button className="bg-white text-indigo-950 hover:bg-indigo-50 font-black rounded-xl px-8 shadow-lg">
                      View Funded Students
                   </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const Badge = ({ children, className }) => (
  <span className={`px-2 py-0.5 rounded-full ${className}`}>
    {children}
  </span>
);

export default DonorProfile;
