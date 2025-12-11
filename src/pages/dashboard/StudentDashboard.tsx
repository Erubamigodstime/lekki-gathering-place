import { BookOpen, Calendar, ClipboardCheck, Star, Clock, CheckCircle } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

const mockSchedule = [
  {
    id: '1',
    name: 'Tailoring & Fashion Design',
    instructor: 'Mary Johnson',
    time: '9:00 AM - 11:00 AM',
    day: 'Today',
    status: 'upcoming',
    attendanceMarked: false,
  },
  {
    id: '2',
    name: 'Culinary Arts Basics',
    instructor: 'Chef Roberts',
    time: '2:00 PM - 4:00 PM',
    day: 'Today',
    status: 'upcoming',
    attendanceMarked: false,
  },
  {
    id: '3',
    name: 'Music & Choir Training',
    instructor: 'David Williams',
    time: '10:00 AM - 12:00 PM',
    day: 'Tomorrow',
    status: 'scheduled',
    attendanceMarked: false,
  },
];

const mockRecommendedClasses = [
  {
    id: '1',
    name: 'Photography Basics',
    instructor: 'James Wilson',
    schedule: 'Mon, Wed, Fri • 3:00 PM',
    enrolled: 12,
    capacity: 20,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Web Development',
    instructor: 'Tech Lead Sarah',
    schedule: 'Tue, Thu • 5:00 PM',
    enrolled: 8,
    capacity: 15,
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Art & Painting',
    instructor: 'Artist Emily',
    schedule: 'Saturday • 10:00 AM',
    enrolled: 15,
    capacity: 18,
    rating: 4.7,
  },
];

const mockAttendanceHistory = [
  { date: 'Dec 9', status: 'present' },
  { date: 'Dec 8', status: 'present' },
  { date: 'Dec 7', status: 'absent' },
  { date: 'Dec 6', status: 'present' },
  { date: 'Dec 5', status: 'present' },
  { date: 'Dec 4', status: 'present' },
  { date: 'Dec 3', status: 'pending' },
];

export default function StudentDashboard() {
  const { user } = useAuth();

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
        <Button variant="gold" className="self-start">
          <BookOpen className="mr-2 h-4 w-4" />
          Browse New Classes
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Enrolled Classes"
          value="3"
          change="Active enrollments"
          changeType="neutral"
          icon={BookOpen}
          iconColor="text-primary"
        />
        <StatCard
          title="Classes This Week"
          value="6"
          change="2 classes today"
          changeType="neutral"
          icon={Calendar}
          iconColor="text-accent"
        />
        <StatCard
          title="Attendance Rate"
          value="92%"
          change="+5% from last month"
          changeType="positive"
          icon={ClipboardCheck}
          iconColor="text-green-600"
        />
        <StatCard
          title="Pending Approvals"
          value="1"
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
          {/* My Schedule */}
          <Card className="shadow-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">My Class Schedule</CardTitle>
              <Button variant="ghost" className="text-primary text-sm">View Full Calendar</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSchedule.map((classItem, index) => (
                  <div 
                    key={classItem.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                        {classItem.day === 'Today' ? 'T' : 'TM'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{classItem.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {classItem.instructor} • {classItem.time}
                        </p>
                        <Badge 
                          variant="secondary" 
                          className={classItem.day === 'Today' ? 'bg-green-100 text-green-700 mt-1' : 'mt-1'}
                        >
                          {classItem.day}
                        </Badge>
                      </div>
                    </div>
                    
                    {classItem.day === 'Today' && !classItem.attendanceMarked && (
                      <Button variant="gold" size="sm">
                        Mark Attendance
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Classes */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Recommended For You</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {mockRecommendedClasses.map((classItem, index) => (
                  <div 
                    key={classItem.id}
                    className="p-4 rounded-xl border border-border hover:border-primary/50 hover:shadow-card transition-all cursor-pointer animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-accent fill-accent" />
                      <span className="text-sm font-medium text-foreground">{classItem.rating}</span>
                    </div>
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
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Attendance Calendar */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAttendanceHistory.map((day, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">{day.date}</span>
                    <Badge 
                      variant="secondary"
                      className={
                        day.status === 'present' 
                          ? 'bg-green-100 text-green-700' 
                          : day.status === 'absent'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                      }
                    >
                      {day.status === 'present' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {day.status.charAt(0).toUpperCase() + day.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Monthly Progress</span>
                  <span className="font-medium text-foreground">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse All Classes
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                View Full Schedule
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Mark Today's Attendance
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
