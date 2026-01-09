import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { assignmentApi, lessonApi } from '@/utils/canvas-api';
import type { Lesson } from '@/types/canvas';

const assignmentSchema = z.object({
  lessonId: z.string().min(1, 'Lesson is required'),
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  type: z.enum(['HOMEWORK', 'QUIZ', 'PROJECT', 'EXAM']),
  dueDate: z.string().min(1, 'Due date is required'),
  maxPoints: z.number().min(1).max(1000),
  allowLateSubmission: z.boolean(),
  lateSubmissionPenalty: z.number().min(0).max(100).optional(),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface CreateAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  onSuccess: () => void;
}

export function CreateAssignmentDialog({
  open,
  onOpenChange,
  classId,
  onSuccess,
}: CreateAssignmentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [allowLate, setAllowLate] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      allowLateSubmission: false,
      lateSubmissionPenalty: 10,
    },
  });

  // Fetch lessons when dialog opens
  useState(() => {
    if (open) {
      lessonApi.getByClass(classId).then(setLessons).catch(console.error);
    }
  });

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      setIsLoading(true);
      await assignmentApi.create({
        lessonId: data.lessonId,
        title: data.title,
        description: data.description,
        type: data.type,
        dueDate: data.dueDate,
        maxPoints: data.maxPoints,
        allowLateSubmission: data.allowLateSubmission || false,
        lateSubmissionPenalty: data.allowLateSubmission ? data.lateSubmissionPenalty : undefined,
      });
      
      toast({
        title: 'Success',
        description: 'Assignment created successfully',
      });
      reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create assignment',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogDescription>
            Add a new assignment for your students
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lessonId">Lesson *</Label>
            <Select onValueChange={(value) => setValue('lessonId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select lesson" />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    Week {lesson.weekNumber}: {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.lessonId && (
              <p className="text-sm text-destructive">{errors.lessonId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Week 1 Assignment: Introduction"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Detailed assignment instructions..."
              rows={5}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Assignment Type *</Label>
              <Select onValueChange={(value: any) => setValue('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOMEWORK">Homework</SelectItem>
                  <SelectItem value="QUIZ">Quiz</SelectItem>
                  <SelectItem value="PROJECT">Project</SelectItem>
                  <SelectItem value="EXAM">Exam</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPoints">Max Points *</Label>
              <Input
                id="maxPoints"
                type="number"
                {...register('maxPoints', { valueAsNumber: true })}
                placeholder="100"
              />
              {errors.maxPoints && (
                <p className="text-sm text-destructive">{errors.maxPoints.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              {...register('dueDate')}
            />
            {errors.dueDate && (
              <p className="text-sm text-destructive">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowLate">Allow Late Submissions</Label>
                <p className="text-sm text-muted-foreground">
                  Students can submit after the due date
                </p>
              </div>
              <Switch
                id="allowLate"
                checked={allowLate}
                onCheckedChange={(checked) => {
                  setAllowLate(checked);
                  setValue('allowLateSubmission', checked);
                }}
              />
            </div>

            {allowLate && (
              <div className="space-y-2">
                <Label htmlFor="lateSubmissionPenalty">Late Penalty (%)</Label>
                <Input
                  id="lateSubmissionPenalty"
                  type="number"
                  {...register('lateSubmissionPenalty', { valueAsNumber: true })}
                  placeholder="10"
                  min="0"
                  max="100"
                />
                {errors.lateSubmissionPenalty && (
                  <p className="text-sm text-destructive">
                    {errors.lateSubmissionPenalty.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Assignment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
