import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { 
  GraduationCap, 
  Edit, 
  TrendingUp, 
  Users, 
  FileText, 
  CheckCircle, 
  Clock,
  Save,
  X
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Grade {
  id: string;
  points: number;
  maxPoints: number;
  percentage: number;
  instructorComment?: string;
  status: 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
  gradedAt: string;
  publishedAt?: string;
  submission: {
    id: string;
    submittedAt?: string;
    student: {
      id: string;
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
      lesson: {
        weekNumber: number;
        title: string;
      };
    };
  };
}

interface InstructorGradebookPageProps {
  classId: string;
}

export default function InstructorGradebookPage({ classId }: InstructorGradebookPageProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [gradeData, setGradeData] = useState({
    points: 0,
    instructorComment: '',
  });

  useEffect(() => {
    fetchGrades();
  }, [classId]);

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/grades/class/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGrades(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch grades:', error);
      toast.error('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const handleEditGrade = (grade: Grade) => {
    setEditingGrade(grade);
    setGradeData({
      points: grade.points,
      instructorComment: grade.instructorComment || '',
    });
    setShowEditDialog(true);
  };

  const handleUpdateGrade = async () => {
    if (!editingGrade) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/grades/${editingGrade.id}`,
        {
          points: gradeData.points,
          instructorComment: gradeData.instructorComment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Grade updated successfully!');
      setShowEditDialog(false);
      fetchGrades();
    } catch (error) {
      console.error('Failed to update grade:', error);
      toast.error('Failed to update grade');
    }
  };

  const handlePublishGrade = async (gradeId: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'PUBLISHED' ? 'PENDING' : 'PUBLISHED';
      
      await axios.patch(
        `${API_URL}/grades/${gradeId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Grade ${newStatus === 'PUBLISHED' ? 'published' : 'unpublished'} successfully!`);
      fetchGrades();
    } catch (error) {
      console.error('Failed to update grade status:', error);
      toast.error('Failed to update grade status');
    }
  };

  const calculateStats = () => {
    if (grades.length === 0) {
      return {
        totalGrades: 0,
        publishedGrades: 0,
        averageScore: 0,
        averagePercentage: 0,
      };
    }

    const publishedGrades = grades.filter(g => g.status === 'PUBLISHED');
    const totalPercentage = publishedGrades.reduce((sum, g) => sum + g.percentage, 0);
    const averagePercentage = publishedGrades.length > 0 ? totalPercentage / publishedGrades.length : 0;

    return {
      totalGrades: grades.length,
      publishedGrades: publishedGrades.length,
      averageScore: publishedGrades.reduce((sum, g) => sum + g.points, 0) / (publishedGrades.length || 1),
      averagePercentage,
    };
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-gold"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gradebook</h1>
        <p className="text-gray-600 mt-1">View and manage student grades</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Grades</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalGrades}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">{stats.publishedGrades}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Class Average</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averagePercentage.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Letter Grade</p>
                <p className="text-2xl font-bold text-indigo-600">{getLetterGrade(stats.averagePercentage)}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grades List */}
      <Card>
        <CardHeader>
          <CardTitle>All Grades</CardTitle>
        </CardHeader>
        <CardContent>
          {grades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600">No grades recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {grades.map((grade) => (
                <div
                  key={grade.id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {grade.submission.student.user.firstName} {grade.submission.student.user.lastName}
                      </h4>
                      <Badge variant={grade.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {grade.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Assignment:</strong> {grade.submission.assignment.title}</p>
                      <p><strong>Week {grade.submission.assignment.lesson.weekNumber}:</strong> {grade.submission.assignment.lesson.title}</p>
                      <p className="flex items-center gap-2">
                        <strong>Score:</strong> 
                        <span className="text-lg font-bold text-blue-600">
                          {grade.points}/{grade.maxPoints}
                        </span>
                        <span className="text-gray-500">({grade.percentage.toFixed(1)}%)</span>
                        <Badge className={
                          grade.percentage >= 90 ? 'bg-green-100 text-green-800' :
                          grade.percentage >= 80 ? 'bg-blue-100 text-blue-800' :
                          grade.percentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {getLetterGrade(grade.percentage)}
                        </Badge>
                      </p>
                      {grade.instructorComment && (
                        <p className="text-gray-700 italic mt-2">"{grade.instructorComment}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditGrade(grade)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant={grade.status === 'PUBLISHED' ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => handlePublishGrade(grade.id, grade.status)}
                    >
                      {grade.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Grade Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Grade</DialogTitle>
            <DialogDescription>
              Update the grade for {editingGrade?.submission.student.user.firstName} {editingGrade?.submission.student.user.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Points (Max: {editingGrade?.maxPoints})
              </label>
              <Input
                type="number"
                value={gradeData.points}
                onChange={(e) => setGradeData({ ...gradeData, points: parseFloat(e.target.value) })}
                max={editingGrade?.maxPoints}
                min={0}
                step={0.5}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Instructor Comment</label>
              <Textarea
                value={gradeData.instructorComment}
                onChange={(e) => setGradeData({ ...gradeData, instructorComment: e.target.value })}
                placeholder="Add feedback for the student..."
                rows={4}
              />
            </div>

            {editingGrade && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Current Score:</strong> {gradeData.points}/{editingGrade.maxPoints} 
                  ({((gradeData.points / editingGrade.maxPoints) * 100).toFixed(1)}%)
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleUpdateGrade}>
              <Save className="h-4 w-4 mr-2" />
              Update Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
