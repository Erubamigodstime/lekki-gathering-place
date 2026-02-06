import { BookOpen, Users, ClipboardCheck, Calendar, Clock, Bell, ArrowRight, Check, X, Loader2, BookOpenCheck, UserCheck, GraduationCap } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { TodayClassesCard } from '@/components/dashboard/TodayClassesCard';
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { ClassAttendanceCalendar } from '@/components/attendance';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [instructorProfile, setInstructorProfile] = useState<any>(null);
  const [teachingClasses, setTeachingClasses] = useState<any[]>([]);
  const [pendingAttendance, setPendingAttendance] = useState<any[]>([]);
  const [pendingEnrollments, setPendingEnrollments] = useState<any[]>([]);
  const [allAttendanceRecords, setAllAttendanceRecords] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        setError(null);

        // Abort previous request if any
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;

        const token = localStorage.getItem('token');

        if (!token) {
          setError('Authentication token not found. Please login again.');
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Get instructor profile with all data in ONE call
        const profileRes = await axios.get(`${API_URL}/instructors/profile`, {
          headers,
          signal,
          timeout: 15000
        });

        if (!profileRes.data || !profileRes.data.data) {
          throw new Error('Invalid response structure from instructor profile API');
        }

        const instructorData = profileRes.data.data;
        setInstructorProfile(instructorData);

        // Process classes (already included in profile response)
        const uniqueClasses = Array.from(
          new Map((instructorData.classes || []).map((cls: any) => [cls.id, cls])).values()
        ) as any[];

        setTeachingClasses(uniqueClasses);

        // Fetch pending attendance and enrollments in PARALLEL if instructor has classes
        if (uniqueClasses.length > 0) {
          const [attendanceRes, enrollmentsRes] = await Promise.all([
            axios.get(`${API_URL}/attendance?status=PENDING&page=1&limit=20`, { headers, signal }),
            axios.get(`${API_URL}/enrollments?status=PENDING&page=1&limit=20`, { headers, signal })
          ]);

          // Filter for instructor's classes only
          const instructorClassIds = uniqueClasses.map(c => c.id);
          const filteredAttendance = (attendanceRes.data.data.data || attendanceRes.data.data || [])
            .filter((a: any) => instructorClassIds.includes(a.classId));
          const filteredEnrollments = (enrollmentsRes.data.data.data || enrollmentsRes.data.data || [])
            .filter((e: any) => instructorClassIds.includes(e.classId));

          setPendingAttendance(filteredAttendance);
          setPendingEnrollments(filteredEnrollments);
        } else {
          setPendingAttendance([]);
          setPendingEnrollments([]);
        }
      } catch (error) {
        console.error('Failed to fetch instructor data:', error);
        if (axios.isAxiosError(error)) {
          console.error('Error details:', error.response?.data);
          console.error('Error status:', error.response?.status);

          if (error.code === 'ECONNABORTED') {
            setError('The server is taking longer than expected to respond. It may be waking up from sleep. Please wait a moment and try refreshing the page.');
          } else {
            setError(error.response?.data?.message || 'Failed to load dashboard data. Please try again.');
          }
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();

    return () => {
      // Cleanup: abort any pending requests on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Memoized: Total students across all teaching classes
  const totalStudents = useMemo(() => {
    if (!teachingClasses || teachingClasses.length === 0) return 0;
    return teachingClasses.reduce((sum: number, cls: any) => sum + (cls._count?.enrollments || 0), 0);
  }, [teachingClasses]);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Memoized: Recent activities computed from pending data
  const recentActivities = useMemo(() => {
    const attendanceActivities = (pendingAttendance || [])
      .filter((attendance: any) => attendance.student?.user && attendance.class)
      .map((attendance: any) => ({
        id: `att-${attendance.id}`,
        user: {
          name: `${attendance.student.user.firstName} ${attendance.student.user.lastName}`
        },
        action: 'marked attendance for',
        target: attendance.class.name,
        time: new Date(attendance.date).toISOString(),
        type: 'attendance' as const,
        status: attendance.status
      }));

    const enrollmentActivities = (pendingEnrollments || [])
      .filter((enrollment: any) => enrollment.student?.user && enrollment.class)
      .map((enrollment: any) => ({
        id: `enr-${enrollment.id}`,
        user: {
          name: `${enrollment.student.user.firstName} ${enrollment.student.user.lastName}`
        },
        action: 'requested enrollment in',
        target: enrollment.class.name,
        time: new Date(enrollment.enrolledAt).toISOString(),
        type: 'enrollment' as const,
        status: enrollment.status
      }));

    return [...attendanceActivities, ...enrollmentActivities]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 2)
      .map(activity => ({
        ...activity,
        time: getRelativeTime(activity.time)
      }));
  }, [pendingAttendance, pendingEnrollments]);

  const handleApproveAttendance = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/attendance/${id}/approve`,
        { status: 'APPROVED' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingAttendance(prev => prev.filter(a => a.id !== id));
      toast.success('Attendance approved!', {
        description: 'Student attendance has been confirmed',
      });
    } catch (error: any) {
      console.error('Failed to approve attendance:', error);
      toast.error('Failed to approve attendance', {
        description: error.response?.data?.message || 'Please try again',
      });
    }
  };

  const handleRejectAttendance = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/attendance/${id}/approve`,
        { status: 'REJECTED', rejectionReason: 'Not approved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingAttendance(prev => prev.filter(a => a.id !== id));
      toast.success('Attendance rejected', {
        description: 'The attendance request has been rejected',
      });
    } catch (error: any) {
      console.error('Failed to reject attendance:', error);
      toast.error('Failed to reject attendance', {
        description: error.response?.data?.message || 'Please try again',
      });
    }
  };

  const handleApproveEnrollment = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/enrollments/${id}/approve`,
        { status: 'APPROVED' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingEnrollments(prev => prev.filter(e => e.id !== id));
      toast.success('Enrollment approved!', {
        description: 'Student can now access the class',
      });
      // totalStudents will auto-update via useMemo when classes data refreshes
    } catch (error: any) {
      console.error('Failed to approve enrollment:', error);
      toast.error('Failed to approve enrollment', {
        description: error.response?.data?.message || 'Please try again',
      });
    }
  };

  const handleRejectEnrollment = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/enrollments/${id}/approve`,
        { status: 'REJECTED', rejectionReason: 'Not approved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingEnrollments(prev => prev.filter(e => e.id !== id));
      toast.success('Enrollment rejected', {
        description: 'The enrollment request has been declined',
      });
    } catch (error: any) {
      console.error('Failed to reject enrollment:', error);
      toast.error('Failed to reject enrollment', {
        description: error.response?.data?.message || 'Please try again',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full border-destructive">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Failed to Load Dashboard
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {error}
                </p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Pending Approval Message */}
      {instructorProfile?.approvalStatus === 'PENDING' && (
        <Card className="border-amber-500 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Clock className="h-8 w-8 text-amber-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">
                  Account Pending Approval
                </h3>
                <p className="text-amber-800 mb-4">
                  Your instructor account has been created successfully and is currently pending approval from the administrator.
                  You will receive full access to your dashboard once your account has been approved.
                </p>
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <Bell className="h-4 w-4" />
                  <span>You will be notified once your account is approved.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Only show dashboard content if approved */}
      {instructorProfile?.approvalStatus === 'APPROVED' && (
        <>
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Good morning, {user?.firstName}!
              </h1>
              <p className="text-muted-foreground mt-1">
                All you need to Manage your classes in one place. lets make Impact
              </p>
            </div>
            <Button variant="church" className="self-start">
              <Calendar className="mr-2 h-4 w-4" />
              View Full Schedule
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Classes Teaching"
              value={loading ? '...' : teachingClasses.length.toString()}
              change={`${teachingClasses.length} active classes`}
              changeType="neutral"
              icon={BookOpen}
              iconColor="text-blue-600"
            />
            <StatCard
              title="Total Students"
              value={loading ? '...' : totalStudents.toString()}
              change="Across all classes"
              changeType="neutral"
              icon={Users}
              iconColor="text-purple-600"
            />
            <StatCard
              title="Pending Attendance"
              value={loading ? '...' : pendingAttendance.length.toString()}
              change="Awaiting approval"
              changeType="negative"
              icon={ClipboardCheck}
              iconColor="text-amber-600"
            />
            <StatCard
              title="Pending Enrollments"
              value={loading ? '...' : pendingEnrollments.length.toString()}
              change="New requests"
              changeType="neutral"
              icon={Bell}
              iconColor="text-green-600"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* My Teaching Classes */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">My Teaching Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                      <p className="text-sm text-muted-foreground">Loading your classes...</p>
                    </div>
                  ) : teachingClasses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                        <BookOpenCheck className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">No Classes Yet</h3>
                      <p className="text-sm text-muted-foreground text-center max-w-sm">You don't have any classes assigned yet. Contact the administrator to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teachingClasses.map((classItem, index) => (
                        <div
                          key={classItem.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                              {classItem.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">{classItem.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {classItem._count?.enrollments || 0} / {classItem.maxCapacity} students
                                {classItem.schedule?.time && ` • ${classItem.schedule.time}`}
                              </p>
                              <Badge
                                variant="secondary"
                                className={classItem.status === 'ACTIVE' ? 'bg-green-100 text-green-700 mt-1' : 'mt-1'}
                              >
                                {classItem.status}
                              </Badge>
                            </div>
                          </div>

                          {classItem.status === 'ACTIVE' && (
                            <Button
                              variant="church"
                              size="sm"
                              onClick={() => navigate(`/canvas/${classItem.id}`)}
                            >
                              Go to Class
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Attendance Approvals */}
              <Card className="shadow-card">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Pending Attendance Approvals</CardTitle>
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    {pendingAttendance.length} pending
                  </Badge>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                      <p className="text-sm text-muted-foreground">Loading attendance...</p>
                    </div>
                  ) : pendingAttendance.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
                        <Check className="h-7 w-7 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">All Caught Up!</h4>
                      <p className="text-sm text-muted-foreground text-center">No pending attendance to review</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingAttendance.slice(0, 5).map((attendance) => (
                        <div key={attendance.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {attendance.student.user.firstName.charAt(0)}{attendance.student.user.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">
                                {attendance.student.user.firstName} {attendance.student.user.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(attendance.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleApproveAttendance(attendance.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive hover:bg-destructive/10"
                              onClick={() => handleRejectAttendance(attendance.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Enrollment Requests */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">Enrollment Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                      <p className="text-sm text-muted-foreground">Loading requests...</p>
                    </div>
                  ) : pendingEnrollments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                        <UserCheck className="h-7 w-7 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">All Set!</h4>
                      <p className="text-sm text-muted-foreground text-center">No enrollment requests at the moment</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingEnrollments.slice(0, 5).map((enrollment) => (
                        <div key={enrollment.id} className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-accent/10 text-accent text-sm font-semibold">
                                {enrollment.student.user.firstName.charAt(0)}{enrollment.student.user.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground text-sm">
                                {enrollment.student.user.firstName} {enrollment.student.user.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{enrollment.student.user.email}</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Requesting to join <span className="font-medium text-foreground">{enrollment.class.name}</span>
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="flex-1 h-8"
                              onClick={() => handleApproveEnrollment(enrollment.id)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-8"
                              onClick={() => handleRejectEnrollment(enrollment.id)}
                            >
                              Decline
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
        </>
      )}
    </div>
  );
}
