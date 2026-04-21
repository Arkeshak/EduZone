import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, ShieldCheck, Edit, Save, Phone, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import client from '@/services/apiClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import ChangePassword from '@/components/ChangePassword';

/**
 * ZEO PROFILE PAGE
 * 
 * File Purpose: Administrative identity management for Zonal Officers.
 * Features:
 * - Identity Sync: Real-time profile details from /auth/me.
 * - Office Management: Update official contact connectivity and physical office address.
 * - Multimedia: Profile picture engagement (ProfilePictureUpload).
 * - Security: Integrated authenticated password rotation (ChangePassword).
 */

const ZEOProfile = () => {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    address: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  /**
   * DATA FETCHING: Administrative Profile
   * Purpose: Retrieves current ZEO staff details including specialized profile fields.
   * Action: Calls GET /auth/me and maps result to internal formData.
   */
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data } = await client.get('/auth/me');
      
      setFormData({
        fullName: data.fullName || '',
        email: data.email || '',
        contactNumber: data.profile?.contactNumber || '',
        address: data.profile?.address || ''
      });
      setProfilePicture(data.profilePicture || null);
    } catch (error) {
      console.error("Failed to fetch profile details", error);
      toast.error("Could not load profile details");
    } finally {
      setLoading(false);
    }
  };

  /**
   * PROFILE PERSISTENCE HANDLER
   * Purpose: Updates administrative contact information and address.
   * Action: Sends a PUT request to /auth/profile.
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      await client.put('/auth/profile', {
        fullName: formData.fullName,
        contactNumber: formData.contactNumber,
        address: formData.address
      });
      
      setIsEditing(false);
      toast.success("Profile updated successfully!");
      // Step: Refresh global auth context to ensure UI consistency
      await refreshUser();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Administrative Profile</h1>
                <p className="text-slate-500 font-medium">Manage your Zonal Education Office identity</p>
            </div>
            <Button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={saving}
              className={`${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white shadow-lg transition-all duration-300 font-bold px-8`}
            >
              {saving ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : isEditing ? (
                <Save className="w-4 h-4 mr-2" />
              ) : (
                <Edit className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Saving...' : isEditing ? 'Save Profile' : 'Edit Profile'}
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Personal Info */}
            <div className="lg:col-span-2 space-y-8">
                <Card className="border-none shadow-2xl shadow-blue-900/5 overflow-hidden">
                    <CardHeader className="bg-slate-900 text-white p-8">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <ProfilePictureUpload
                                  currentPicture={profilePicture}
                                  onUploadSuccess={(url) => {
                                    setProfilePicture(url);
                                    refreshUser();
                                  }}
                                  size="lg"
                                  shape="rounded"
                                  editable={isEditing}
                                />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black tracking-tight">
                                    {isEditing ? (
                                        <Input
                                            className="bg-white/10 border-white/20 text-white text-xl p-4 h-auto"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                    ) : (
                                        formData.fullName
                                    )}
                                </CardTitle>
                                <CardDescription className="text-blue-300/80 font-bold flex items-center gap-2 mt-1">
                                    <ShieldCheck className="w-4 h-4" /> Zonal Education Officer
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Connectivity</label>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Phone className="w-5 h-5 text-blue-600" />
                                    {isEditing ? (
                                        <Input
                                            className="border-none bg-blue-50/50 px-2 py-1 h-auto font-bold focus-visible:ring-1 focus-visible:ring-blue-200 transition-all"
                                            placeholder="Enter phone number..."
                                            value={formData.contactNumber}
                                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                        />
                                    ) : (
                                        <span className="font-bold text-slate-800">{formData.contactNumber || 'Not Provided'}</span>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email Address</label>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                    <span className="font-bold text-slate-800">{formData.email}</span>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Office Address</label>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    {isEditing ? (
                                        <Input
                                            className="border-none bg-blue-50/50 px-2 py-1 h-auto font-bold focus-visible:ring-1 focus-visible:ring-blue-200 transition-all"
                                            placeholder="Enter office address..."
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    ) : (
                                        <span className="font-bold text-slate-800">{formData.address || 'Zonal Education Office, Hatton'}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Security */}
            <div className="space-y-8">
                <Card className="border-none shadow-2xl shadow-blue-900/5 overflow-hidden">
                    <CardHeader className="bg-slate-50 p-6 border-b">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">System Security</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <ChangePassword />
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ZEOProfile;
