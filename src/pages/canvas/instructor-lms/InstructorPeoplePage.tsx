import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Mail, CheckCircle2, Clock, XCircle, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Student {
  id: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  enrolledAt: string;
  classId: string;
  class?: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profilePicture?: string;
  };
}

interface ClassOption {
  id: string;
  name: string;
}

interface InstructorPeoplePageProps {
  classId: string;
}

export default function InstructorPeoplePage({ classId }: InstructorPeoplePageProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, [classId]);

  useEffect(() => {
    filterStudents();
  }, [students, searchQuery, statusFilter, classFilter]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/instructors/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const instructorClasses = response.data.data?.classes || [];
      setClasses(instructorClasses.map((c: any) => ({ id: c.id, name: c.name })));
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/instructors/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const instructorClasses = response.data.data?.classes || [];
      
      const allEnrollments = [];
      for (const cls of instructorClasses) {
        try {
          const enrollResponse = await axios.get(`${API_URL}/enrollments/class/${cls.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Handle paginated response structure
          const enrollData = enrollResponse.data.data;
          const enrollments = Array.isArray(enrollData) ? enrollData : (enrollData?.data || []);
          allEnrollments.push(...enrollments);
        } catch (err) {
          console.error(`Failed to fetch enrollments for class ${cls.id}:`, err);
        }
      }
      
      const mappedEnrollments = allEnrollments.map((e: any) => ({
        id: e.id,
        userId: e.student?.userId || e.userId || '',
        status: e.status || 'PENDING',
        enrolledAt: e.enrolledAt || new Date().toISOString(),
        classId: e.classId || '',
        class: e.class ? { id: e.class.id, name: e.class.name } : undefined,
        user: {
          id: e.student?.user?.id || e.user?.id || '',
          firstName: e.student?.user?.firstName || e.user?.firstName || 'Unknown',
          lastName: e.student?.user?.lastName || e.user?.lastName || 'User',
          email: e.student?.user?.email || e.user?.email || 'N/A',
          phone: e.student?.user?.phone || e.user?.phone || '',
          profilePicture: e.student?.user?.profilePicture || e.user?.profilePicture || '',
        }
      }));
      
      setStudents(mappedEnrollments);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    try {
      let filtered = students;

      if (classFilter !== 'ALL') {
        filtered = filtered.filter(s => s.classId === classFilter);
      }

      if (statusFilter !== 'ALL') {
        filtered = filtered.filter(s => s.status === statusFilter);
      }

      if (searchQuery) {
        filtered = filtered.filter(s => {
          const fullName = `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.toLowerCase();
          const email = (s.user?.email || '').toLowerCase();
          const query = searchQuery.toLowerCase();
          return fullName.includes(query) || email.includes(query);
        });
      }

      setFilteredStudents(filtered);
    } catch (error) {
      console.error('Error filtering students:', error);
      setFilteredStudents([]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Pending</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-amber-600" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Users className="h-5 w-5 text-gray-600" />;
    }
  };

  const approvedCount = students.filter(s => s.status === 'APPROVED').length;
  const pendingCount = students.filter(s => s.status === 'PENDING').length;
  const rejectedCount = students.filter(s => s.status === 'REJECTED').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Students</h1>
        <p className="text-gray-600">Manage enrolled students in your classes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{students.length}</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
              </div>
              <Clock className="h-10 w-10 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {classes.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Class:</span>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={classFilter === 'ALL' ? 'default' : 'outline'}
                    onClick={() => setClassFilter('ALL')}
                    size="sm"
                  >
                    All Classes ({students.length})
                  </Button>
                  {classes.map((cls) => {
                    const count = students.filter(s => s.classId === cls.id).length;
                    return (
                      <Button
                        key={cls.id}
                        variant={classFilter === cls.id ? 'default' : 'outline'}
                        onClick={() => setClassFilter(cls.id)}
                        size="sm"
                        className={classFilter === cls.id ? 'bg-blue-600 hover:bg-blue-700' : ''}
                      >
                        {cls.name} ({count})
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Status:</span>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('ALL')}
                  size="sm"
                >
                  All ({students.filter(s => classFilter === 'ALL' || s.classId === classFilter).length})
                </Button>
                <Button
                  variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('APPROVED')}
                  size="sm"
                  className={statusFilter === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  Approved ({students.filter(s => (classFilter === 'ALL' || s.classId === classFilter) && s.status === 'APPROVED').length})
                </Button>
                <Button
                  variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('PENDING')}
                  size="sm"
                  className={statusFilter === 'PENDING' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                >
                  Pending ({students.filter(s => (classFilter === 'ALL' || s.classId === classFilter) && s.status === 'PENDING').length})
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'ALL' || classFilter !== 'ALL'
                ? 'Try adjusting your filters' 
                : 'No students are enrolled yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                      <span className="text-white font-semibold text-lg">
                        {student.user?.firstName?.[0] || '?'}{student.user?.lastName?.[0] || '?'}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {student.user?.firstName || 'Unknown'} {student.user?.lastName || 'User'}
                        </h3>
                        {getStatusBadge(student.status)}
                        {student.class && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                            {student.class.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {student.user?.email || 'N/A'}
                        </div>
                        {student.user?.phone && (
                          <div className="flex items-center gap-1">
                            <span>📱</span>
                            {student.user.phone}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Enrolled: {student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {getStatusIcon(student.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
