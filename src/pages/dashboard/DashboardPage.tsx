import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import InstructorDashboard from './InstructorDashboard';
import StudentDashboard from './StudentDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  switch (user?.role?.toUpperCase()) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'INSTRUCTOR':
      return <InstructorDashboard />;
    case 'STUDENT':
      return <StudentDashboard />;
    default:
      return <StudentDashboard />;
  }
}
