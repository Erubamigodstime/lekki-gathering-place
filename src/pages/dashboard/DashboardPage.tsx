import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import InstructorDashboard from './InstructorDashboard';
import StudentDashboard from './StudentDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'instructor':
      return <InstructorDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <StudentDashboard />;
  }
}
