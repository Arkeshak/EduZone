import { useState, useEffect } from 'react';
import ChangePassword from '@/components/ChangePassword';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Building, Phone, Mail, Save, Edit, Landmark, ShieldCheck, GraduationCap, Briefcase } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import client from '@/services/apiClient';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';

const PrincipalProfile = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    schoolName: '',
    bankName: '',
    bankBranch: '',
    accountNumber: '',
    accountHolder: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  /**
   * DATA FETCHING: Dual Profile Sync
   * Purpose: Aggregates personal identity and institutional bank data.
   * Action: 
   * 1. Fetches current user object from /auth/me.
   * 2. Fetches school-specific metadata from /schools/my-school.
   * 3. Merges data into local formData state.
   */
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // Step 1: User Identity Details
      const { data: userData } = await client.get('/auth/me');
      
      // Step 2: Educational Institution Details (includes bank info)
      const { data: schoolData } = await client.get('/schools/my-school');

      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        contactNumber: userData.profile?.contactNumber || '',
        schoolName: schoolData.name || 'Unknown School',
        bankName: schoolData.bankName || '',
        bankBranch: schoolData.bankBranch || '',
        accountNumber: schoolData.accountNumber || '',
        accountHolder: schoolData.accountHolder || ''
      });
      setProfilePicture(userData.profilePicture || null);
    } catch (error) {
      console.error("Failed to fetch profile details", error);
      toast.error("Could not load full profile details");
    } finally {
      setLoading(false);
    }
  };

  /**
   * PERSONAL PROFILE UPDATE
   * Purpose: Persists name and contact changes to the user's account.
   * Action: Sends data via PUT to /auth/profile.
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      await client.put('/auth/profile', {
        fullName: formData.fullName,
        contactNumber: formData.contactNumber
      });
      setIsEditing(false);
      toast.success("Personal profile updated!");
      // Step: Force-refresh global auth context to update header values
      await refreshUser();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  /**
   * INSTITUTIONAL BANK UPDATE
   * Purpose: Configures where donor funds should be sent for this school.
   * Action: PUT request to /schools/my-school.
   * Validation: Backend verifies current user is authorized to modify school data.
   */
  const handleSaveBank = async () => {
    setSavingBank(true);
    try {
      await client.put('/schools/my-school', {
        bankName: formData.bankName,
        bankBranch: formData.bankBranch,
        accountNumber: formData.accountNumber,
        accountHolder: formData.accountHolder
      });
      setIsEditingBank(false);
      toast.success("Bank details updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update bank details");
    } finally {
      setSavingBank(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 font-medium animate-pulse">Syncing profile data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Principal Dashboard</h1>
                <p className="text-slate-500 font-medium">Manage your administrative identity and school credentials</p>
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
                                    <GraduationCap className="w-4 h-4" /> Principal / SLPS Grade I
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assigned Institution</label>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Building className="w-5 h-5 text-blue-600" />
                                    <span className="font-bold text-slate-800">{formData.schoolName}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Connectivity</label>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Phone className="w-5 h-5 text-blue-600" />
                                    {isEditing ? (
                                        <Input
                                            className="border-none bg-transparent p-0 h-auto font-bold focus-visible:ring-0"
                                            value={formData.contactNumber}
                                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                        />
                                    ) : (
                                        <span className="font-bold text-slate-800">{formData.contactNumber || 'Not Provided'}</span>
                                    )}
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email Address</label>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                    <span className="font-bold text-slate-800">{formData.email || 'Loading...'}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bank Account Section */}
                <Card className="border-none shadow-2xl shadow-blue-900/5 bg-gradient-to-br from-white to-slate-50/50 overflow-hidden">
                    <CardHeader className="p-8 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Landmark className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Institutional Fin-Ops</CardTitle>
                                <CardDescription className="font-medium">School Welfare Bank Account Details for Fund Disbursement</CardDescription>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => isEditingBank ? handleSaveBank() : setIsEditingBank(true)}
                            disabled={savingBank}
                            className={`${isEditingBank ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold px-5`}
                          >
                            {savingBank ? (
                              <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            ) : isEditingBank ? (
                              <Save className="w-3 h-3 mr-2" />
                            ) : (
                              <Edit className="w-3 h-3 mr-2" />
                            )}
                            {savingBank ? 'Saving...' : isEditingBank ? 'Save Changes' : 'Edit'}
                          </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase">Bank Provider</label>
                                {isEditingBank ? (
                                    <Input value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} className="rounded-xl font-bold" />
                                ) : (
                                    <div className="p-4 bg-white rounded-2xl border shadow-sm font-black text-slate-800">{formData.bankName || 'NOT SPECIFIED'}</div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase">Branch Location</label>
                                {isEditingBank ? (
                                    <Input value={formData.bankBranch} onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })} className="rounded-xl font-bold" />
                                ) : (
                                    <div className="p-4 bg-white rounded-2xl border shadow-sm font-black text-slate-800">{formData.bankBranch || 'NOT SPECIFIED'}</div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase">Account Number</label>
                                {isEditingBank ? (
                                    <Input value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} className="rounded-xl font-black font-mono text-lg" />
                                ) : (
                                    <div className="p-4 bg-blue-600 rounded-2xl border shadow-lg font-black text-white font-mono text-xl tracking-wider">{formData.accountNumber || 'NOT SPECIFIED'}</div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase">Account Title (Holder)</label>
                                {isEditingBank ? (
                                    <Input value={formData.accountHolder} onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })} className="rounded-xl font-bold" />
                                ) : (
                                    <div className="p-4 bg-white rounded-2xl border shadow-sm font-black text-slate-800">{formData.accountHolder || 'NOT SPECIFIED'}</div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Security & Metadata */}
            <div className="space-y-8">
                <Card className="border-none shadow-2xl shadow-blue-900/5 overflow-hidden">
                    <CardHeader className="bg-slate-50 p-6 border-b">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">System Security</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <ChangePassword />
                    </CardContent>
                </Card>

                <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-2xl shadow-blue-400/30 relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-150"></div>
                    <Briefcase className="w-10 h-10 mb-4 text-blue-200" />
                    <h3 className="text-xl font-black mb-1 italic">Authorized Admin</h3>
                    <p className="text-blue-100/70 text-sm font-medium leading-relaxed">
                        Your profile is verified and linked to your specific school ID. Professional updates require validation by the ZEO office.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PrincipalProfile;
