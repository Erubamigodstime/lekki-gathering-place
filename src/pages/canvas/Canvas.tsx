import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ClipboardList, MessageSquare, Award, ArrowLeft, Users, History } from 'lucide-react';
import { LessonList } from '@/components/canvas/LessonList';
import { AssignmentList } from '@/components/canvas/AssignmentList';
import { MessageList } from '@/components/canvas/MessageList';
import { CertificateView } from '@/components/canvas/CertificateView';
import { PeopleList } from '@/components/canvas/PeopleList';
import { HistoryView } from '@/components/canvas/HistoryView';

export default function CanvasPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lessons');
  const [classInfo, setClassInfo] = useState<any>(null);
  
  // TODO: Get actual user role and ID from auth context
  const userRole = 'INSTRUCTOR' as 'STUDENT' | 'INSTRUCTOR'; // Default to INSTRUCTOR for testing
  const userId = localStorage.getItem('userId') || 'current-user-id'; // Get from auth

  useEffect(() => {
    // Fetch class information
    // This would come from your existing class API
    // setClassInfo(fetchedData);
  }, [classId]);

  if (!classId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No class selected</p>
            <Button onClick={() => navigate('/classes')}>View Classes</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/classes')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Canvas LMS</h1>
            <p className="text-muted-foreground">
              {classInfo?.name || 'Loading class...'}
            </p>
          </div>
        </div>
      </div>

      {/* Canvas Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="lessons" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Lessons</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span>Assignments</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
          </TabsTrigger>
          <TabsTrigger value="people" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>People</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>Certificates</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Lessons</CardTitle>
              <CardDescription>
                View and manage weekly lessons for this class
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LessonList classId={classId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
              <CardDescription>
                Complete assignments and track your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssignmentList classId={classId} userRole={userRole} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Messages</CardTitle>
              <CardDescription>
                Communicate with instructors and classmates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageList classId={classId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="people" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Members</CardTitle>
              <CardDescription>
                View all students and instructors in this class
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PeopleList classId={classId} userRole={userRole} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course History</CardTitle>
              <CardDescription>
                View your past and completed courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HistoryView userId={userId} userRole={userRole} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
              <CardDescription>
                View and download your course completion certificates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CertificateView classId={classId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
