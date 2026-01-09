import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submissionApi } from '@/utils/canvas-api';
import type { Assignment, Submission } from '@/types/canvas';

const submissionSchema = z.object({
  content: z.string().min(10, 'Content must be at least 10 characters').optional(),
  submissionUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

interface SubmissionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assignment;
  existingSubmission?: Submission;
  onSuccess: () => void;
}

export function SubmissionFormDialog({
  open,
  onOpenChange,
  assignment,
  existingSubmission,
  onSuccess,
}: SubmissionFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<string[]>(existingSubmission?.attachments || []);
  const [attachmentInput, setAttachmentInput] = useState('');
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      content: existingSubmission?.content || '',
      submissionUrl: existingSubmission?.submissionUrl || '',
    },
  });

  const isOverdue = new Date(assignment.dueDate) < new Date();
  const canSubmitLate = assignment.allowLateSubmission;

  const addAttachment = () => {
    if (attachmentInput.trim()) {
      setAttachments([...attachments, attachmentInput.trim()]);
      setAttachmentInput('');
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SubmissionFormData) => {
    try {
      setIsLoading(true);

      const submissionData = {
        assignmentId: assignment.id,
        content: data.content,
        submissionUrl: data.submissionUrl || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      let submission: Submission;
      
      if (existingSubmission) {
        // Update existing draft
        submission = await submissionApi.update(existingSubmission.id, submissionData);
      } else {
        // Create new submission
        submission = await submissionApi.create(submissionData);
      }

      // Submit the submission (change status from DRAFT to SUBMITTED)
      await submissionApi.submit(submission.id);

      toast({
        title: 'Success',
        description: 'Assignment submitted successfully',
      });
      reset();
      setAttachments([]);
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit assignment',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async (data: SubmissionFormData) => {
    try {
      setIsLoading(true);

      const submissionData = {
        assignmentId: assignment.id,
        content: data.content,
        submissionUrl: data.submissionUrl || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      if (existingSubmission) {
        await submissionApi.update(existingSubmission.id, submissionData);
      } else {
        await submissionApi.create(submissionData);
      }

      toast({
        title: 'Draft Saved',
        description: 'Your work has been saved as a draft',
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save draft',
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
          <DialogTitle>
            {existingSubmission ? 'Update Submission' : 'Submit Assignment'}
          </DialogTitle>
          <DialogDescription>
            {assignment.title} - Max Points: {assignment.maxPoints}
          </DialogDescription>
        </DialogHeader>

        {isOverdue && !canSubmitLate && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This assignment is overdue and late submissions are not allowed.
            </AlertDescription>
          </Alert>
        )}

        {isOverdue && canSubmitLate && assignment.lateSubmissionPenalty && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This assignment is overdue. A {assignment.lateSubmissionPenalty}% penalty will be applied.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Content Field */}
          <div className="space-y-2">
            <Label htmlFor="content">Your Answer</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="Type your answer here..."
              rows={8}
              className="resize-none"
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          {/* Submission URL */}
          <div className="space-y-2">
            <Label htmlFor="submissionUrl">Submission URL (Optional)</Label>
            <Input
              id="submissionUrl"
              {...register('submissionUrl')}
              placeholder="https://example.com/your-work"
              type="url"
            />
            <p className="text-sm text-muted-foreground">
              Link to external work (Google Docs, GitHub, etc.)
            </p>
            {errors.submissionUrl && (
              <p className="text-sm text-destructive">{errors.submissionUrl.message}</p>
            )}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={attachmentInput}
                onChange={(e) => setAttachmentInput(e.target.value)}
                placeholder="Paste file URL or path"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttachment())}
              />
              <Button type="button" variant="outline" onClick={addAttachment}>
                <Upload className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            {attachments.length > 0 && (
              <div className="space-y-2 mt-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate">{attachment}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSubmit(handleSaveDraft)}
              disabled={isLoading}
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (isOverdue && !canSubmitLate)}
            >
              {isLoading ? 'Submitting...' : 'Submit Assignment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
