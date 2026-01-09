import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface InstructorPeoplePageProps {
  classId: string;
}

export default function InstructorPeoplePage({ classId }: InstructorPeoplePageProps) {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Students</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Management</h3>
          <p className="text-gray-600">View and manage enrolled students</p>
        </CardContent>
      </Card>
    </div>
  );
}
