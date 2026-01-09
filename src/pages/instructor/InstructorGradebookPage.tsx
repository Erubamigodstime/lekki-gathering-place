import { useState, useEffect } from 'react';
import { BookOpen, FileCheck, TrendingUp, Users, Eye, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Assignment {
  id: string;
  title: string;
  lessonTitle: string;
  maxPoints: number;
  dueDate?: string;
  type: string;
}

interface Grade {
  id: string;
  points: number;
  maxPoints: number;
  percentage: number;
  instructorComment?: string;
  gradedAt: string;
}

interface AssignmentGrade {
  assignmentId: string;
  submissionId?: string;
  status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'PENDING' | 'PUBLISHED';
  grade: Grade | null;
}

interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface StudentGradebook {
  student: Student;
  enrollmentId: string;
  assignmentGrades: AssignmentGrade[];
  overallGrade: {
    totalPoints: number;
    earnedPoints: number;
    percentage: number;
    letterGrade: string;
  } | null;
}

interface Gradebook {
  assignments: Assignment[];
  students: StudentGradebook[];
}

interface Class {
  id: string;
  name: string;
}

interface GradeDialogData {
  studentName: string;
  assignmentTitle: string;
  submissionId: string;
  currentGrade: Grade | null;
  maxPoints: number;
}

export default function InstructorGradebookPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [gradebook, setGradebook] = useState<Gradebook | null>(null);
  const [loading, setLoading] = useState(false);
  const [gradeDialog, setGradeDialog] = useState<GradeDialogData | null>(null);
  const [gradeForm, setGradeForm] = useState({
    points: '',
    comment: '',
  });
  const [selectedGrades, setSelectedGrades] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchGradebook();
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const instructorId = localStorage.getItem('instructorId');

      const response = await axios.get(
        `${API_URL}/classes/instructor/${instructorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const classesData = response.data.data || [];
      setClasses(classesData);

      if (classesData.length > 0 && !selectedClassId) {
        setSelectedClassId(classesData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
    }
  };

  const fetchGradebook = async () => {
    if (!selectedClassId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${API_URL}/grades/class/${selectedClassId}/gradebook`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setGradebook(response.data.data);
    } catch (error) {
      console.error('Failed to fetch gradebook:', error);
      toast.error('Failed to load gradebook');
    } finally {
      setLoading(false);
    }
  };

  const openGradeDialog = (
    studentName: string,
    assignmentTitle: string,
    submissionId: string,
    currentGrade: Grade | null,
    maxPoints: number
  ) => {
    setGradeDialog({
      studentName,
      assignmentTitle,
      submissionId,
      currentGrade,
      maxPoints,
    });
    setGradeForm({
      points: currentGrade?.points.toString() || '',
      comment: currentGrade?.instructorComment || '',
    });
  };

  const handleGradeSubmit = async () => {
    if (!gradeDialog) return;

    const points = parseFloat(gradeForm.points);
    if (isNaN(points) || points < 0 || points > gradeDialog.maxPoints) {
      toast.error(`Points must be between 0 and ${gradeDialog.maxPoints}`);
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');

      if (gradeDialog.currentGrade) {
        // Update existing grade
        await axios.put(
          `${API_URL}/grades/${gradeDialog.currentGrade.id}`,
          {
            points,
            maxPoints: gradeDialog.maxPoints,
            instructorComment: gradeForm.comment,
            status: 'PENDING',
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Grade updated successfully');
      } else {
        // Create new grade
        await axios.post(
          `${API_URL}/grades`,
          {
            submissionId: gradeDialog.submissionId,
            points,
            maxPoints: gradeDialog.maxPoints,
            instructorComment: gradeForm.comment,
            status: 'PENDING',
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Grade created successfully');
      }

      setGradeDialog(null);
      fetchGradebook();
    } catch (error: any) {
      console.error('Failed to save grade:', error);
      toast.error(error.response?.data?.message || 'Failed to save grade');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkPublish = async () => {
    if (selectedGrades.size === 0) {
      toast.error('Please select grades to publish');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');

      await axios.post(
        `${API_URL}/grades/bulk-publish`,
        { gradeIds: Array.from(selectedGrades) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`${selectedGrades.size} grade(s) published successfully`);
      setSelectedGrades(new Set());
      fetchGradebook();
    } catch (error: any) {
      console.error('Failed to publish grades:', error);
      toast.error(error.response?.data?.message || 'Failed to publish grades');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleGradeSelection = (gradeId: string) => {
    const newSelection = new Set(selectedGrades);
    if (newSelection.has(gradeId)) {
      newSelection.delete(gradeId);
    } else {
      newSelection.add(gradeId);
    }
    setSelectedGrades(newSelection);
  };

  const getLetterGradeColor = (letterGrade: string) => {
    switch (letterGrade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCellColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-50';
    if (percentage >= 80) return 'bg-blue-50';
    if (percentage >= 70) return 'bg-yellow-50';
    if (percentage >= 60) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'SUBMITTED':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  if (loading && !gradebook) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-gold"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gradebook</h1>
        <p className="text-gray-600">
          View and manage grades for all students in your classes
        </p>
      </div>

      {/* Class Selector and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={fetchGradebook}
            variant="outline"
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {selectedGrades.size > 0 && (
          <Button onClick={handleBulkPublish} disabled={submitting}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Publish {selectedGrades.size} Grade{selectedGrades.size !== 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      {gradebook && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {gradebook.students.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {gradebook.assignments.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Class Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {gradebook.students.filter(s => s.overallGrade).length > 0
                  ? (
                      gradebook.students
                        .filter(s => s.overallGrade)
                        .reduce((sum, s) => sum + (s.overallGrade?.percentage || 0), 0) /
                      gradebook.students.filter(s => s.overallGrade).length
                    ).toFixed(1)
                  : 'N/A'}
                %
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Pending Grades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {gradebook.students.reduce(
                  (sum, s) =>
                    sum +
                    s.assignmentGrades.filter(
                      (ag) => ag.status === 'PENDING'
                    ).length,
                  0
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gradebook Table */}
      {gradebook && gradebook.students.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r z-10 min-w-[200px]">
                      Student
                    </th>
                    {gradebook.assignments.map((assignment) => (
                      <th
                        key={assignment.id}
                        className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r min-w-[120px]"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="truncate max-w-[100px]" title={assignment.title}>
                            {assignment.title}
                          </span>
                          <span className="text-gray-500 font-normal">
                            {assignment.maxPoints} pts
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="sticky right-0 bg-gray-50 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider z-10 min-w-[120px]">
                      Overall Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {gradebook.students.map((studentGradebook) => (
                    <tr key={studentGradebook.student.id} className="hover:bg-gray-50">
                      <td className="sticky left-0 bg-white px-4 py-3 border-r z-10">
                        <div>
                          <div className="font-medium text-gray-900">
                            {studentGradebook.student.firstName}{' '}
                            {studentGradebook.student.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {studentGradebook.student.email}
                          </div>
                        </div>
                      </td>
                      {studentGradebook.assignmentGrades.map((ag, index) => {
                        const assignment = gradebook.assignments[index];
                        
                        return (
                          <td
                            key={ag.assignmentId}
                            className={`px-4 py-3 text-center border-r ${
                              ag.grade ? getCellColor(ag.grade.percentage) : ''
                            }`}
                          >
                            {ag.status === 'NOT_SUBMITTED' ? (
                              <span className="text-gray-400 text-sm">-</span>
                            ) : ag.status === 'SUBMITTED' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  openGradeDialog(
                                    `${studentGradebook.student.firstName} ${studentGradebook.student.lastName}`,
                                    assignment.title,
                                    ag.submissionId!,
                                    null,
                                    assignment.maxPoints
                                  )
                                }
                              >
                                Grade
                              </Button>
                            ) : ag.grade ? (
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2">
                                  {ag.status === 'PENDING' && (
                                    <Checkbox
                                      checked={selectedGrades.has(ag.grade.id)}
                                      onCheckedChange={() =>
                                        toggleGradeSelection(ag.grade!.id)
                                      }
                                    />
                                  )}
                                  <button
                                    onClick={() =>
                                      openGradeDialog(
                                        `${studentGradebook.student.firstName} ${studentGradebook.student.lastName}`,
                                        assignment.title,
                                        ag.submissionId!,
                                        ag.grade,
                                        assignment.maxPoints
                                      )
                                    }
                                    className="hover:underline"
                                  >
                                    <div className="font-semibold text-gray-900">
                                      {ag.grade.points}/{ag.grade.maxPoints}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {ag.grade.percentage.toFixed(0)}%
                                    </div>
                                  </button>
                                  {getStatusIcon(ag.status)}
                                </div>
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                      <td className="sticky right-0 bg-white px-4 py-3 text-center z-10">
                        {studentGradebook.overallGrade ? (
                          <div className="flex flex-col items-center gap-1">
                            <Badge
                              className={getLetterGradeColor(
                                studentGradebook.overallGrade.letterGrade
                              )}
                            >
                              {studentGradebook.overallGrade.letterGrade}
                            </Badge>
                            <div className="text-sm font-semibold text-gray-900">
                              {studentGradebook.overallGrade.percentage.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-600">
                              {studentGradebook.overallGrade.earnedPoints.toFixed(1)}/
                              {studentGradebook.overallGrade.totalPoints}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No students enrolled
            </h3>
            <p className="text-gray-600">
              There are no students enrolled in this class yet
            </p>
          </CardContent>
        </Card>
      )}

      {/* Grade Dialog */}
      {gradeDialog && (
        <Dialog open={!!gradeDialog} onOpenChange={() => setGradeDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {gradeDialog.currentGrade ? 'Edit Grade' : 'Grade Submission'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Student
                </Label>
                <p className="text-gray-900 font-semibold">{gradeDialog.studentName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Assignment
                </Label>
                <p className="text-gray-900">{gradeDialog.assignmentTitle}</p>
              </div>
              <div>
                <Label htmlFor="points">
                  Points (out of {gradeDialog.maxPoints})
                </Label>
                <Input
                  id="points"
                  type="number"
                  min="0"
                  max={gradeDialog.maxPoints}
                  step="0.1"
                  value={gradeForm.points}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, points: e.target.value })
                  }
                  placeholder={`0 - ${gradeDialog.maxPoints}`}
                />
              </div>
              <div>
                <Label htmlFor="comment">Instructor Comment (Optional)</Label>
                <Textarea
                  id="comment"
                  value={gradeForm.comment}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, comment: e.target.value })
                  }
                  placeholder="Provide feedback for the student..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setGradeDialog(null)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={handleGradeSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Grade'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
