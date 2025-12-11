import { Users, GraduationCap, BookOpen, ClipboardCheck, Clock, UserCheck } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard';
import { TodayClassesCard } from '@/components/dashboard/TodayClassesCard';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { PendingApprovalsCard } from '@/components/dashboard/PendingApprovalsCard';
import { useAuth } from '@/contexts/AuthContext';

const mockActivities = [
  {
    id: '1',
    user: { name: 'Sarah Johnson' },
    action: 'enrolled in',
    target: 'Tailoring Basics',
    time: '5 minutes ago',
    type: 'enrollment' as const,
  },
  {
    id: '2',
    user: { name: 'Michael Chen' },
    action: 'marked attendance for',
    target: 'Cooking Class',
    time: '15 minutes ago',
    type: 'attendance' as const,
  },
  {
    id: '3',
    user: { name: 'Admin' },
    action: 'approved instructor',
    target: 'David Williams',
    time: '1 hour ago',
    type: 'approval' as const,
  },
  {
    id: '4',
    user: { name: 'Emily Brown' },
    action: 'created new class',
    target: 'Music Theory 101',
    time: '2 hours ago',
    type: 'class' as const,
  },
];

const mockClasses = [
  {
    id: '1',
    name: 'Tailoring & Fashion Design',
    instructor: { name: 'Mary Johnson' },
    time: '9:00 AM - 11:00 AM',
    location: 'Room A1',
    enrolled: 18,
    capacity: 20,
    status: 'ongoing' as const,
  },
  {
    id: '2',
    name: 'Culinary Arts Basics',
    instructor: { name: 'Chef Roberts' },
    time: '11:30 AM - 1:00 PM',
    location: 'Kitchen Hall',
    enrolled: 15,
    capacity: 15,
    status: 'upcoming' as const,
  },
  {
    id: '3',
    name: 'Music & Choir Training',
    instructor: { name: 'David Williams' },
    time: '2:00 PM - 4:00 PM',
    location: 'Music Room',
    enrolled: 22,
    capacity: 25,
    status: 'upcoming' as const,
  },
];

const mockPendingApprovals = [
  {
    id: '1',
    user: { name: 'James Wilson', email: 'james@example.com' },
    type: 'instructor' as const,
    details: 'Requesting to teach Photography classes',
    requestedAt: '2 hours ago',
  },
  {
    id: '2',
    user: { name: 'Lisa Anderson', email: 'lisa@example.com' },
    type: 'enrollment' as const,
    details: 'Wants to join Tailoring & Fashion Design',
    requestedAt: '3 hours ago',
  },
  {
    id: '3',
    user: { name: 'Robert Taylor', email: 'robert@example.com' },
    type: 'attendance' as const,
    details: 'Attendance request for Cooking Class',
    requestedAt: '4 hours ago',
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening at the training center today.
          </p>
        </div>
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

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value="324"
          change="+12% from last month"
          changeType="positive"
          icon={Users}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Instructors"
          value="28"
          change="+3 new this month"
          changeType="positive"
          icon={GraduationCap}
          iconColor="text-accent"
        />
        <StatCard
          title="Active Classes"
          value="15"
          change="5 classes today"
          changeType="neutral"
          icon={BookOpen}
          iconColor="text-green-600"
        />
        <StatCard
          title="Pending Approvals"
          value="8"
          change="Requires attention"
          changeType="negative"
          icon={UserCheck}
          iconColor="text-amber-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <AttendanceChart />
          <TodayClassesCard classes={mockClasses} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <PendingApprovalsCard items={mockPendingApprovals} />
          <RecentActivityCard activities={mockActivities} />
        </div>
      </div>
    </div>
  );
}
