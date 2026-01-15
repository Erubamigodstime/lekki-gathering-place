import { Users, GraduationCap, BookOpen, ClipboardCheck, Clock, UserCheck, Plus, Check, X, Loader2, Filter } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard';
import { TodayClassesCard } from '@/components/dashboard/TodayClassesCard';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { PendingApprovalsCard } from '@/components/dashboard/PendingApprovalsCard';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CreateClassDialog } from '@/components/admin/CreateClassDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function AdminDashboard() {
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    activeClasses: 0,
    pendingApprovals: 0,
  });
  const [pendingInstructors, setPendingInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createClassOpen, setCreateClassOpen] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('week');

  useEffect(() => {
    fetchDashboardData();
    
    return () => {
      // Cleanup: abort ongoing requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchAttendanceData();
    }
  }, [selectedClass, timeFilter]);

  const fetchDashboardData = useCallback(async () => {
    try {
      // Abort previous request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;
      
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch ALL essential data in parallel - no sequential waterfalls
      const [studentsRes, instructorsRes, classesRes, pendingInstructorsRes, attendanceRes] = await Promise.all([
        axios.get(`${API_URL}/students?page=1&limit=1`, { headers, signal }),
        axios.get(`${API_URL}/instructors?page=1&limit=1`, { headers, signal }),
        axios.get(`${API_URL}/classes?page=1&limit=20`, { headers, signal }),
        axios.get(`${API_URL}/instructors?status=PENDING&page=1&limit=10`, { headers, signal }),
        axios.get(`${API_URL}/attendance?page=1&limit=50`, { headers, signal })
      ]);

      // Extract totals
      const students = studentsRes.data.data.total || 0;
      const instructors = instructorsRes.data.data.total || 0;
      
      // Handle paginated response for classes
      const allClasses = classesRes.data.data.data || classesRes.data.data.items || classesRes.data.data || [];
      const activeClasses = allClasses.filter((c: any) => c.status === 'ACTIVE');
      
      // Handle paginated response for pending instructors
      const pendingInstr = pendingInstructorsRes.data.data.data || pendingInstructorsRes.data.data || [];

      setStats({
        totalStudents: students,
        totalInstructors: instructors,
        activeClasses: activeClasses.length,
        pendingApprovals: pendingInstr.length,
      });

      setPendingInstructors(pendingInstr);
      setClasses(allClasses);
      
      // Process attendance data immediately - no separate API call
      const attendanceRecords = attendanceRes.data.data.data || attendanceRes.data.data || [];
      const processedData = processAttendanceByTimeFilter(attendanceRecords, timeFilter);
      setAttendanceData(processedData);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled');
      } else {
        console.error('Failed to fetch dashboard data:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  // Memoize today's classes computation
  const todayClasses = useMemo(() => {
    const today = new Date().getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[today];
    return classes.filter((classItem: any) => classItem.schedule?.days?.includes(todayName));
  }, [classes]);
  
  // Memoize recent activities - limit to top 5 from pending instructors
  const recentActivities = useMemo(() => {
    return pendingInstructors.slice(0, 5).map((instructor: any) => ({
      id: `pending-${instructor.id}`,
      user: { name: `${instructor.user?.firstName} ${instructor.user?.lastName}` },
      action: 'requested instructor approval',
      target: 'Instructor Role',
      time: instructor.createdAt || new Date().toISOString(),
      type: 'approval' as const,
    }));
  }, [pendingInstructors]);

  const fetchAttendanceData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const classId = selectedClass === 'all' ? undefined : selectedClass;
      
      // Only fetch last 50 records for chart - don't load all attendance
      const response = await axios.get(`${API_URL}/attendance?page=1&limit=50`, { 
        headers, 
        params: classId ? { classId } : {} 
      });
      
      const attendanceRecords = response.data.data.data || response.data.data || [];
      const processedData = processAttendanceByTimeFilter(attendanceRecords, timeFilter);
      setAttendanceData(processedData);
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
      setAttendanceData([]);
    }
  }, [selectedClass, timeFilter]);

  const processAttendanceByTimeFilter = (records: any[], filter: string) => {
    const now = new Date();
    const data: any[] = [];

    if (filter === 'week') {
      // Last 7 days
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayName = dayNames[date.getDay()];
        
        const dayRecords = records.filter((r: any) => {
          const recordDate = new Date(r.date);
          return recordDate.toDateString() === date.toDateString();
        });

        data.push({
          name: dayName,
          present: dayRecords.filter((r: any) => r.status === 'APPROVED').length,
          pending: dayRecords.filter((r: any) => r.status === 'PENDING').length,
          absent: dayRecords.filter((r: any) => r.status === 'REJECTED').length,
        });
      }
    } else if (filter === 'month') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekRecords = records.filter((r: any) => {
          const recordDate = new Date(r.date);
          return recordDate >= weekStart && recordDate <= weekEnd;
        });

        data.push({
          name: `Week ${4 - i}`,
          present: weekRecords.filter((r: any) => r.status === 'APPROVED').length,
          pending: weekRecords.filter((r: any) => r.status === 'PENDING').length,
          absent: weekRecords.filter((r: any) => r.status === 'REJECTED').length,
        });
      }
    } else if (filter === 'year') {
      // Last 12 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthName = monthNames[date.getMonth()];

        const monthRecords = records.filter((r: any) => {
          const recordDate = new Date(r.date);
          return recordDate.getMonth() === date.getMonth() && recordDate.getFullYear() === date.getFullYear();
        });

        data.push({
          name: monthName,
          present: monthRecords.filter((r: any) => r.status === 'APPROVED').length,
          pending: monthRecords.filter((r: any) => r.status === 'PENDING').length,
          absent: monthRecords.filter((r: any) => r.status === 'REJECTED').length,
        });
      }
    }

    return data;
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const handleApproveInstructor = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/instructors/${id}/approve`,
        { status: 'APPROVED' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingInstructors(prev => prev.filter(i => i.id !== id));
      setStats(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1, totalInstructors: prev.totalInstructors + 1 }));
    } catch (error) {
      console.error('Failed to approve instructor:', error);
    }
  };

  const handleRejectInstructor = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/instructors/${id}/approve`,
        { status: 'REJECTED', rejectionReason: 'Not approved by admin' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingInstructors(prev => prev.filter(i => i.id !== id));
      setStats(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1 }));
    } catch (error) {
      console.error('Failed to reject instructor:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening at the Gathering Place Today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="church" onClick={() => setCreateClassOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Class
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={loading ? '...' : stats.totalStudents.toString()}
          change="Enrolled students"
          changeType="neutral"
          icon={Users}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Instructors"
          value={loading ? '...' : stats.totalInstructors.toString()}
          change="Active instructors"
          changeType="neutral"
          icon={GraduationCap}
          iconColor="text-accent"
        />
        <StatCard
          title="Active Classes"
          value={loading ? '...' : stats.activeClasses.toString()}
          change="Currently running"
          changeType="neutral"
          icon={BookOpen}
          iconColor="text-green-600"
        />
        <StatCard
          title="Pending Approvals"
          value={loading ? '...' : stats.pendingApprovals.toString()}
          change="Requires attention"
          changeType={stats.pendingApprovals > 0 ? "negative" : "neutral"}
          icon={UserCheck}
          iconColor="text-amber-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Chart with Filters */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-lg font-semibold">Attendance Trends</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="All Classes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 4 Weeks</SelectItem>
                      <SelectItem value="year">Last 12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AttendanceChart data={attendanceData} loading={loading} />
            </CardContent>
          </Card>
          
          <TodayClassesCard classes={todayClasses} loading={loading} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Instructor Approvals */}
          <Card className="shadow-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Pending Instructor Approvals</CardTitle>
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                {pendingInstructors.length} pending
              </Badge>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                  <p className="text-sm text-muted-foreground">Loading approvals...</p>
                </div>
              ) : pendingInstructors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
                    <UserCheck className="h-7 w-7 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">All Clear!</h4>
                  <p className="text-sm text-muted-foreground text-center">No pending instructor approvals</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingInstructors.slice(0, 5).map((instructor) => (
                    <div key={instructor.id} className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {instructor.user.firstName.charAt(0)}{instructor.user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {instructor.user.firstName} {instructor.user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{instructor.user.email}</p>
                        </div>
                      </div>
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground">
                          Experience: <span className="font-medium text-foreground">{instructor.experience} years</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Skills: <span className="font-medium text-foreground">{instructor.skills?.slice(0, 2).join(', ')}</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="flex-1 h-8 bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveInstructor(instructor.id)}
                        >
                          <Check className="mr-1 h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 h-8 text-destructive border-destructive hover:bg-destructive/10"
                          onClick={() => handleRejectInstructor(instructor.id)}
                        >
                          <X className="mr-1 h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <RecentActivityCard activities={recentActivities} loading={loading} />
        </div>
      </div>

      {/* Create Class Dialog */}
      <CreateClassDialog
        open={createClassOpen}
        onClose={() => setCreateClassOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
        }}
      />
    </div>
  );
}
