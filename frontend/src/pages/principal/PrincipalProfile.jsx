import { useState, useEffect } from 'react';
import ChangePassword from '@/components/ChangePassword';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Building, Phone, Mail, Save, Edit, Landmark } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import client from '@/services/apiClient';

const PrincipalProfile = () => {
  console.log('Rendering PrincipalProfile');
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    school: '',
    bankName: '',
    branch: '',
    accountNumber: '',
    accountName: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          // Fetch School Details
          const { data: schoolData } = await client.get('/schools/my-school');

          setFormData({
            name: user.name || 'Principal',
            phone: '+94 71 234 5678', // Mock
            school: schoolData.name || 'Unknown School',
            bankName: schoolData.bankName || '',
            branch: schoolData.branch || '',
            accountNumber: schoolData.accountNumber || '',
            accountName: schoolData.accountName || ''
          });
        } catch (error) {
          console.error("Failed to fetch school", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  const handleSave = async () => {
    try {
      await client.put('/schools/my-school', {
        bankName: formData.bankName,
        branch: formData.branch,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName
      });
      setIsEditing(false);
      toast.success("School Bank Details updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update details");
    }
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

              {/* Bank Details Section */}
              <div className="pt-6 border-t mt-6">
                <h3 className="text-lg font-bold flex items-center mb-4 text-gray-800">
                  <Landmark className="w-5 h-5 mr-2 text-blue-600" />
                  School Bank Account Details (For ZEO Transfers)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bank Name</p>
                    {isEditing ? (
                      <Input value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} placeholder="e.g. Bank of Ceylon" />
                    ) : (
                      <p className="font-medium">{formData.bankName || 'Not Set'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Branch</p>
                    {isEditing ? (
                      <Input value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} placeholder="e.g. Hatton" />
                    ) : (
                      <p className="font-medium">{formData.branch || 'Not Set'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Number</p>
                    {isEditing ? (
                      <Input value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} placeholder="xxxxxxxxxx" />
                    ) : (
                      <p className="font-mono font-medium">{formData.accountNumber || 'Not Set'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Name</p>
                    {isEditing ? (
                      <Input value={formData.accountName} onChange={(e) => setFormData({ ...formData, accountName: e.target.value })} placeholder="e.g. Hatton Central College SDF" />
                    ) : (
                      <p className="font-medium">{formData.accountName || 'Not Set'}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t mt-6">
                <h3 className="text-lg font-bold flex items-center mb-4 text-gray-800">
                  Security
                </h3>
                <ChangePassword />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PrincipalProfile;
