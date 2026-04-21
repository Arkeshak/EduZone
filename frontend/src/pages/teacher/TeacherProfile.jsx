import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ChangePassword from '@/components/ChangePassword';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, MapPin, Building, BookOpen, Calendar, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import client from '@/services/apiClient';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';

/**
 * TEACHER PROFILE PAGE
 * 
 * File Purpose: Management interface for teacher personal and professional data.
 * Features:
 * - View identity and assignment (School, Subjects).
 * - Interactive edit mode for contact details (Phone, Address).
 * - Profile picture management via dedicated uploader component.
 * - Password security management.
 * 
 * Constraints:
 * - Email and School are read-only for identity consistency.
 * - Profile picture updates trigger a global user context refresh.
 */

const TeacherProfile = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * FORM STATE MANAGEMENT
   * Purpose: Tracks local changes to profile fields before persistence.
   * Logic: Initialize with AuthContext data, then refine with full profile fetch.
   */
  const [formData, setFormData] = useState({
    name: user?.name || 'Loading...',
    email: '',
    school: 'Loading...',
    designation: 'Teacher',
    phone: '',
    address: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);

  /**
   * PROFILE DATA SYNCHRONIZATION
   * Purpose: Fetches the most recent profile details from the server on component mount.
   * Action: GET /auth/me for current user identity and profile relationship data.
   */
   useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await client.get('/auth/me');
        if (data.success) {
          setFormData({
            name: data.fullName || user?.name || '',
            email: data.email || user?.email || '',
            school: data.school?.name || 'Not Assigned',
            designation: 'Teacher',
            phone: data.profile?.contactNumber || '',
            address: data.profile?.address || ''
          });
          setSubjects(data.profile?.subjects || []);
          setProfilePicture(data.profilePicture || null);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const [saving, setSaving] = useState(false);

  /**
   * PROFILE UPDATE HANDLER
   * Purpose: Persists user-modified profile data to the database.
   * Action: PUT /auth/profile with updated contact and name fields.
   * Validation:
   * - Triggers global AuthContext refresh (`refreshUser`) to update sidebar/header identity.
   * - Provides toast feedback on success/failure.
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      await client.put('/auth/profile', {
        fullName: formData.name,
        contactNumber: formData.phone,
        address: formData.address
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
      // Step: Sync global identity state across the entire application
      await refreshUser();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="mx-auto flex items-center justify-center">
                <ProfilePictureUpload
                  currentPicture={profilePicture}
                  onUploadSuccess={(url) => {
                    setProfilePicture(url);
                    refreshUser();
                  }}
                  size="md"
                  shape="circle"
                  editable={isEditing}
                />
              </div>
              <div>
                <CardTitle className="text-xl">{formData.name}</CardTitle>
                <p className="text-gray-500">{formData.designation}</p>
              </div>
              <div className="pt-4 border-t w-full">
                <div className="text-sm text-gray-500 mb-2">School</div>
                <div className="font-medium flex items-center justify-center">
                  <Building className="w-4 h-4 mr-2 text-gray-400" />
                  {formData.school}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              {isEditing ? (
                <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 flex items-center">
                    <User className="w-4 h-4 mr-2" /> Full Name
                  </div>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    <div className="font-medium">{formData.name}</div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-gray-500 flex items-center">
                    <Mail className="w-4 h-4 mr-2" /> Email
                  </div>
                  <div className="font-medium text-gray-700">{formData.email || 'Loading...'} <span className="text-xs text-gray-400">(Read-only)</span></div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-gray-500 flex items-center">
                    <Phone className="w-4 h-4 mr-2" /> Phone
                  </div>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  ) : (
                    <div className="font-medium">{formData.phone}</div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-gray-500 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" /> Address
                  </div>
                  {isEditing ? (
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  ) : (
                    <div className="font-medium">{formData.address}</div>
                  )}
                </div>
              </div>




              <div className="pt-6 border-t">
                <h3 className="font-medium mb-3 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                  Subjects Taught
                </h3>
                <div className="flex flex-wrap gap-2">
                  {subjects.length > 0 ? subjects.map((sub, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {sub.name}
                    </span>
                  )) : (
                    <span className="text-gray-500 text-sm">No subjects assigned</span>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-medium mb-3 flex items-center">
                  Security
                </h3>
                <ChangePassword />
              </div>

            </CardContent>
          </Card>
        </div >
      </div >
    </DashboardLayout >
  );
};

export default TeacherProfile;
