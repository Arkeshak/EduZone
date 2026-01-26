import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Trash, UserPlus, Users, Search } from 'lucide-react';
import { toast } from 'sonner';
import client from '@/api/client';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('teachers');
  const [principals, setPrincipals] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [schools, setSchools] = useState([]); // Fetch schools for dropdown
  const [loading, setLoading] = useState(true);

  // Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    schoolId: '',
    role: 'teacher', // or principal
    subjects: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users (We need an endpoint for this, or just getAll users and filter)
      // Since we don't have a specific `GET /users` for ZEO, let's assume we might need to add one or use a hack.
      // Ideally: GET /api/auth/users (admin only)
      // For now, let's create the endpoint in authController or assume it exists.
      // Wait, we don't have a "get all users" endpoint yet. I will add it to authController.

      const usersRes = await client.get('/schools/users'); // I will create this endpoint
      const schoolsRes = await client.get('/schools');

      setPrincipals(usersRes.data.filter(u => u.role === 'principal'));
      setTeachers(usersRes.data.filter(u => u.role === 'teacher'));
      setSchools(schoolsRes.data);

    } catch (error) {
      //   toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const { data } = await client.post('/auth/admin/create-user', newUser);

      // Show detailed success message
      toast.success(
        <div className="space-y-2">
          <p>User created successfully!</p>
          <div className="p-2 bg-white/20 rounded text-sm">
            <p>Email: {data.email}</p>
            <p className="font-mono font-bold">Temp Password: {data.tempPassword}</p>
          </div>
          <p className="text-xs opacity-80">Credentials sent to email.</p>
        </div>,
        { duration: 10000 } // Show for longer
      );

      fetchData(); // Refresh list
      setNewUser({ name: '', email: '', schoolId: '', role: 'teacher', subjects: '' }); // Reset form
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await client.delete(`/auth/users/${id}`);
      toast.success("User deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage Principals and Teachers across the zone.</p>
        </div>

        {/* Create User Form */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Create New Account</h3>
            <form onSubmit={handleCreateUser} className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newUser.role} onValueChange={val => setNewUser({ ...newUser, role: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="principal">Principal</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>School</Label>
                <Select value={newUser.schoolId} onValueChange={val => setNewUser({ ...newUser, schoolId: val })}>
                  <SelectTrigger><SelectValue placeholder="Select School" /></SelectTrigger>
                  <SelectContent>
                    {schools.map(school => (
                      <SelectItem key={school.id} value={school.id.toString()}>{school.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newUser.role === 'teacher' && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="e.g. Mathematics"
                    value={newUser.subjects}
                    onChange={e => setNewUser({ ...newUser, subjects: e.target.value })}
                  />
                </div>
              )}
              <Button type="submit" className="md:col-span-2 mt-2 bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" /> Create User
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* User Lists */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 font-medium text-sm ${activeTab === 'principals' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('principals')}
            >
              Principals ({principals.length})
            </button>
            <button
              className={`flex-1 py-3 font-medium text-sm ${activeTab === 'teachers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('teachers')}
            >
              Teachers ({teachers.length})
            </button>
          </div>

          <div className="p-4">
            {(activeTab === 'principals' ? principals : teachers).length === 0 ? (
              <p className="text-center text-gray-500 py-8">No users found.</p>
            ) : (
              <div className="space-y-3">
                {(activeTab === 'principals' ? principals : teachers).map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">{user.schoolData?.name || 'Unknown School'}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteUser(user.id)}>
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
