import { useAuth } from '@/contexts/AuthContext';
import AdminStudentsPage from './StudentsPage';
import InstructorStudentsPage from './InstructorStudentsPage';
import { Loader2 } from 'lucide-react';

export default function StudentsPageRouter() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user?.role?.toLowerCase() === 'instructor') {
    return <InstructorStudentsPage />;
  }

  return <AdminStudentsPage />;
}
