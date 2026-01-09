import { useState, useEffect } from 'react';
import { Plus, BookOpen, Video, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { lessonApi } from '@/utils/canvas-api';
import type { Lesson } from '@/types/canvas';
import { LessonDetail } from './LessonDetail';
import { CreateLessonDialog } from './CreateLessonDialog';
import { useToast } from '@/hooks/use-toast';

interface LessonListProps {
  classId: string;
}

export function LessonList({ classId }: LessonListProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLessons();
  }, [classId]);

  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      const data = await lessonApi.getByClass(classId);
      setLessons(data.sort((a, b) => a.weekNumber - b.weekNumber));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch lessons',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleLessonCreated = () => {
    setShowCreateDialog(false);
    fetchLessons();
  };

  if (selectedLesson) {
    return (
      <LessonDetail
        lesson={selectedLesson}
        onBack={() => setSelectedLesson(null)}
        onUpdate={fetchLessons}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Weekly Lessons</h3>
        <Button onClick={() => setShowCreateDialog(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Lesson
        </Button>
      </div>

      {/* Lessons Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No lessons yet</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Lesson
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <Card
              key={lesson.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleLessonClick(lesson)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Week {lesson.weekNumber}</Badge>
                      {lesson.published ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Draft
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{lesson.title}</CardTitle>
                    {lesson.description && (
                      <CardDescription className="line-clamp-2 mt-2">
                        {lesson.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lesson.videoUrl && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      Video
                    </Badge>
                  )}
                  {lesson.content && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Content
                    </Badge>
                  )}
                  {lesson.attachments && lesson.attachments.length > 0 && (
                    <Badge variant="outline">
                      {lesson.attachments.length} Attachment{lesson.attachments.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Lesson Dialog */}
      <CreateLessonDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        classId={classId}
        onSuccess={handleLessonCreated}
      />
    </div>
  );
}
