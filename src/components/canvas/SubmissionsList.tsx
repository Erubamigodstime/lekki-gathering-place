import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Clock, FileText, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { submissionApi } from '@/utils/canvas-api';
import type { Submission } from '@/types/canvas';
import { GradeSubmissionDialog } from './GradeSubmissionDialog';
import { useToast } from '@/hooks/use-toast';

interface SubmissionsListProps {
  assignmentId: string;
  assignmentTitle: string;
  maxPoints: number;
  onBack: () => void;
}

export function SubmissionsList({ assignmentId, assignmentTitle, maxPoints, onBack }: SubmissionsListProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const data = await submissionApi.getByAssignment(assignmentId);
      setSubmissions(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch submissions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case 'SUBMITTED':
        return 'default';
      case 'GRADED':
        return 'outline';
      case 'DRAFT':
        return 'secondary';
      case 'LATE':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading submissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Back to Assignments
          </Button>
          <h2 className="text-2xl font-bold">{assignmentTitle}</h2>
          <p className="text-muted-foreground">Grade student submissions</p>
        </div>
        <Badge variant="outline" className="text-base px-4 py-2">
          {submissions.length} Submission{submissions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No submissions yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">
                        {submission.student?.firstName} {submission.student?.lastName}
                      </CardTitle>
                      <Badge variant={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                      {submission.grade && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {submission.grade.score}/{maxPoints} ({submission.grade.letterGrade})
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Submitted: {format(new Date(submission.submittedAt || submission.createdAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                      {submission.grade?.updatedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Graded: {format(new Date(submission.grade.updatedAt), 'MMM dd, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-2">
                    {submission.content && (
                      <p className="text-sm line-clamp-2">{submission.content}</p>
                    )}
                    {submission.submissionUrl && (
                      <p className="text-sm text-muted-foreground">
                        URL: <a href={submission.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {submission.submissionUrl}
                        </a>
                      </p>
                    )}
                    {submission.attachments && submission.attachments.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {submission.attachments.length} attachment{submission.attachments.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => setSelectedSubmission(submission)}
                    variant={submission.grade ? 'outline' : 'default'}
                  >
                    {submission.grade ? 'Review Grade' : 'Grade Submission'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Grade Submission Dialog */}
      {selectedSubmission && (
        <GradeSubmissionDialog
          open={!!selectedSubmission}
          onOpenChange={(open) => !open && setSelectedSubmission(null)}
          submission={selectedSubmission}
          maxPoints={maxPoints}
          onSuccess={() => {
            setSelectedSubmission(null);
            fetchSubmissions();
          }}
        />
      )}
    </div>
  );
}
