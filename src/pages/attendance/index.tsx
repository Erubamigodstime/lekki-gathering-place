import { useAuth } from '@/contexts/AuthContext';
import AdminAttendancePage from './AttendancePage';
import InstructorAttendancePage from './InstructorAttendancePage';

export default function AttendancePageRouter() {
  const { user } = useAuth();

  if (user?.role?.toLowerCase() === 'instructor') {
    return <InstructorAttendancePage />;
  }

  return <AdminAttendancePage />;
}
