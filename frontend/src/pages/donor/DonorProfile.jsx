import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Heart, Award, Edit, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const DonorProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || 'Alice Foundations',
    email: user?.email || 'donor@example.com'
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-t-xl pb-10 flex flex-row justify-between items-start">
            <CardTitle className="text-2xl">Donor Profile</CardTitle>
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
                <div className="w-full h-full bg-pink-100 rounded-full flex items-center justify-center">
                  <Heart className="w-10 h-10 text-pink-600 fill-pink-600" />
                </div>
              </div>
            </div>

            <div className="mt-16 space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-full">
                  {isEditing ? (
                    <div className="max-w-xs mb-2">
                      <span className="text-xs text-gray-500 uppercase font-bold">Display Name</span>
                      <Input
                        className="text-xl font-bold h-auto px-2 py-1 mt-1"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
                  )}
                  <p className="text-gray-500 font-medium">Gold Tier Contributor</p>
                </div>
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Award className="w-6 h-6" />
                  <span className="font-bold">Top Donor 2024</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="w-full">
                    <p className="text-sm text-gray-500">Organization / Name</p>
                    <p className="font-medium text-gray-900">{formData.name}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="w-full">
                    <p className="text-sm text-gray-500">Email Address</p>
                    {isEditing ? (
                      <Input
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{formData.email}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-pink-50 p-4 rounded-lg mt-4 border border-pink-100">
                <p className="text-pink-800 font-medium mb-1">Your Impact</p>
                <p className="text-sm text-pink-700">You have helped 12 students continue their education this year. Thank you for your generosity!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DonorProfile;
