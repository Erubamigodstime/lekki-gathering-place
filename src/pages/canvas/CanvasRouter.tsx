import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'react-router-dom';
import CanvasLMS from './CanvasLMS';
import InstructorCanvasLMS from './InstructorCanvasLMS';

export default function CanvasRouter() {
  const { user } = useAuth();
  const { classId } = useParams<{ classId: string }>();

  console.log('CanvasRouter - User:', user);
  console.log('CanvasRouter - Role:', user?.role);
  console.log('CanvasRouter - Role uppercase:', user?.role?.toUpperCase());

  // Show instructor canvas if user is an instructor
  if (user?.role?.toUpperCase() === 'INSTRUCTOR') {
    console.log('Routing to InstructorCanvasLMS');
    return <InstructorCanvasLMS />;
  }

  // Show student canvas for students and other roles
  console.log('Routing to Student CanvasLMS');
  return <CanvasLMS />;
}

