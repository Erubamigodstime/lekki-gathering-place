import { useState, useEffect } from 'react';
import { Search, Download, Calendar as CalendarIcon, Users, TrendingUp, Clock, Filter as FilterIcon, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import axios from 'axios';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  markedAt: string;
  class: {
    id: string;
    name: string;
    instructor: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
    ward: {
      id: string;
      name: string;
    };
  };
  student: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      ward: {
        id: string;
        name: string;
      };
    };
  };
}

interface AttendanceReport {
  classId: string;
  className: string;
  instructorName: string;
  totalAttendance: number;
  approved: number;
  pending: number;
  rejected: number;
  uniqueDates: number;
}

interface Ward {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
}

type DateFilterType = 'day' | 'week' | 'month';

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReport[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [wardFilter, setWardFilter] = useState('all');
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>('month');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAttendanceData();
    fetchAttendanceReport();
  }, [classFilter, wardFilter, dateFilterType, selectedDate]);

  const fetchInitialData = async () => {
    await Promise.all([
      fetchWards(),
      fetchClasses(),
    ]);
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

  const getDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilterType) {
      case 'day':
        if (selectedDate) {
          const dayDate = new Date(selectedDate);
          dayDate.setHours(0, 0, 0, 0);
          return { startDate: dayDate.toISOString(), endDate: dayDate.toISOString() };
        }
        return { startDate: today.toISOString(), endDate: today.toISOString() };
      case 'week':
        const weekStart = startOfWeek(selectedDate || today, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(selectedDate || today, { weekStartsOn: 0 });
        return { startDate: weekStart.toISOString(), endDate: weekEnd.toISOString() };
      case 'month':
        const monthStart = startOfMonth(selectedDate || today);
        const monthEnd = endOfMonth(selectedDate || today);
        return { startDate: monthStart.toISOString(), endDate: monthEnd.toISOString() };
      default:
        return { startDate: today.toISOString(), endDate: today.toISOString() };
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching attendance data with token:', token ? 'Token exists' : 'No token');
      
      const { startDate, endDate } = getDateRange();
      
      const params: any = {};
      
      // Only add date filters if not fetching all data
      if (dateFilterType !== 'month' || classFilter !== 'all' || wardFilter !== 'all') {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      
      if (classFilter !== 'all') params.classId = classFilter;
      if (wardFilter !== 'all') params.wardId = wardFilter;

      console.log('Attendance API params:', params);
      const response = await axios.get('http://localhost:5000/api/v1/attendance', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      console.log('Attendance API response:', response.data);
      console.log('Attendance records count:', response.data.data?.length || 0);
      setAttendanceRecords(response.data.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      if (axios.isAxiosError(error)) {
        console.error('API error response:', error.response?.data);
        console.error('API error status:', error.response?.status);
      }
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceReport = async () => {
    try {
      setReportLoading(true);
      const token = localStorage.getItem('token');
      const { startDate, endDate } = getDateRange();
      
      const params: any = {
        groupBy: 'class'
      };
      
      // Only add date filters if not fetching all data
      if (dateFilterType !== 'month' || classFilter !== 'all' || wardFilter !== 'all') {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      
      if (classFilter !== 'all') params.classId = classFilter;
      if (wardFilter !== 'all') params.wardId = wardFilter;

      console.log('Report API params:', params);
      const response = await axios.get('http://localhost:5000/api/v1/attendance/report', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      console.log('Report API response:', response.data);
      console.log('Report data:', response.data.data);
      setAttendanceReport(response.data.data.data || []);
    } catch (error) {
      console.error('Error fetching attendance report:', error);
      if (axios.isAxiosError(error)) {
        console.error('Report API error:', error.response?.data);
      }
      setAttendanceReport([]);
    } finally {
      setReportLoading(false);
    }
  };

  const exportToCSV = () => {
    const { startDate, endDate } = getDateRange();
    const dateStr = dateFilterType === 'day' && selectedDate 
      ? format(selectedDate, 'yyyy-MM-dd')
      : `${format(new Date(startDate), 'yyyy-MM-dd')}_to_${format(new Date(endDate), 'yyyy-MM-dd')}`;
    
    // Export detailed records with all filter information
    const headers = [
      'Student Name',
      'Student Email',
      'Student Phone',
      'Student Ward',
      'Class',
      'Instructor',
      'Class Ward',
      'Date',
      'Time Marked',
      'Status'
    ];
    
    // CSV Rows from filtered records
    const rows = filteredRecords.map(record => [
      `${record.student.user.firstName} ${record.student.user.lastName}`,
      record.student.user.email,
      record.student.user.phone || 'N/A',
      record.student.user.ward.name,
      record.class.name,
      `${record.class.instructor.user.firstName} ${record.class.instructor.user.lastName}`,
      record.class.ward.name,
      format(new Date(record.date), 'MMM dd, yyyy'),
      format(new Date(record.markedAt), 'hh:mm a'),
      record.status
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_detailed_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = attendanceRecords.filter(record => {
    if (!record?.student?.user || !record?.class) return false;
    const studentName = `${record.student.user.firstName} ${record.student.user.lastName}`.toLowerCase();
    const className = record.class.name.toLowerCase();
    const matchesSearch = studentName.includes(searchQuery.toLowerCase()) ||
                         className.includes(searchQuery.toLowerCase()) ||
                         record.student.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: attendanceRecords.length,
    pending: attendanceRecords.filter(r => r.status === 'PENDING').length,
    approved: attendanceRecords.filter(r => r.status === 'APPROVED').length,
    rejected: attendanceRecords.filter(r => r.status === 'REJECTED').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Attendance Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive attendance tracking and reporting system
          </p>
        </div>
        <Button 
          onClick={exportToCSV}
          className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
          disabled={filteredRecords.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.pending}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.approved}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-100 to-green-200">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.rejected}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-red-100 to-red-200">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-purple-50 to-blue-50">
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
            {/* Date Filter Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Time Period</label>
              <Select value={dateFilterType} onValueChange={(value: DateFilterType) => setDateFilterType(value)}>
                <SelectTrigger className="border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Picker - shows for Day selection */}
            {dateFilterType === 'day' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Select Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal border-2">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Class Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Class</label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="border-2">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ward Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Ward</label>
              <Select value={wardFilter} onValueChange={setWardFilter}>
                <SelectTrigger className="border-2">
                  <SelectValue placeholder="All Wards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  {wards.map(ward => (
                    <SelectItem key={ward.id} value={ward.id}>{ward.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Student, class..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Report Table */}
      <Card className="shadow-card">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Attendance Summary by Class
            </CardTitle>
            {reportLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {reportLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : attendanceReport.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No attendance data found for selected filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-primary/10 via-purple-50 to-blue-50 hover:from-primary/15 hover:via-purple-100 hover:to-blue-100">
                    <TableHead className="font-bold text-foreground">Class</TableHead>
                    <TableHead className="font-bold text-foreground">Instructor</TableHead>
                    <TableHead className="font-bold text-foreground text-center">Total</TableHead>
                    <TableHead className="font-bold text-foreground text-center">Approved</TableHead>
                    <TableHead className="font-bold text-foreground text-center">Pending</TableHead>
                    <TableHead className="font-bold text-foreground text-center">Rejected</TableHead>
                    <TableHead className="font-bold text-foreground text-center">Dates</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceReport.map((record, index) => (
                    <TableRow 
                      key={record.classId}
                      className={index % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-blue-50/30 hover:bg-blue-50/50'}
                    >
                      <TableCell className="font-medium">{record.className}</TableCell>
                      <TableCell>{record.instructorName}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {record.totalAttendance}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          {record.approved}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                          {record.pending}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          {record.rejected}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {record.uniqueDates}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Records Table */}
      <Card className="shadow-card">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Detailed Attendance Records
            </CardTitle>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No attendance records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-primary/10 via-purple-50 to-blue-50 hover:from-primary/15 hover:via-purple-100 hover:to-blue-100">
                    <TableHead className="font-bold text-foreground">Student</TableHead>
                    <TableHead className="font-bold text-foreground">Class</TableHead>
                    <TableHead className="font-bold text-foreground">Instructor</TableHead>
                    <TableHead className="font-bold text-foreground">Ward</TableHead>
                    <TableHead className="font-bold text-foreground">Date</TableHead>
                    <TableHead className="font-bold text-foreground">Time</TableHead>
                    <TableHead className="font-bold text-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record, index) => (
                    <TableRow 
                      key={record.id}
                      className={index % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-blue-50/30 hover:bg-blue-50/50'}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {record.student.user.firstName} {record.student.user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{record.student.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{record.class.name}</TableCell>
                      <TableCell>
                        {record.class.instructor.user.firstName} {record.class.instructor.user.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {record.student.user.ward.name}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(record.markedAt), 'hh:mm a')}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
