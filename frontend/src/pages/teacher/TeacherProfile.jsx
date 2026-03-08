import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ChangePassword from '@/components/ChangePassword';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, MapPin, Building, BookOpen, Calendar, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const TeacherProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || 'Teacher Name',
    school: 'Hatton High School',
    designation: 'Senior Teacher',
    phone: '+94 77 123 4567',
    address: '123, Main Street, Hatton'
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-blue-600">
                <User className="w-12 h-12" />
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
                  <div className="font-medium text-gray-700">{user?.email || 'email@edu.lk'} <span className="text-xs text-gray-400">(Read-only)</span></div>
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
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">Mathematics</span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">Science</span>
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
