import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { User, Building, Phone, Mail, Save, Edit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const PrincipalProfile = () => {
  console.log('Rendering PrincipalProfile'); // DEBUG LOG
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    school: ''
  });

  // Sync with user data when it loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || 'Principal Name',
        phone: '+94 71 234 5678', // Mock default
        school: user.school || 'Hatton High School' // Mock default or from user
      });
    }
  }, [user]);

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="p-10 text-center">Loading Profile...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-xl pb-10 flex flex-row justify-between items-start">
            <CardTitle className="text-2xl">Principal Profile</CardTitle>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-none"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </CardHeader>
          <CardContent className="relative pt-0">
            <div className="absolute -top-12 left-6">
              <div className="w-24 h-24 bg-white rounded-full p-2 shadow-lg">
                <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="mt-16 space-y-6">
              <div>
                {isEditing ? (
                  <Input
                    className="text-2xl font-bold h-auto px-2 py-1 max-w-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
                )}
                <p className="text-gray-500 font-medium">Principal Grade I</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div className="flex items-start space-x-3">
                  <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="w-full">
                    <p className="text-sm text-gray-500">Assigned School</p>
                    {isEditing ? (
                      <Input
                        value={formData.school}
                        onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{formData.school}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Official Email</p>
                    <p className="font-medium text-gray-900">{user?.email || 'principal@edu.lk'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="w-full">
                    <p className="text-sm text-gray-500">Contact Number</p>
                    {isEditing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{formData.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PrincipalProfile;
