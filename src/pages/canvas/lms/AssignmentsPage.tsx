import { useState, useEffect } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Upload, 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Send,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

type AssignmentType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'CHECKBOX';
type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'GRADED' | 'APPROVED' | 'REJECTED';

interface Assignment {
  id: string;
  title: string;
  instructions: string;
  type: AssignmentType;
  maxPoints: number;
  dueDate: string | null;
  allowLateSubmission: boolean;
  isPublished: boolean;
  lesson?: {
    id: string;
    title: string;
    week: number;
  };
  submission?: {
    id: string;
    status: SubmissionStatus;
    content?: string;
    fileUrl?: string;
    submittedAt: string;
    grade?: {
      points: number;
      percentage: number;
      instructorComment: string;
      status: string;
    };
  };
}

interface StudentAssignmentsPageProps {
  classId: string;
}

export default function StudentAssignmentsPage({ classId }: StudentAssignmentsPageProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [submissionData, setSubmissionData] = useState({
    content: '',
    file: null as File | null,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, [classId]);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/assignments/class/${classId}?includeSubmission=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Only show published assignments
      const publishedAssignments = (response.data.data || []).filter((a: Assignment) => a.isPublished);
      setAssignments(publishedAssignments);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSubmission = (assignment: Assignment) => {
    setSubmittingAssignment(assignment);
    setSubmissionData({
      content: assignment.submission?.content || '',
      file: null,
    });
    setShowSubmitDialog(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionData({ ...submissionData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    if (!submittingAssignment) return;

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      
      // If there's a file, upload it first
      let fileUrl = '';
      if (submissionData.file) {
        const formData = new FormData();
        formData.append('file', submissionData.file);
        
        const uploadResponse = await axios.post(
          `${API_URL}/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        fileUrl = uploadResponse.data.data.url;
      }

      // Create or update submission
      if (submittingAssignment.submission) {
        // Update existing submission
        await axios.put(
          `${API_URL}/submissions/${submittingAssignment.submission.id}`,
          {
            content: submissionData.content,
            fileUrl: fileUrl || submittingAssignment.submission.fileUrl,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Submit it
        await axios.post(
          `${API_URL}/submissions/${submittingAssignment.submission.id}/submit`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new submission and submit
        const createResponse = await axios.post(
          `${API_URL}/submissions`,
          {
            assignmentId: submittingAssignment.id,
            content: submissionData.content,
            fileUrl,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Submit it
        await axios.post(
          `${API_URL}/submissions/${createResponse.data.data.id}/submit`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      toast.success('Assignment submitted successfully!');
      setShowSubmitDialog(false);
      fetchAssignments();
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      toast.error('Failed to submit assignment');
    } finally {
      setUploading(false);
    }
  };

  const handleCheckboxSubmit = async (assignment: Assignment) => {
    try {
      const token = localStorage.getItem('token');
      
      // Create and submit checkbox assignment
      const createResponse = await axios.post(
        `${API_URL}/submissions`,
        {
          assignmentId: assignment.id,
          content: 'Completed',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await axios.post(
        `${API_URL}/submissions/${createResponse.data.data.id}/submit`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Assignment marked as completed!');
      fetchAssignments();
    } catch (error) {
      console.error('Failed to submit:', error);
      toast.error('Failed to mark as completed');
    }
  };

  const getTypeIcon = (type: AssignmentType) => {
    switch (type) {
      case 'TEXT': return <FileText className="h-5 w-5" />;
      case 'IMAGE': return <ImageIcon className="h-5 w-5" />;
      case 'VIDEO': return <Video className="h-5 w-5" />;
      case 'FILE': return <Upload className="h-5 w-5" />;
      case 'CHECKBOX': return <CheckSquare className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: AssignmentType) => {
    switch (type) {
      case 'TEXT': return 'text-blue-600 bg-blue-100';
      case 'IMAGE': return 'text-purple-600 bg-purple-100';
      case 'VIDEO': return 'text-red-600 bg-red-100';
      case 'FILE': return 'text-green-600 bg-green-100';
      case 'CHECKBOX': return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (!assignment.submission) {
      return <Badge variant="secondary">Not Started</Badge>;
    }

    const status = assignment.submission.status;
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>;
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return <Badge className="bg-amber-100 text-amber-700">Pending Review</Badge>;
      case 'APPROVED':
      case 'GRADED':
        return (
          <Badge className="bg-green-100 text-green-700">
            Graded ({assignment.submission.grade?.points}/{assignment.maxPoints})
          </Badge>
        );
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const canSubmit = (assignment: Assignment) => {
    if (!assignment.submission) return true;
    return assignment.submission.status === 'DRAFT' || assignment.submission.status === 'REJECTED';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-gold"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600 mt-1">View and complete your class assignments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {assignments.filter(a => a.submission?.status === 'APPROVED' || a.submission?.status === 'GRADED').length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-amber-600">
                  {assignments.filter(a => a.submission?.status === 'SUBMITTED' || a.submission?.status === 'UNDER_REVIEW').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">To Do</p>
                <p className="text-2xl font-bold text-blue-600">
                  {assignments.filter(a => !a.submission).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments Yet</h3>
              <p className="text-gray-600">Your instructor hasn't posted any assignments</p>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${getTypeColor(assignment.type)}`}>
                        {getTypeIcon(assignment.type)}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{assignment.title}</CardTitle>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {getStatusBadge(assignment)}
                          <span className="text-sm text-gray-600">
                            {assignment.maxPoints} points
                          </span>
                          {assignment.lesson && (
                            <span className="text-sm text-gray-600">
                              Week {assignment.lesson.week}: {assignment.lesson.title}
                            </span>
                          )}
                          {assignment.dueDate && (
                            <span className={`text-sm flex items-center gap-1 ${
                              isOverdue(assignment.dueDate) ? 'text-red-600 font-semibold' : 'text-gray-600'
                            }`}>
                              <Clock className="h-4 w-4" />
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                              {isOverdue(assignment.dueDate) && ' (Overdue)'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                      {assignment.instructions}
                    </p>

                    {/* Show grade feedback if graded */}
                    {assignment.submission?.grade && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-green-900">
                            Grade: {assignment.submission.grade.points}/{assignment.maxPoints} ({assignment.submission.grade.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        {assignment.submission.grade.instructorComment && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-green-900">Instructor Feedback:</p>
                            <p className="text-sm text-green-800 mt-1">{assignment.submission.grade.instructorComment}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {assignment.type === 'CHECKBOX' ? (
                      !assignment.submission && (
                        <Button
                          onClick={() => handleCheckboxSubmit(assignment)}
                          className="bg-gradient-to-r from-church-gold to-yellow-600"
                        >
                          <CheckSquare className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      )
                    ) : (
                      canSubmit(assignment) && (
                        <Button
                          onClick={() => handleStartSubmission(assignment)}
                          className="bg-gradient-to-r from-church-gold to-yellow-600"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {assignment.submission ? 'Resubmit' : 'Submit'}
                        </Button>
                      )
                    )}
                    
                    {assignment.submission?.fileUrl && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(assignment.submission.fileUrl, '_blank')}
                      >
                        View Submission
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Submit Assignment Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              {submittingAssignment?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {(submittingAssignment?.type === 'TEXT' || submittingAssignment?.type === 'FILE' || submittingAssignment?.type === 'IMAGE' || submittingAssignment?.type === 'VIDEO') && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {submittingAssignment.type === 'TEXT' ? 'Your Response' : 'Additional Notes (Optional)'}
                </label>
                <Textarea
                  value={submissionData.content}
                  onChange={(e) => setSubmissionData({ ...submissionData, content: e.target.value })}
                  placeholder={
                    submittingAssignment.type === 'TEXT'
                      ? 'Type your response here...'
                      : 'Add any notes or comments...'
                  }
                  rows={6}
                />
              </div>
            )}

            {(submittingAssignment?.type === 'FILE' || submittingAssignment?.type === 'IMAGE' || submittingAssignment?.type === 'VIDEO') && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Upload {submittingAssignment.type === 'IMAGE' ? 'Image' : submittingAssignment.type === 'VIDEO' ? 'Video' : 'File'} *
                </label>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept={
                    submittingAssignment.type === 'IMAGE'
                      ? 'image/*'
                      : submittingAssignment.type === 'VIDEO'
                      ? 'video/*'
                      : '*/*'
                  }
                />
                {submissionData.file && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {submissionData.file.name}
                  </p>
                )}
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-blue-900">
                <strong>Instructions:</strong> {submittingAssignment?.instructions}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={uploading}
              className="bg-gradient-to-r from-church-gold to-yellow-600"
            >
              {uploading ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Assignment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
