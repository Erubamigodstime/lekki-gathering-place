import { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Mail, Phone, BookOpen, ClipboardCheck, Download, Eye, MessageSquare, Users, Loader2, MapPin } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface Student {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profilePicture?: string;
    status: string;
    createdAt: string;
    ward?: {
      id: string;
      name: string;
    };
  };
  _count: {
    enrollments: number;
    attendance: number;
  };
  enrollments?: Array<{
    class: {
      id: string;
      name: string;
    };
  }>;
}

interface Ward {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');

  useEffect(() => {
    fetchStudents();
    fetchWards();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching students with token:', token ? 'Token exists' : 'No token');
      const response = await axios.get('http://localhost:5000/api/v1/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const studentData = response.data.data;
      // Handle paginated response structure: { data: [...], pagination: {...} }
      const studentsArray = Array.isArray(studentData) ? studentData : (studentData?.data || []);
      console.log('Fetched students:', studentsArray.length, 'students');
      setStudents(studentsArray);
    } catch (error) {
      console.error('Error fetching students:', error);
      if (axios.isAxiosError(error)) {
        console.error('API error response:', error.response?.data);
        console.error('API error status:', error.response?.status);
      }
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/v1/wards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWards(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching wards:', error);
      setWards([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/v1/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const classData = response.data.data;
      setClasses(Array.isArray(classData) ? classData : (classData?.data || []));
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    }
  };

  const filteredStudents = students.filter(student => {
    if (!student?.user) return false;
    const fullName = `${student.user.firstName || ''} ${student.user.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         (student.user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWard = wardFilter === 'all' || student.user.ward?.name === wardFilter;
    // For class filter, we would need enrollment data - for now just match all if filter is 'all'
    const matchesClass = classFilter === 'all';
    return matchesSearch && matchesWard && matchesClass;
  });

  const calculateAttendanceRate = (student: Student) => {
    if (!student?._count) return 0;
    const attendanceCount = student._count.attendance || 0;
    const enrollmentsCount = student._count.enrollments || 0;
    if (attendanceCount === 0 || enrollmentsCount === 0) return 0;
    // This is simplified - calculate as percentage of expected attendance
    // Assuming roughly 10 sessions per enrollment
    const expectedAttendance = enrollmentsCount * 10;
    return Math.min(100, Math.round((attendanceCount / expectedAttendance) * 100));
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-amber-600';
    return 'text-red-600';
  };

  const getAttendanceProgressColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 75) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const activeStudents = students.filter(s => s?.user?.status === 'ACTIVE').length;
  const avgAttendance = students.length > 0 
    ? Math.round(students.reduce((sum, s) => sum + calculateAttendanceRate(s), 0) / students.length) 
    : 0;
  const lowAttendance = students.filter(s => calculateAttendanceRate(s) < 75).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">Manage student enrollments and track progress</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-foreground">{students.length}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold text-green-600">{activeStudents}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-full">
                <ClipboardCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Attendance</p>
                <p className="text-2xl font-bold text-foreground">{avgAttendance}%</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Attendance</p>
                <p className="text-2xl font-bold text-amber-600">{lowAttendance}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-full">
                <ClipboardCheck className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={wardFilter} onValueChange={setWardFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by ward" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Wards</SelectItem>
            {wards.map(ward => (
              <SelectItem key={ward.id} value={ward.name}>
                {ward.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <BookOpen className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map(cls => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-full mb-4">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
                <p className="text-muted-foreground font-medium">No students found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student) => {
            const attendanceRate = calculateAttendanceRate(student);
            
            return (
              <Card key={student.id} className="overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-primary/10">
                        {student.user.profilePicture ? (
                          <AvatarImage src={student.user.profilePicture} alt={`${student.user.firstName} ${student.user.lastName}`} />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-sm font-bold">
                          {student.user.firstName[0]}{student.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">
                          {student.user.firstName} {student.user.lastName}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{student.user.ward?.name || 'No Ward'}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={student.user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {student.user.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{student.user.email}</span>
                    </div>
                    {student.user.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{student.user.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Attendance</span>
                      <span className={`text-sm font-semibold ${getAttendanceColor(attendanceRate)}`}>
                        {attendanceRate}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${getAttendanceProgressColor(attendanceRate)}`}
                        style={{ width: `${attendanceRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-medium">{student._count.enrollments} classes</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <MoreHorizontal className="h-4 w-4 mr-2" />
                          More Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-48">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ClipboardCheck className="mr-2 h-4 w-4" />
                          View Attendance
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block overflow-hidden border-t-4 border-t-primary shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-primary/10 via-purple-50 to-blue-50 hover:from-primary/15 hover:via-purple-100 hover:to-blue-100 border-b-2 border-primary/20">
                <TableHead className="font-semibold text-foreground">Student</TableHead>
                <TableHead className="font-semibold text-foreground">Contact</TableHead>
                <TableHead className="hidden lg:table-cell font-semibold text-foreground">Ward</TableHead>
                <TableHead className="font-semibold text-foreground">Classes</TableHead>
                <TableHead className="font-semibold text-foreground">Attendance</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-full mb-4">
                        <Users className="h-16 w-16 text-blue-600" />
                      </div>
                      <p className="text-lg font-semibold text-foreground mb-2">No students found</p>
                      <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student, index) => {
                  const attendanceRate = calculateAttendanceRate(student);
                  const rowColor = index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30';
                  
                  return (
                    <TableRow 
                      key={student.id}
                      className={`${rowColor} hover:bg-blue-50 transition-colors border-b border-border/50`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-primary/10">
                            {student.user.profilePicture ? (
                              <AvatarImage src={student.user.profilePicture} alt={`${student.user.firstName} ${student.user.lastName}`} />
                            ) : null}
                            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-sm font-semibold">
                              {student.user.firstName[0]}{student.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{student.user.firstName} {student.user.lastName}</p>
                            <p className="text-xs text-muted-foreground">Joined {new Date(student.user.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="bg-blue-100 p-1 rounded">
                              <Mail className="h-3 w-3 text-blue-600" />
                            </div>
                            <span className="truncate text-xs max-w-[180px]">{student.user.email}</span>
                          </div>
                          {student.user.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <div className="bg-green-100 p-1 rounded">
                                <Phone className="h-3 w-3 text-green-600" />
                              </div>
                              <span className="text-xs">{student.user.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="bg-purple-100 p-1.5 rounded">
                            <MapPin className="h-3.5 w-3.5 text-purple-600" />
                          </div>
                          <Badge variant="secondary" className="font-medium">{student.user.ward?.name || 'No Ward'}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-md border border-blue-200">
                          <BookOpen className="h-4 w-4" />
                          <span className="font-semibold text-sm">{student._count.enrollments}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-32">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-semibold ${getAttendanceColor(attendanceRate)}`}>
                              {attendanceRate}%
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${getAttendanceProgressColor(attendanceRate)}`}
                              style={{ width: `${attendanceRate}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={student.user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                        >
                          {student.user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ClipboardCheck className="mr-2 h-4 w-4" />
                              View Attendance
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BookOpen className="mr-2 h-4 w-4" />
                              Assign Class
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
