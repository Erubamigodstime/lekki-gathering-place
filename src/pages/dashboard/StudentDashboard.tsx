import { BookOpen, Calendar, ClipboardCheck, Star, Clock, CheckCircle, ArrowRight, Loader2, GraduationCap } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { StudentAttendanceCard } from '@/components/attendance';

// Enterprise Query & Mutation Hooks
import { 
  useMyClasses, 
  useMyAttendance, 
  useClasses,
  calculateAttendanceRate,
  getApprovedEnrollments,
} from '@/hooks/queries';
import { useMarkAttendance } from '@/hooks/mutations';

interface ClassSchedule {
  id: string;
  name: string;
  instructor: string;
  time: string;
  day: string;
  status: string;
  attendanceMarked: boolean;
  attendanceStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  attendanceId?: string;
}

interface RecommendedClass {
  id: string;
  name: string;
  instructor: string;
  schedule: string;
  enrolled: number;
  capacity: number;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  classId: string;
  class: {
    id: string;
    name: string;
  };
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Enterprise Query Hooks - Centralized Data Fetching
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useMyClasses();
  const { data: attendanceHistory = [], isLoading: attendanceLoading } = useMyAttendance();
  const { data: classesResponse } = useClasses({});
  
  // Extract array from paginated response
  const allClasses = classesResponse?.data || [];

  // Enterprise Mutation Hook
  const markAttendanceMutation = useMarkAttendance();

  const loading = enrollmentsLoading || attendanceLoading;

  // Use centralized helper for attendance calculation
  const attendanceRate = useMemo(() => 
    calculateAttendanceRate(attendanceHistory), 
    [attendanceHistory]
  );

  // Use centralized helper for approved enrollments
  const approvedEnrollments = useMemo(() => 
    getApprovedEnrollments(enrollments as any),
    [enrollments]
  );

  const pendingEnrollments = useMemo(() => 
    (enrollments as any[]).filter((e) => e.status === 'PENDING'),
    [enrollments]
  );

  // Build schedule from enrollments
  const schedule = useMemo(() => {
    const scheduleData: ClassSchedule[] = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    const todayName = dayNames[today];

    enrollments
      .filter((enrollment: any) => enrollment.status === 'APPROVED')
      .forEach((enrollment: any) => {
        const classData = enrollment.class;
        if (!classData || !classData.schedule?.days || classData.schedule.days.length === 0) {
          return;
        }

        classData.schedule.days.forEach((day: string) => {
          const dayIndex = dayNames.indexOf(day);
          if (dayIndex === today) {
            const instructorName = classData.instructor?.user
              ? `${classData.instructor.user.firstName || ''} ${classData.instructor.user.lastName || ''}`.trim()
              : 'TBD';

            // Check if attendance marked for today
            const todayAttendance = attendanceHistory.find((r: any) =>
              r.classId === classData.id &&
              new Date(r.date).toDateString() === new Date().toDateString()
            );

            scheduleData.push({
              id: classData.id,
              name: classData.name,
              instructor: instructorName,
              time: classData.schedule?.startTime || '9:00 AM',
              day: day,
              status: classData.status || 'ACTIVE',
              attendanceMarked: !!todayAttendance,
              attendanceStatus: todayAttendance?.status,
              attendanceId: todayAttendance?.id
            });
          }
        });
      });

    return scheduleData;
  }, [enrollments, attendanceHistory]);

  // Calculate recommended classes
  const recommendedClasses = useMemo(() => {
    const enrolledClassIds = (enrollments as any[]).map((e) => e.classId);
    return (allClasses as any[])
      .filter((cls) => !enrolledClassIds.includes(cls.id))
      .slice(0, 3)
      .map((cls) => ({
        id: cls.id,
        name: cls.name,
        instructor: cls.instructorName || 'TBD',
        schedule: cls.schedule?.days?.join(', ') || 'TBD',
        enrolled: cls._count?.enrollments || 0,
        capacity: cls.maxCapacity || 30
      }));
  }, [allClasses, enrollments]);

