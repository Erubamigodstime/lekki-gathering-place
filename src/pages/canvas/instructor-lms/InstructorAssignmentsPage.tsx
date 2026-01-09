import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  CheckCircle2, 
  Users, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  CheckSquare, 
  Upload,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

type AssignmentType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'CHECKBOX';

interface Assignment {
  id: string;
  title: string;
  instructions: string;
  type: AssignmentType;
  maxPoints: number;
  rubric: any;
  dueDate: string | null;
  allowLateSubmission: boolean;
  isPublished: boolean;
  lesson?: {
    id: string;
    title: string;
    week: number;
  };
  _count?: {
    submissions: number;
  };
  createdAt: string;
}

interface Submission {
  id: string;
  status: string;
  submittedAt: string;
  content?: string;
  fileUrl?: string;
  student: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  assignment: {
    id: string;
    title: string;
    maxPoints: number;
  };
  grade?: {
    points: number;
    percentage: number;
    instructorComment: string;
    status: string;
  };
}

interface RubricCriteria {
  id: string;
  name: string;
  description: string;
  points: number;
}

interface InstructorAssignmentsPageProps {
  classId: string;
}

export default function InstructorAssignmentsPage({ classId }: InstructorAssignmentsPageProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [lessons, setLessons] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    type: 'TEXT' as AssignmentType,
    maxPoints: 100,
    lessonId: '',
    dueDate: '',
    allowLateSubmission: true,
    rubric: [] as RubricCriteria[],
  });

  const [gradeData, setGradeData] = useState({
    points: 0,
    instructorComment: '',
  });

  useEffect(() => {
    fetchLessons();
    fetchAssignments();
    fetchPendingSubmissions();
  }, [classId]);

  const fetchLessons = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/lessons/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLessons(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/assignments/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch all assignments and their pending submissions
      const response = await axios.get(`${API_URL}/submissions/class/${classId}?status=SUBMITTED`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingSubmissions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch pending submissions:', error);
    }
  };

  const handleCreate = () => {
    setEditingAssignment(null);
    setFormData({
      title: '',
      instructions: '',
      type: 'TEXT',
      maxPoints: 100,
      lessonId: lessons[0]?.id || '',
      dueDate: '',
      allowLateSubmission: true,
      rubric: [],
    });
    setShowCreateDialog(true);
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      instructions: assignment.instructions,
      type: assignment.type,
      maxPoints: assignment.maxPoints,
      lessonId: assignment.lesson?.id || '',
      dueDate: assignment.dueDate ? assignment.dueDate.split('T')[0] : '',
      allowLateSubmission: assignment.allowLateSubmission,
      rubric: assignment.rubric || [],
    });
    setShowCreateDialog(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        rubric: formData.rubric.length > 0 ? formData.rubric : null,
      };
      
      if (editingAssignment) {
        await axios.put(
          `${API_URL}/assignments/${editingAssignment.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Assignment updated!');
      } else {
        await axios.post(
          `${API_URL}/assignments`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Assignment created!');
      }
      
      setShowCreateDialog(false);
      fetchAssignments();
    } catch (error) {
      console.error('Failed to save assignment:', error);
      toast.error('Failed to save assignment');
    }
  };

  const handlePublish = async (assignmentId: string, isPublished: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/assignments/${assignmentId}/${isPublished ? 'unpublish' : 'publish'}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(isPublished ? 'Assignment unpublished' : 'Assignment published!');
      fetchAssignments();
    } catch (error) {
      console.error('Failed to toggle publish:', error);
      toast.error('Failed to update assignment');
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Assignment deleted!');
      fetchAssignments();
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  const handleGradeSubmission = (submission: Submission) => {
    setGradingSubmission(submission);
    setGradeData({
      points: submission.grade?.points || submission.assignment.maxPoints,
      instructorComment: submission.grade?.instructorComment || '',
    });
    setShowGradeDialog(true);
  };

  const handleSaveGrade = async () => {
    if (!gradingSubmission) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/submissions/${gradingSubmission.id}/approve`,
        {
          points: gradeData.points,
          maxPoints: gradingSubmission.assignment.maxPoints,
          instructorComment: gradeData.instructorComment,
          status: 'APPROVED',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Submission graded!');
      setShowGradeDialog(false);
      fetchPendingSubmissions();
    } catch (error) {
      console.error('Failed to grade submission:', error);
      toast.error('Failed to grade submission');
    }
  };

  const handleRejectSubmission = async (submissionId: string) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/submissions/${submissionId}/reject`,
        { rejectionReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Submission rejected');
      fetchPendingSubmissions();
    } catch (error) {
      console.error('Failed to reject submission:', error);
      toast.error('Failed to reject submission');
    }
  };

  const addRubricCriteria = () => {
    setFormData({
      ...formData,
      rubric: [
        ...formData.rubric,
        { id: Date.now().toString(), name: '', description: '', points: 0 },
      ],
    });
  };

  const updateRubricCriteria = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      rubric: formData.rubric.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    });
  };

  const removeRubricCriteria = (id: string) => {
    setFormData({
      ...formData,
      rubric: formData.rubric.filter((c) => c.id !== id),
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-gold"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
            <p className="text-gray-600 mt-1">Create and manage student assignments</p>
          </div>
          <Button onClick={handleCreate} className="bg-gradient-to-r from-church-gold to-yellow-600">
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
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
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-green-600">
                    {assignments.filter(a => a.isPublished).length}
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
                  <p className="text-2xl font-bold text-amber-600">{pendingSubmissions.length}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {assignments.reduce((sum, a) => sum + (a._count?.submissions || 0), 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="all">All Assignments</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Grading {pendingSubmissions.length > 0 && `(${pendingSubmissions.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments Yet</h3>
                <p className="text-gray-600 mb-4">Create your first assignment</p>
                <Button onClick={handleCreate} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {assignments.map((assignment) => (
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
                            <div className="flex items-center gap-3 mt-1">
                              <Badge variant={assignment.isPublished ? 'default' : 'secondary'}>
                                {assignment.isPublished ? 'Published' : 'Draft'}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {assignment.maxPoints} points
                              </span>
                              {assignment.lesson && (
                                <span className="text-sm text-gray-600">
                                  Week {assignment.lesson.week}: {assignment.lesson.title}
                                </span>
                              )}
                              {assignment.dueDate && (
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                          {assignment.instructions}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePublish(assignment.id, assignment.isPublished)}
                        >
                          {assignment.isPublished ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(assignment)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(assignment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {assignment._count?.submissions || 0} submissions
                      </span>
                      <span className="text-gray-600">
                        Created {new Date(assignment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingSubmissions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600">No pending submissions to grade</p>
              </CardContent>
            </Card>
          ) : (
            pendingSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {submission.student.user.firstName} {submission.student.user.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">{submission.student.user.email}</p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-blue-900">{submission.assignment.title}</span>
                          <Badge className="bg-amber-100 text-amber-700">
                            {submission.assignment.maxPoints} points
                          </Badge>
                        </div>
                        <p className="text-sm text-blue-800">
                          Submitted: {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                        
                        {submission.content && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="text-sm font-medium text-blue-900 mb-1">Submission:</p>
                            <p className="text-sm text-blue-800 whitespace-pre-wrap">{submission.content}</p>
                          </div>
                        )}
                        
                        {submission.fileUrl && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="text-sm font-medium text-blue-900 mb-1">File:</p>
                            <a 
                              href={submission.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              View Submission File
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleGradeSubmission(submission)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Grade
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRejectSubmission(submission.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Assignment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</DialogTitle>
            <DialogDescription>
              Set up an assignment for your students
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Assignment Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Week 3 Project"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Submission Type *</label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => setFormData({ ...formData, type: v as AssignmentType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEXT">Text Response</SelectItem>
                    <SelectItem value="IMAGE">Image Upload</SelectItem>
                    <SelectItem value="VIDEO">Video Upload</SelectItem>
                    <SelectItem value="FILE">File Upload</SelectItem>
                    <SelectItem value="CHECKBOX">Completion Checkbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Lesson/Week *</label>
                <Select 
                  value={formData.lessonId} 
                  onValueChange={(v) => setFormData({ ...formData, lessonId: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        Week {lesson.week}: {lesson.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Max Points *</label>
                <Input
                  type="number"
                  value={formData.maxPoints}
                  onChange={(e) => setFormData({ ...formData, maxPoints: Number(e.target.value) })}
                  min={1}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Due Date (Optional)</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Instructions *</label>
              <Textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Provide clear instructions for students..."
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowLate"
                checked={formData.allowLateSubmission}
                onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="allowLate" className="text-sm font-medium">
                Allow late submissions
              </label>
            </div>

            {/* Rubric Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Grading Rubric (Optional)</label>
                <Button type="button" variant="outline" size="sm" onClick={addRubricCriteria}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Criteria
                </Button>
              </div>
              
              {formData.rubric.length > 0 && (
                <div className="space-y-3">
                  {formData.rubric.map((criteria) => (
                    <div key={criteria.id} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Criteria name"
                          value={criteria.name}
                          onChange={(e) => updateRubricCriteria(criteria.id, 'name', e.target.value)}
                        />
                        <Input
                          placeholder="Description"
                          value={criteria.description}
                          onChange={(e) => updateRubricCriteria(criteria.id, 'description', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Points"
                          value={criteria.points}
                          onChange={(e) => updateRubricCriteria(criteria.id, 'points', Number(e.target.value))}
                          className="w-32"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRubricCriteria(criteria.id)}
                        className="text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-church-gold to-yellow-600">
              <Save className="h-4 w-4 mr-2" />
              {editingAssignment ? 'Update' : 'Create'} Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              {gradingSubmission && (
                <>
                  {gradingSubmission.student.user.firstName} {gradingSubmission.student.user.lastName} - {gradingSubmission.assignment.title}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Points (Max: {gradingSubmission?.assignment.maxPoints})
              </label>
              <Input
                type="number"
                value={gradeData.points}
                onChange={(e) => setGradeData({ ...gradeData, points: Number(e.target.value) })}
                min={0}
                max={gradingSubmission?.assignment.maxPoints}
              />
              {gradingSubmission && (
                <p className="text-sm text-gray-600 mt-1">
                  Percentage: {((gradeData.points / gradingSubmission.assignment.maxPoints) * 100).toFixed(1)}%
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Feedback/Comments</label>
              <Textarea
                value={gradeData.instructorComment}
                onChange={(e) => setGradeData({ ...gradeData, instructorComment: e.target.value })}
                placeholder="Provide feedback to the student..."
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGradeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGrade} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Save Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
