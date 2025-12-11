import { useState } from 'react';
import { Search, Filter, MoreHorizontal, Mail, Phone, BookOpen, ClipboardCheck, Download, Eye, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

const mockStudents = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1234567890',
    ward: 'Central Ward',
    enrolledClasses: ['Tailoring Basics', 'Music Training'],
    attendanceRate: 95,
    status: 'active',
    joinedAt: '2024-06-15',
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@email.com',
    phone: '+1234567891',
    ward: 'North Ward',
    enrolledClasses: ['Cooking Class', 'Photography'],
    attendanceRate: 88,
    status: 'active',
    joinedAt: '2024-07-20',
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@email.com',
    phone: '+1234567892',
    ward: 'South Ward',
    enrolledClasses: ['Tailoring Basics'],
    attendanceRate: 72,
    status: 'active',
    joinedAt: '2024-08-10',
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@email.com',
    phone: '+1234567893',
    ward: 'East Ward',
    enrolledClasses: ['Music Training', 'Art Class'],
    attendanceRate: 92,
    status: 'active',
    joinedAt: '2024-09-05',
  },
  {
    id: '5',
    firstName: 'Robert',
    lastName: 'Taylor',
    email: 'robert.taylor@email.com',
    phone: '+1234567894',
    ward: 'West Ward',
    enrolledClasses: ['Cooking Class'],
    attendanceRate: 65,
    status: 'inactive',
    joinedAt: '2024-05-01',
  },
];

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');

  const filteredStudents = mockStudents.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWard = wardFilter === 'all' || student.ward === wardFilter;
    const matchesClass = classFilter === 'all' || student.enrolledClasses.includes(classFilter);
    return matchesSearch && matchesWard && matchesClass;
  });

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
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">Total Students</p>
          <p className="text-2xl font-bold text-foreground">{mockStudents.length}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">Active Students</p>
          <p className="text-2xl font-bold text-green-600">{mockStudents.filter(s => s.status === 'active').length}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">Avg. Attendance</p>
          <p className="text-2xl font-bold text-foreground">
            {Math.round(mockStudents.reduce((sum, s) => sum + s.attendanceRate, 0) / mockStudents.length)}%
          </p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">Low Attendance</p>
          <p className="text-2xl font-bold text-amber-600">{mockStudents.filter(s => s.attendanceRate < 75).length}</p>
        </div>
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
            <SelectItem value="Central Ward">Central Ward</SelectItem>
            <SelectItem value="North Ward">North Ward</SelectItem>
            <SelectItem value="South Ward">South Ward</SelectItem>
            <SelectItem value="East Ward">East Ward</SelectItem>
            <SelectItem value="West Ward">West Ward</SelectItem>
          </SelectContent>
        </Select>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <BookOpen className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            <SelectItem value="Tailoring Basics">Tailoring Basics</SelectItem>
            <SelectItem value="Music Training">Music Training</SelectItem>
            <SelectItem value="Cooking Class">Cooking Class</SelectItem>
            <SelectItem value="Photography">Photography</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Students Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Enrolled Classes</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student, index) => (
              <TableRow 
                key={student.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {student.firstName[0]}{student.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{student.firstName} {student.lastName}</p>
                      <p className="text-sm text-muted-foreground">Joined {new Date(student.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate max-w-32">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{student.phone}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{student.ward}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-48">
                    {student.enrolledClasses.map(cls => (
                      <Badge key={cls} variant="outline" className="text-xs">{cls}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="w-32">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${getAttendanceColor(student.attendanceRate)}`}>
                        {student.attendanceRate}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${getAttendanceProgressColor(student.attendanceRate)}`}
                        style={{ width: `${student.attendanceRate}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                  >
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No students found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
