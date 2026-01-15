import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'react-router-dom';
import CanvasLMS from './CanvasLMS';
import InstructorCanvasLMS from './InstructorCanvasLMS';
import { Loader2 } from 'lucide-react';

export default function CanvasRouter() {
  const { user, loading } = useAuth();
  const { classId } = useParams<{ classId: string }>();

  console.log('CanvasRouter - User:', user);
  console.log('CanvasRouter - Loading:', loading);
  console.log('CanvasRouter - Role:', user?.role);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show instructor canvas if user is an instructor
  if (user?.role?.toUpperCase() === 'INSTRUCTOR') {
    console.log('Routing to InstructorCanvasLMS');
    return <InstructorCanvasLMS />;
  }

  // Show student canvas for students and other roles
  console.log('Routing to Student CanvasLMS');
  return <CanvasLMS />;
}