  // Mark attendance using mutation hook
  const handleMarkAttendance = async (classId: string) => {
    try {
      await markAttendanceMutation.mutateAsync({ lessonId: classId, classId });
      toast.success('Attendance marked successfully!', {
        description: 'Waiting for instructor approval',
      });
    } catch (error: any) {
      console.error('Failed to mark attendance:', error);
      toast.error('Failed to mark attendance', {
        description: error.response?.data?.message || 'Please try again',
      });
    }
  };

  // Early return if user is not loaded yet
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-church-gold mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Hello, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Keep up the great work! You're making progress in your skill journey.
          </p>
        </div>
        <Button variant="church" className="self-start" onClick={() => navigate('/classes')}>
          <BookOpen className="mr-2 h-4 w-4" />
          Browse New Classes
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Enrolled Classes"
          value={loading ? '...' : approvedEnrollments.length.toString()}
          change="Active enrollments"
          changeType="neutral"
          icon={BookOpen}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Enrollments"
          value={loading ? '...' : enrollments.length.toString()}
          change="All enrollment requests"
          changeType="neutral"
          icon={Calendar}
          iconColor="text-accent"
        />
        <StatCard
          title="Attendance Rate"
          value={attendanceHistory.length === 0 ? '--' : `${attendanceRate}%`}
          change={attendanceHistory.length === 0 ? 'No records yet' : 'Based on approved attendance'}
          changeType="neutral"
          icon={ClipboardCheck}
          iconColor="text-green-600"
        />
        <StatCard
          title="Pending Approvals"
          value={loading ? '...' : pendingEnrollments.length.toString()}
          change="Waiting for instructor"
          changeType="neutral"
          icon={Clock}
          iconColor="text-amber-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule with Attendance Marking */}
          {loading ? (
            <Card className="shadow-card border-l-4 border-l-church-gold">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-church-gold" />
                  Loading Schedule...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-church-gold mb-4" />
                  <p className="text-sm text-muted-foreground">Getting your classes...</p>
                </div>
              </CardContent>
            </Card>
          ) : schedule.length > 0 ? (
            <Card className="shadow-card border-l-4 border-l-church-gold">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-church-gold" />
                  {schedule[0]?.day || "Today"}'s Classes - Mark Your Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedule.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-church-gold to-yellow-600 flex items-center justify-center text-white font-bold shadow-lg">
                          {item.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.instructor} • {item.time}
                          </p>
                          {item.attendanceMarked && (
                            <Badge
                              variant="secondary"
                              className={
                                item.attendanceStatus === 'APPROVED'
                                  ? 'bg-green-100 text-green-700 mt-1'
                                  : item.attendanceStatus === 'REJECTED'
                                    ? 'bg-red-100 text-red-700 mt-1'
                                    : 'bg-yellow-100 text-yellow-700 mt-1 animate-pulse'
                              }
                            >
                              {item.attendanceStatus === 'APPROVED' && (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Attendance Approved
                                </>
                              )}
                              {item.attendanceStatus === 'REJECTED' && (
                                <>
                                  Rejected
                                </>
                              )}
                              {item.attendanceStatus === 'PENDING' && (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending Approval
                                </>
                              )}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {!item.attendanceMarked ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleMarkAttendance(item.id)}
                          className="bg-church-gold hover:bg-yellow-600 text-white"
                          disabled={markAttendanceMutation.isPending}
                        >
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          Mark Attendance
                        </Button>
                      ) : item.attendanceStatus === 'PENDING' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="border-yellow-500 text-yellow-600"
                        >
                          <Clock className="h-4 w-4 mr-2 animate-pulse" />
                          Pending
                        </Button>
                      ) : item.attendanceStatus === 'APPROVED' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="border-green-500 text-green-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approved
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-card border-l-4 border-l-slate-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  No Classes Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground mb-2">You don't have any classes scheduled for today</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date().getDay() === 4
                      ? "Today is Thursday - check back if you have Thursday classes"
                      : new Date().getDay() === 5
                        ? "Today is Friday - check back if you have Friday classes"
                        : "Classes are held on Thursdays and Fridays"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* My Enrolled Classes */}
          <Card className="shadow-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">My Enrolled Classes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">Loading your classes...</p>
                </div>
              ) : enrollments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <GraduationCap className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">No Classes Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">You haven't enrolled in any classes yet. Browse available classes to get started.</p>
                  <Button variant="church" onClick={() => navigate('/classes')}>
                    Browse Classes
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment, index) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                          {enrollment.class?.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{enrollment.class?.name || 'Class'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {enrollment.class?.instructor?.user
                              ? `${enrollment.class.instructor.user.firstName} ${enrollment.class.instructor.user.lastName}`
                              : 'Instructor TBD'}
                            {enrollment.class?.schedule?.days && ` • ${enrollment.class.schedule.days[0]}`}
                          </p>
                          <Badge
                            variant="secondary"
                            className={
                              enrollment.status === 'APPROVED'
                                ? 'bg-green-100 text-green-700 mt-1'
                                : enrollment.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-700 mt-1'
                                  : 'bg-red-100 text-red-700 mt-1'
                            }
                          >
                            {enrollment.status}
                          </Badge>
                        </div>
                      </div>

                      {enrollment.status === 'APPROVED' && enrollment.class?.id && (
                        <Button
                          variant="church"
                          size="sm"
                          onClick={() => navigate(`/canvas/${enrollment.class.id}`)}
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

          {/* Recommended Classes */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Recommended For You</CardTitle>
            </CardHeader>
            <CardContent>
              {recommendedClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                    <Star className="h-7 w-7 text-amber-600" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">No Recommendations</h4>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">We'll suggest classes based on your interests and enrollment history.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {recommendedClasses.map((classItem, index) => (
                    <div
                      key={classItem.id}
                      className="p-4 rounded-xl border border-border hover:border-primary/50 hover:shadow-card transition-all cursor-pointer animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => navigate('/classes')}
                    >
                      <h4 className="font-semibold text-foreground mb-1">{classItem.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{classItem.instructor}</p>
                      <p className="text-xs text-muted-foreground mb-3">{classItem.schedule}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {classItem.enrolled}/{classItem.capacity} enrolled
                        </span>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          Enroll
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
          {/* Class Attendance Calendar */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-church-blue" />
                My Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-church-blue mb-3" />
                  <p className="text-sm text-muted-foreground">Loading attendance...</p>
                </div>
              ) : approvedEnrollments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                    <ClipboardCheck className="h-7 w-7 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">No Classes Yet</h4>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Enroll in a class to start tracking your attendance.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedEnrollments.map((enrollment) => {
                    const classData = enrollment.class;
                    if (!classData) return null;

                    // Filter attendance records for this class
                    const classAttendance = attendanceHistory.filter(
                      (r) => r.classId === classData.id || r.class?.id === classData.id
                    );

                    return (
                      <StudentAttendanceCard
                        key={enrollment.id}
                        classInfo={{
                          id: classData.id,
                          name: classData.name,
                          schedule: classData.schedule,
                        }}
                        attendanceRecords={classAttendance}
                        onMarkAttendance={async (classId: string, date: Date) => {
                          await handleMarkAttendance(classId);
                        }}
                        loading={false}
                      />
                    );
                  })}
                </div>
              )}

              {/* Attendance Summary */}
              {attendanceHistory.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Overall Attendance Rate</span>
                    <span className="font-medium text-foreground">{attendanceRate}%</span>
                  </div>
                  <Progress value={attendanceRate} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/classes')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Browse All Classes
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/student')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                View My Enrollments
              </Button>
              {schedule.length > 0 && (
                <div className="pt-2 px-2 text-xs text-muted-foreground">
                  💡 You have {schedule.length} class(es) today.
                  Mark attendance above!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
