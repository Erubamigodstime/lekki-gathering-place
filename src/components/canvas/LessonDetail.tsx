import { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Eye, EyeOff, Video, FileText, Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Lesson } from '@/types/canvas';
import { lessonApi } from '@/utils/canvas-api';
import { useToast } from '@/hooks/use-toast';

interface LessonDetailProps {
  lesson: Lesson;
  onBack: () => void;
  onUpdate: () => void;
  userRole?: 'STUDENT' | 'INSTRUCTOR';
  isCompleted?: boolean;
}

export function LessonDetail({ lesson, onBack, onUpdate, userRole = 'STUDENT', isCompleted = false }: LessonDetailProps) {
  const { toast } = useToast();
  const [completed, setCompleted] = useState(isCompleted);

  const handlePublish = async () => {
    try {
      await lessonApi.publish(lesson.id);
      toast({
        title: 'Success',
        description: 'Lesson published successfully',
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to publish lesson',
        variant: 'destructive',
      });
    }
  };

  const handleUnpublish = async () => {
    try {
      await lessonApi.unpublish(lesson.id);
      toast({
        title: 'Success',
        description: 'Lesson unpublished successfully',
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to unpublish lesson',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await lessonApi.delete(lesson.id);
      toast({
        title: 'Success',
        description: 'Lesson deleted successfully',
      });
      onBack();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete lesson',
        variant: 'destructive',
      });
    }
  };

  const handleToggleComplete = async (checked: boolean) => {
    try {
      if (checked) {
        await lessonApi.markComplete(lesson.id);
        setCompleted(true);
        toast({
          title: 'Success',
          description: 'Lesson marked as complete',
        });
      } else {
        await lessonApi.markIncomplete(lesson.id);
        setCompleted(false);
        toast({
          title: 'Success',
          description: 'Lesson marked as incomplete',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update completion status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary">Week {lesson.weekNumber}</Badge>
              {lesson.published ? (
                <Badge variant="default">Published</Badge>
              ) : (
                <Badge variant="outline">Draft</Badge>
              )}
            </div>
            <h2 className="text-2xl font-bold">{lesson.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userRole === 'STUDENT' && (
            <div className="flex items-center gap-2 mr-4">
              <Checkbox
                id="lesson-complete"
                checked={completed}
                onCheckedChange={handleToggleComplete}
              />
              <label
                htmlFor="lesson-complete"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className={`h-4 w-4 ${completed ? 'text-green-600' : 'text-gray-400'}`} />
                Mark as Complete
              </label>
            </div>
          )}
          {userRole === 'INSTRUCTOR' && (
            <>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {lesson.published ? (
                <Button variant="outline" size="sm" onClick={handleUnpublish}>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Unpublish
                </Button>
              ) : (
                <Button variant="default" size="sm" onClick={handlePublish}>
                  <Eye className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this lesson? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6">
        {/* Description */}
        {lesson.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{lesson.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Video */}
        {lesson.videoUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <a 
                  href={lesson.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Open Video
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Text Content */}
        {lesson.content && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Lesson Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {lesson.content}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attachments */}
        {lesson.attachments && lesson.attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
              <CardDescription>
                {lesson.attachments.length} file{lesson.attachments.length > 1 ? 's' : ''} attached
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lesson.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{attachment}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
