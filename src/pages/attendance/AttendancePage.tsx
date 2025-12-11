import { useState } from 'react';
import { Search, Filter, Check, X, Download, Calendar, Clock, Users } from 'lucide-react';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

const mockAttendanceRecords = [
  {
    id: '1',
    student: { name: 'John Smith', id: '1' },
    class: 'Tailoring Basics',
    instructor: 'Mary Johnson',
    date: '2024-12-10',
    time: '9:00 AM',
    status: 'pending',
    markedAt: '9:05 AM',
  },
  {
    id: '2',
    student: { name: 'Sarah Wilson', id: '2' },
    class: 'Tailoring Basics',
    instructor: 'Mary Johnson',
    date: '2024-12-10',
    time: '9:00 AM',
    status: 'pending',
    markedAt: '9:02 AM',
  },
  {
    id: '3',
    student: { name: 'Michael Brown', id: '3' },
    class: 'Music Training',
    instructor: 'David Williams',
    date: '2024-12-10',
    time: '2:00 PM',
    status: 'approved',
    markedAt: '2:01 PM',
    approvedAt: '2:15 PM',
  },
  {
    id: '4',
    student: { name: 'Emily Davis', id: '4' },
    class: 'Cooking Class',
    instructor: 'Chef Roberts',
    date: '2024-12-09',
    time: '11:30 AM',
    status: 'approved',
    markedAt: '11:35 AM',
    approvedAt: '11:45 AM',
  },
  {
    id: '5',
    student: { name: 'Robert Taylor', id: '5' },
    class: 'Photography',
    instructor: 'James Wilson',
    date: '2024-12-09',
    time: '3:00 PM',
    status: 'rejected',
    markedAt: '4:30 PM',
    rejectedAt: '4:45 PM',
    reason: 'Marked too late',
  },
];

export default function AttendancePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [activeTab, setActiveTab] = useState('all');

  const filteredRecords = mockAttendanceRecords.filter(record => {
    const matchesSearch = record.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.class.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === 'all' || record.class === classFilter;
    const matchesTab = activeTab === 'all' || record.status === activeTab;
    return matchesSearch && matchesClass && matchesTab;
  });

  const pendingCount = mockAttendanceRecords.filter(r => r.status === 'pending').length;
  const approvedToday = mockAttendanceRecords.filter(r => r.status === 'approved' && r.date === '2024-12-10').length;
  const rejectedToday = mockAttendanceRecords.filter(r => r.status === 'rejected' && r.date === '2024-12-10').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Attendance Management</h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'admin' ? 'Review and manage all attendance records' : 'Approve or reject student attendance'}
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{approvedToday}</p>
                <p className="text-sm text-muted-foreground">Approved Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <X className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{rejectedToday}</p>
                <p className="text-sm text-muted-foreground">Rejected Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mockAttendanceRecords.length}</p>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingCount > 0 && (
              <span className="ml-2 bg-accent text-accent-foreground text-xs rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
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
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Attendance Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Marked At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record, index) => (
              <TableRow 
                key={record.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {record.student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{record.student.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{record.class}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{record.instructor}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{record.date}</p>
                    <p className="text-muted-foreground">{record.time}</p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{record.markedAt}</TableCell>
                <TableCell>{getStatusBadge(record.status)}</TableCell>
                <TableCell>
                  {record.status === 'pending' ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 text-green-600 border-green-600 hover:bg-green-50">
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-destructive border-destructive hover:bg-destructive/10">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {record.status === 'approved' ? `at ${record.approvedAt}` : record.reason}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No attendance records found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
