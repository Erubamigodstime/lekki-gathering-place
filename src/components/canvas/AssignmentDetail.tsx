import { useState } from 'react';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Assignment } from '@/types/canvas';
import { SubmissionFormDialog } from './SubmissionFormDialog';

interface AssignmentDetailProps {
  assignment: Assignment;
  onBack: () => void;
  onUpdate: () => void;
  onViewSubmissions?: () => void;
  userRole?: 'STUDENT' | 'INSTRUCTOR';
}

export function AssignmentDetail({ assignment, onBack, onUpdate, onViewSubmissions, userRole = 'STUDENT' }: AssignmentDetailProps) {
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge>{assignment.type}</Badge>
              <Badge variant={assignment.published ? 'default' : 'outline'}>
                {assignment.published ? 'Published' : 'Draft'}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold">{assignment.title}</h2>
          </div>
        </div>
        <div className="flex gap-2">
          {userRole === 'INSTRUCTOR' && onViewSubmissions && (
            <Button variant="outline" onClick={onViewSubmissions}>
              View Submissions
            </Button>
          )}
          {userRole === 'STUDENT' && (
            <Button onClick={() => setShowSubmissionDialog(true)}>
              Submit Assignment
            </Button>
          )}
        </div>
      </div>

      {/* Submission Dialog */}
      <SubmissionFormDialog
        open={showSubmissionDialog}
        onOpenChange={setShowSubmissionDialog}
        assignment={assignment}
        onSuccess={() => {
          setShowSubmissionDialog(false);
          onUpdate();
        }}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Due Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(assignment.dueDate), 'PPP')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Max Points</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{assignment.maxPoints}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Late Submission</CardTitle>
          </CardHeader>
          <CardContent>
            {assignment.allowLateSubmission ? (
              <span className="text-sm">
                Allowed ({assignment.lateSubmissionPenalty}% penalty)
              </span>
            ) : (
              <span className="text-sm text-destructive">Not Allowed</span>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{assignment.description}</p>
        </CardContent>
      </Card>

      {assignment.attachments && assignment.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assignment.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{attachment}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
