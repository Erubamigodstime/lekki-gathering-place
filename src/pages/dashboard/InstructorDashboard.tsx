import { BookOpen, Users, ClipboardCheck, Calendar, Clock, Bell } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { TodayClassesCard } from '@/components/dashboard/TodayClassesCard';
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

const mockTeachingClasses = [
  {
    id: '1',
    name: 'Tailoring & Fashion Design',
    instructor: { name: 'You' },
    time: '9:00 AM - 11:00 AM',
    location: 'Room A1',
    enrolled: 18,
    capacity: 20,
    status: 'ongoing' as const,
  },
  {
    id: '2',
    name: 'Advanced Sewing Techniques',
    instructor: { name: 'You' },
    time: '2:00 PM - 4:00 PM',
    location: 'Room A1',
    enrolled: 12,
    capacity: 15,
    status: 'upcoming' as const,
  },
];

const mockPendingAttendance = [
  { id: '1', student: 'John Smith', class: 'Tailoring Basics', date: 'Today, 9:00 AM' },
  { id: '2', student: 'Mary Johnson', class: 'Tailoring Basics', date: 'Today, 9:00 AM' },
  { id: '3', student: 'David Lee', class: 'Tailoring Basics', date: 'Today, 9:00 AM' },
];

const mockEnrollmentRequests = [
  { id: '1', student: 'Sarah Wilson', class: 'Advanced Sewing', ward: 'Central Ward' },
  { id: '2', student: 'Michael Brown', class: 'Tailoring Basics', ward: 'North Ward' },
];

const mockActivities = [
  {
    id: '1',
    user: { name: 'John Smith' },
    action: 'marked attendance for',
    target: 'Tailoring Basics',
    time: '10 minutes ago',
    type: 'attendance' as const,
  },
  {
    id: '2',
    user: { name: 'Sarah Wilson' },
    action: 'requested enrollment in',
    target: 'Advanced Sewing',
    time: '1 hour ago',
    type: 'enrollment' as const,
  },
];

export default function InstructorDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Good morning, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            You have 2 classes scheduled for today. Let's make an impact!
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
          value="4"
          change="2 classes today"
          changeType="neutral"
          icon={BookOpen}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Students"
          value="56"
          change="+8 this month"
          changeType="positive"
          icon={Users}
          iconColor="text-accent"
        />
        <StatCard
          title="Pending Attendance"
          value="3"
          change="Needs approval"
          changeType="negative"
          icon={ClipboardCheck}
          iconColor="text-amber-500"
        />
        <StatCard
          title="Enrollment Requests"
          value="2"
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
          <TodayClassesCard classes={mockTeachingClasses} />
          
          {/* Pending Attendance Approvals */}
          <Card className="shadow-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Pending Attendance Approvals</CardTitle>
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                {mockPendingAttendance.length} pending
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPendingAttendance.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {item.student.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{item.student}</p>
                        <p className="text-sm text-muted-foreground">{item.class} • {item.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="space-y-3">
                {mockEnrollmentRequests.map((request) => (
                  <div key={request.id} className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-accent/10 text-accent text-sm font-semibold">
                          {request.student.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">{request.student}</p>
                        <p className="text-xs text-muted-foreground">{request.ward}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Requesting to join <span className="font-medium text-foreground">{request.class}</span>
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" className="flex-1 h-8">
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 h-8">
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <RecentActivityCard activities={mockActivities} />
        </div>
      </div>
    </div>
  );
}
