import { useAuth } from '@/contexts/AuthContext';
import AdminStudentsPage from './StudentsPage';
import InstructorStudentsPage from './InstructorStudentsPage';

export default function StudentsPageRouter() {
  const { user } = useAuth();

  if (user?.role?.toLowerCase() === 'instructor') {
    return <InstructorStudentsPage />;
  }

  return <AdminStudentsPage />;
}
