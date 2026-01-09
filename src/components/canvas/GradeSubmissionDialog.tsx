import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { gradeApi } from '@/utils/canvas-api';
import type { Submission } from '@/types/canvas';

const gradeSchema = z.object({
  score: z.number().min(0),
  feedback: z.string().optional(),
});

type GradeFormData = z.infer<typeof gradeSchema>;

interface GradeSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: Submission;
  maxPoints: number;
  onSuccess: () => void;
}

export function GradeSubmissionDialog({
  open,
  onOpenChange,
  submission,
  maxPoints,
  onSuccess,
}: GradeSubmissionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      score: submission.grade?.score || 0,
      feedback: submission.grade?.feedback || '',
    },
  });

  const score = watch('score');
  const percentage = maxPoints > 0 ? (score / maxPoints) * 100 : 0;

  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const onSubmit = async (data: GradeFormData) => {
    try {
      setIsLoading(true);

      if (submission.grade) {
        // Update existing grade
        await gradeApi.update(submission.grade.id, {
          score: data.score,
          feedback: data.feedback,
        });
      } else {
        // Create new grade
        await gradeApi.create({
          submissionId: submission.id,
          score: data.score,
          feedback: data.feedback,
        });
      }

      toast({
        title: 'Success',
        description: 'Grade saved successfully',
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save grade',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsLoading(true);
      if (submission.grade) {
        await gradeApi.publish(submission.grade.id);
        toast({
          title: 'Success',
          description: 'Grade published to student',
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to publish grade',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grade Submission</DialogTitle>
          <DialogDescription>
            Student: {submission.student?.firstName} {submission.student?.lastName}
          </DialogDescription>
        </DialogHeader>

        {/* Submission Content */}
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <h4 className="font-semibold mb-2">Student's Submission:</h4>
            {submission.content && (
              <p className="text-sm whitespace-pre-wrap mb-2">{submission.content}</p>
            )}
            {submission.submissionUrl && (
              <a
                href={submission.submissionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                View Submission Link →
              </a>
            )}
            {submission.attachments && submission.attachments.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Attachments:</p>
                {submission.attachments.map((attachment, index) => (
                  <Badge key={index} variant="outline" className="mr-2">
                    {attachment}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Grading Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="score">Score (Points) *</Label>
                <Input
                  id="score"
                  type="number"
                  {...register('score', { valueAsNumber: true })}
                  min="0"
                  max={maxPoints}
                  step="0.5"
                />
                {errors.score && (
                  <p className="text-sm text-destructive">{errors.score.message}</p>
                )}
                <p className="text-sm text-muted-foreground">Max: {maxPoints}</p>
              </div>

              <div className="space-y-2">
                <Label>Percentage</Label>
                <div className="h-10 flex items-center px-3 border rounded-md bg-muted">
                  <span className="text-2xl font-bold">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Letter Grade</Label>
                <div className="h-10 flex items-center justify-center border rounded-md bg-muted">
                  <Badge
                    variant={percentage >= 60 ? 'default' : 'destructive'}
                    className="text-xl px-4 py-1"
                  >
                    {getLetterGrade(percentage)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                {...register('feedback')}
                placeholder="Provide feedback to the student..."
                rows={6}
              />
            </div>

            {submission.grade?.status === 'PUBLISHED' && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  This grade is published and visible to the student.
                </AlertDescription>
              </Alert>
            )}

            {submission.grade?.status === 'DRAFT' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This grade is saved but not yet published to the student.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="secondary" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save as Draft'}
              </Button>
              {submission.grade && submission.grade.status !== 'PUBLISHED' && (
                <Button
                  type="button"
                  onClick={handlePublish}
                  disabled={isLoading}
                >
                  Publish Grade
                </Button>
              )}
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
