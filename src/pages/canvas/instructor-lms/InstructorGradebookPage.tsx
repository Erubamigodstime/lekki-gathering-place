import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

interface InstructorGradebookPageProps {
  classId: string;
}

export default function InstructorGradebookPage({ classId }: InstructorGradebookPageProps) {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Gradebook</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <GraduationCap className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Gradebook</h3>
          <p className="text-gray-600">View and manage student grades</p>
        </CardContent>
      </Card>
    </div>
  );
}
