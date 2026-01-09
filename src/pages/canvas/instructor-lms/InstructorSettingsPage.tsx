import { Card, CardContent } from '@/components/ui/card';
import { Settings } from 'lucide-react';

interface InstructorSettingsPageProps {
  classId: string;
  classData: any;
  onUpdate: () => void;
}

export default function InstructorSettingsPage({ classId, classData, onUpdate }: InstructorSettingsPageProps) {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Class Settings</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Settings className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Class Settings</h3>
          <p className="text-gray-600">Manage class settings and preferences</p>
        </CardContent>
      </Card>
    </div>
  );
}
