import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, ClipboardList, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { assignmentApi } from '@/utils/canvas-api';
import type { Assignment } from '@/types/canvas';
import { AssignmentDetail } from './AssignmentDetail';
import { CreateAssignmentDialog } from './CreateAssignmentDialog';
import { SubmissionsList } from './SubmissionsList';
import { useToast } from '@/hooks/use-toast';

interface AssignmentListProps {
  classId: string;
  userRole?: 'STUDENT' | 'INSTRUCTOR';
}

export function AssignmentList({ classId, userRole = 'STUDENT' }: AssignmentListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [viewingSubmissions, setViewingSubmissions] = useState<Assignment | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
  }, [classId]);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const data = await assignmentApi.getByClass(classId);
      setAssignments(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch assignments',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getTypeColor = (type: string) => {
    const colors = {
      HOMEWORK: 'bg-blue-500',
      QUIZ: 'bg-purple-500',
      PROJECT: 'bg-green-500',
      EXAM: 'bg-red-500',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  if (viewingSubmissions) {
    return (
      <SubmissionsList
        assignmentId={viewingSubmissions.id}
        assignmentTitle={viewingSubmissions.title}
        maxPoints={viewingSubmissions.maxPoints}
        onBack={() => setViewingSubmissions(null)}
      />
    );
  }

  if (selectedAssignment) {
    return (
      <AssignmentDetail
        assignment={selectedAssignment}
        onBack={() => setSelectedAssignment(null)}
        onUpdate={fetchAssignments}
        onViewSubmissions={userRole === 'INSTRUCTOR' ? () => {
          setViewingSubmissions(selectedAssignment);
          setSelectedAssignment(null);
        } : undefined}
        userRole={userRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Class Assignments</h3>
        {userRole === 'INSTRUCTOR' && (
          <Button onClick={() => setShowCreateDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Assignment
          </Button>
        )}
      </div>

      {/* Create Assignment Dialog */}
      <CreateAssignmentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        classId={classId}
        onSuccess={() => {
          setShowCreateDialog(false);
          fetchAssignments();
        }}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No assignments yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedAssignment(assignment)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(assignment.type)}>
                        {assignment.type}
                      </Badge>
                      {assignment.published ? (
                        <Badge variant="default">Published</Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                      {isOverdue(assignment.dueDate) && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {assignment.description}
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(assignment.dueDate), 'hh:mm a')}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Max Points: <span className="font-semibold">{assignment.maxPoints}</span>
                  </div>
                  {assignment.lesson && (
                    <Badge variant="outline">
                      {assignment.lesson.title}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
