import { useState, useEffect } from 'react';
import { SUBJECTS } from '@/utils/subjects';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash, UserPlus, Users, Search, School as SchoolIcon, BookOpen, Mail } from 'lucide-react';
import { toast } from 'sonner';
import client from '@/services/apiClient';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const UserManagement = () => {
  const [principals, setPrincipals] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    schoolId: '',
    role: 'TEACHER',
    subjects: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSchool, setFilterSchool] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersRes = await client.get('/schools/users');
      const schoolsRes = await client.get('/schools');

      setPrincipals(usersRes.data.filter(u => u.role === 'PRINCIPAL'));
      setTeachers(usersRes.data.filter(u => u.role === 'TEACHER'));
      setSchools(schoolsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const { data } = await client.post('/auth/admin/create-user', newUser);
      toast.success(
        <div className="space-y-2">
          <p>User created successfully!</p>
          <div className="p-2 bg-white/20 rounded text-sm">
            <p>Email: {data.email}</p>
            <p className="font-mono font-bold">Temp Password: {data.tempPassword}</p>
          </div>
        </div>,
        { duration: 10000 }
      );
      fetchData();
      setNewUser({ name: '', email: '', schoolId: '', role: 'TEACHER', subjects: '' });
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

  const renderUserGrid = (usersList) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {usersList.length === 0 ? (
        <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
           <Users className="w-12 h-12 mx-auto mb-4 opacity-5" />
           <p className="text-slate-400 font-medium italic">No staff members found matching your criteria.</p>
        </div>
      ) : (
        usersList.map((user) => (
          <Card key={user.id} className="group hover:shadow-2xl transition-all duration-300 border-none ring-1 ring-slate-100 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-100">
                  {(user.fullName || user.name || 'U').charAt(0)}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight line-clamp-1">
                    {user.fullName || user.name}
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-slate-200 mt-1">
                    {user.role}
                  </Badge>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-sm text-slate-500 font-medium font-mono">
                    <Mail className="w-4 h-4 text-slate-300" />
                    <span className="line-clamp-1">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                    <SchoolIcon className="w-4 h-4 text-slate-300" />
                    <span className="line-clamp-1">{user.schoolData?.name || 'Zonal Resource'}</span>
                  </div>
                  {user.role === 'TEACHER' && (
                    <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                      <BookOpen className="w-4 h-4 text-slate-300" />
                      <span>{user.teacherProfile?.subjects?.join(', ') || 'General Studies'}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 underline decoration-blue-500 decoration-4 underline-offset-8">User Management</h1>
            <p className="text-slate-500 font-medium mt-4 italic">Coordinate educational staff excellence across the zone.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 font-bold" onClick={() => document.getElementById('create-user-form')?.scrollIntoView({ behavior: 'smooth' })}>
            <UserPlus className="w-4 h-4 mr-2" /> Provision New Account
          </Button>
        </div>

        {/* Discovery Bar */}
        <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-10 h-11 border-slate-200 focus:ring-blue-500 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterSchool} onValueChange={setFilterSchool}>
            <SelectTrigger className="w-[240px] h-11 border-slate-200 rounded-xl">
              <SelectValue placeholder="All Schools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Schools</SelectItem>
              {schools.map(s => (
                <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="teachers" className="w-full">
          <TabsList className="bg-slate-100/50 p-1 mb-8 h-12">
            <TabsTrigger value="teachers" className="px-10 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
              Teachers <Badge variant="secondary" className="ml-2 bg-slate-200">{teachers.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="principals" className="px-10 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
              Principals <Badge variant="secondary" className="ml-2 bg-slate-200">{principals.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teachers">
            {renderUserGrid(teachers.filter(u => 
              (!searchTerm || u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
              (filterSchool === 'All' || u.schoolData?.id?.toString() === filterSchool)
            ))}
          </TabsContent>

          <TabsContent value="principals">
             {renderUserGrid(principals.filter(u => 
              (!searchTerm || u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
              (filterSchool === 'All' || u.schoolData?.id?.toString() === filterSchool)
            ))}
          </TabsContent>
        </Tabs>

        {/* Create User Form Section */}
        <div id="create-user-form" className="pt-12 border-t border-dashed">
           <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
             <UserPlus className="w-5 h-5 text-blue-600" /> Administrative Provisioning
           </h2>
           <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <form onSubmit={handleCreateUser} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="uppercase text-[10px] font-bold text-slate-400 tracking-widest">Full Name</Label>
                <Input
                  className="h-12 border-slate-100 bg-slate-50/50 focus:bg-white transition-colors"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase text-[10px] font-bold text-slate-400 tracking-widest">Email Address</Label>
                <Input
                  type="email"
                  className="h-12 border-slate-100 bg-slate-50/50 focus:bg-white transition-colors"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase text-[10px] font-bold text-slate-400 tracking-widest">System Role</Label>
                <Select value={newUser.role} onValueChange={val => setNewUser({ ...newUser, role: val })}>
                  <SelectTrigger className="h-12 border-slate-100 bg-slate-50/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRINCIPAL">School Principal</SelectItem>
                    <SelectItem value="TEACHER">Teaching Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="uppercase text-[10px] font-bold text-slate-400 tracking-widest">Station / School</Label>
                <Select value={newUser.schoolId} onValueChange={val => setNewUser({ ...newUser, schoolId: val })}>
                  <SelectTrigger className="h-12 border-slate-100 bg-slate-50/50">
                    <SelectValue placeholder="Select Institutional Assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map(school => (
                      <SelectItem key={school.id} value={school.id.toString()}>{school.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newUser.role === 'TEACHER' && (
                <div className="space-y-2 md:col-span-2">
                  <Label className="uppercase text-[10px] font-bold text-slate-400 tracking-widest">Primary Subject Specialization</Label>
                  <Select value={newUser.subjects} onValueChange={val => setNewUser({ ...newUser, subjects: val })}>
                    <SelectTrigger className="h-12 border-slate-100 bg-slate-50/50">
                      <SelectValue placeholder="Select Specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button type="submit" className="md:col-span-2 h-14 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl transition-all hover:-translate-y-1">
                Authorize & Deploy Account
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
