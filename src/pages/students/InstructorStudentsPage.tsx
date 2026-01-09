import { useState, useEffect } from 'react';
import { Search, Filter, Users as UsersIcon, Mail, Phone, BookOpen, ClipboardCheck, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://lekki-gathering-place-backend-1.onrender.com/api/v1';

interface Student {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    wardId?: string;
  };
  enrollments: Array<{
    id: string;
    class: {
      id: string;
      name: string;
    };
    status: string;
  }>;
  _count?: {
    attendances: number;
  };
}

interface InstructorClass {
  id: string;
  name: string;
}

export default function InstructorStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<InstructorClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  useEffect(() => {
    fetchInstructorClasses();
  }, []);

  useEffect(() => {
    if (classes.length > 0) {
      fetchStudents();
    }
  }, [classes, classFilter]);

  const fetchInstructorClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Fetch instructor's classes
      const response = await axios.get(`${API_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allClasses = response.data.data?.data || response.data.data || [];
      
      // Filter classes where this instructor is teaching
      const instructorClasses = allClasses.filter((cls: any) => 
        cls.instructor?.userId === user?.id
      );

      setClasses(instructorClasses.map((cls: any) => ({
        id: cls.id,
        name: cls.name
      })));
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Get all enrollments for instructor's classes
      const response = await axios.get(`${API_URL}/enrollments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allEnrollments = response.data.data || [];
      
      // Filter enrollments for instructor's classes
      const classIds = classes.map(c => c.id);
      const instructorEnrollments = allEnrollments.filter((enrollment: any) =>
        classIds.includes(enrollment.classId) && enrollment.status === 'APPROVED'
      );

      // Group by student and collect their classes
      const studentMap = new Map<string, Student>();
      
      instructorEnrollments.forEach((enrollment: any) => {
        const studentId = enrollment.student.id;
        
        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            id: enrollment.student.id,
            user: enrollment.student.user,
            enrollments: [],
            _count: { attendances: 0 }
          });
        }
        
        const student = studentMap.get(studentId)!;
        student.enrollments.push({
          id: enrollment.id,
          class: enrollment.class,
          status: enrollment.status
        });
      });

      const studentsArray = Array.from(studentMap.values());
      
      // Filter by selected class if not 'all'
      let filteredStudents = studentsArray;
      if (classFilter !== 'all') {
        filteredStudents = studentsArray.filter(student =>
          student.enrollments.some(e => e.class.id === classFilter)
        );
      }

      setStudents(filteredStudents);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const fullName = `${student.user.firstName} ${student.user.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         student.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-blue-600';
    if (rate >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getAttendanceProgressColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-600';
    if (rate >= 75) return 'bg-blue-600';
    if (rate >= 60) return 'bg-amber-600';
    return 'bg-red-600';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">My Students</h1>
          <p className="text-muted-foreground mt-1">
            Manage students enrolled in your classes
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {classes.length} {classes.length === 1 ? 'class' : 'classes'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">
              Active teaching assignments
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Enrollments</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.reduce((sum, s) => sum + s.enrollments.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total class enrollments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-64">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map(cls => (
              <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Students Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground mb-2">No students found</p>
              <p className="text-sm text-muted-foreground">
                {students.length === 0 
                  ? "You don't have any students enrolled in your classes yet"
                  : "Try adjusting your search or filter"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Ward</TableHead>
                  <TableHead>Enrolled Classes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {student.user.firstName[0]}{student.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {student.user.firstName} {student.user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {student.user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {student.user.phone ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {student.user.phone}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {student.user.wardId ? `Ward ${student.user.wardId.slice(0, 8)}` : 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {student.enrollments.map(enrollment => (
                          <Badge key={enrollment.id} variant="secondary" className="text-xs">
                            {enrollment.class.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
