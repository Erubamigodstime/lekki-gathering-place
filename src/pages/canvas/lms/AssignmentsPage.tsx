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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
    weekNumber: number;
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
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted'>('all');

  useEffect(() => {
    fetchAssignments();
  }, [classId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/assignments/class/${classId}?includeSubmission=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Only show published assignments
      const publishedAssignments = (response.data.data || []).filter((a: Assignment) => a.isPublished);
      console.log('Fetched assignments:', publishedAssignments.map((a: Assignment) => ({
        id: a.id,
        title: a.title,
        hasSubmission: !!a.submission,
        submissionStatus: a.submission?.status
      })));
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
        // Backend returns { success, message, url, publicId }
        fileUrl = uploadResponse.data.url;
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

      console.log('Assignment submitted successfully, fetching updated assignments...');
      toast.success('Assignment submitted successfully!');
      setShowSubmitDialog(false);
      
      // Wait for assignments to refresh
      await fetchAssignments();
      console.log('Assignments refreshed after submission');
    } catch (error: any) {
      console.error('Failed to submit assignment:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit assignment';
      toast.error(errorMessage);
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

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    if (filter === 'pending') {
      return !assignment.submission || assignment.submission.status === 'DRAFT';
    }
    if (filter === 'submitted') {
      return assignment.submission && 
        (assignment.submission.status === 'SUBMITTED' || 
         assignment.submission.status === 'UNDER_REVIEW' ||
         assignment.submission.status === 'APPROVED' ||
         assignment.submission.status === 'GRADED');
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-gold"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">View and complete your class assignments</p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchAssignments()}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Professional Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Assignments</p>
                <p className="text-3xl font-bold text-gray-900">{assignments.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {assignments.filter(a => a.submission?.status === 'APPROVED' || a.submission?.status === 'GRADED').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900">
                  {assignments.filter(a => a.submission?.status === 'SUBMITTED' || a.submission?.status === 'UNDER_REVIEW').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Not Started</p>
                <p className="text-3xl font-bold text-gray-900">
                  {assignments.filter(a => !a.submission).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            filter === 'all'
              ? 'border-church-gold text-church-gold'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          All Assignments ({assignments.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            filter === 'pending'
              ? 'border-church-gold text-church-gold'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending ({assignments.filter(a => !a.submission || a.submission.status === 'DRAFT').length})
        </button>
        <button
          onClick={() => setFilter('submitted')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            filter === 'submitted'
              ? 'border-church-gold text-church-gold'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Submitted ({assignments.filter(a => a.submission && ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'GRADED'].includes(a.submission.status)).length})
        </button>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-bold">Week</TableHead>
                  <TableHead className="font-bold">Assignment</TableHead>
                  <TableHead className="font-bold">Type</TableHead>
                  <TableHead className="font-bold text-center">Points</TableHead>
                  <TableHead className="font-bold text-center">Due Date</TableHead>
                  <TableHead className="font-bold text-center">Status</TableHead>
                  <TableHead className="font-bold text-center">Grade</TableHead>
                  <TableHead className="font-bold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FileText className="h-12 w-12 mb-3 text-gray-300" />
                        <p className="font-medium">
                          {filter === 'all' ? 'No Assignments Yet' : 
                           filter === 'pending' ? 'No Pending Assignments' : 
                           'No Submitted Assignments'}
                        </p>
                        <p className="text-sm mt-1">
                          {filter === 'all' ? "Your instructor hasn't posted any assignments" :
                           filter === 'pending' ? "You don't have any pending assignments" :
                           "You haven't submitted any assignments yet"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                          Week {assignment.lesson?.weekNumber || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{assignment.title}</span>
                          <span className="text-sm text-gray-500">{assignment.lesson?.title || 'No lesson'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-2 w-fit px-2 py-1 rounded-lg ${getTypeColor(assignment.type)}`}>
                          {getTypeIcon(assignment.type)}
                          <span className="text-xs font-medium">{assignment.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {assignment.maxPoints}
                      </TableCell>
                      <TableCell className="text-center">
                        {assignment.dueDate ? (
                          <div className="flex flex-col items-center">
                            <span className={`text-sm ${
                              isOverdue(assignment.dueDate) ? 'text-red-600 font-semibold' : 'text-gray-700'
                            }`}>
                              {new Date(assignment.dueDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            {isOverdue(assignment.dueDate) && !assignment.submission && (
                              <Badge variant="destructive" className="mt-1 text-xs">Overdue</Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No due date</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(assignment)}
                      </TableCell>
                      <TableCell className="text-center">
                        {assignment.submission?.grade ? (
                          <div className="flex flex-col items-center">
                            <span className="font-semibold text-lg">
                              {assignment.submission.grade.points}/{assignment.maxPoints}
                            </span>
                            <span className="text-xs text-gray-600">
                              {assignment.submission.grade.percentage.toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          {assignment.type === 'CHECKBOX' ? (
                            assignment.submission ? (
                              <Button
                                size="sm"
                                disabled
                                className="bg-green-600 text-white cursor-not-allowed"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Done
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleCheckboxSubmit(assignment)}
                                className="bg-gradient-to-r from-church-gold to-yellow-600"
                              >
                                <CheckSquare className="h-3 w-3 mr-1" />
                                Complete
                              </Button>
                            )
                          ) : (
                            <>
                              {canSubmit(assignment) ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleStartSubmission(assignment)}
                                  className="bg-gradient-to-r from-church-gold to-yellow-600"
                                >
                                  <Send className="h-3 w-3 mr-1" />
                                  {assignment.submission ? 'Resubmit' : 'Submit'}
                                </Button>
                              ) : assignment.submission && (assignment.submission.status === 'SUBMITTED' || assignment.submission.status === 'UNDER_REVIEW') ? (
                                <Button
                                  size="sm"
                                  disabled
                                  className="bg-green-600 text-white cursor-not-allowed"
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Submitted
                                </Button>
                              ) : null}
                            </>
                          )}
                          {assignment.submission?.fileUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(assignment.submission.fileUrl, '_blank')}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
