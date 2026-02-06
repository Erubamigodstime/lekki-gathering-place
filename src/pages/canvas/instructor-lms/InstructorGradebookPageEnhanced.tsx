import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  TrendingUp, 
  FileText, 
  CheckCircle, 
  Clock, 
  Edit, 
  Save, 
  X, 
  Eye, 
  Calendar,
  MessageSquare,
  User,
  Award,
  Filter,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
    fileUrl?: string;
    content?: string;
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
      type: string;
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

export default function InstructorGradebookPageEnhanced({ classId }: InstructorGradebookPageProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGrade, setEditingGrade] = useState<string | null>(null);
  const [editData, setEditData] = useState({ points: 0, comment: '' });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'published' | 'pending'>('all');
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);

  useEffect(() => {
    fetchGrades();
  }, [classId]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching grades for class:', classId);
      const response = await axios.get(
        `${API_URL}/grades/class/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Grades response:', response.data);
      // Backend returns { data: { data: grades[], pagination: {...} } }
      const gradesData = response.data.data?.data || [];
      setGrades(Array.isArray(gradesData) ? gradesData : []);
    } catch (error: any) {
      console.error('Failed to fetch grades:', error);
      toast.error(error.response?.data?.message || 'Failed to load grades');
      setGrades([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (grade: Grade) => {
    setEditingGrade(grade.id);
    setEditData({
      points: grade.points,
      comment: grade.instructorComment || '',
    });
  };

  const cancelEdit = () => {
    setEditingGrade(null);
    setEditData({ points: 0, comment: '' });
  };

  const saveGrade = async (gradeId: string, maxPoints: number) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_URL}/grades/${gradeId}`,
        {
          points: editData.points,
          maxPoints: maxPoints,
          instructorComment: editData.comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Grade updated successfully!');
      setEditingGrade(null);
      await fetchGrades();
    } catch (error: any) {
      console.error('Failed to update grade:', error);
      toast.error(error.response?.data?.message || 'Failed to update grade');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (gradeId: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (currentStatus === 'PUBLISHED') {
        await axios.post(
          `${API_URL}/grades/${gradeId}/unpublish`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Grade unpublished');
      } else {
        await axios.post(
          `${API_URL}/grades/${gradeId}/publish`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Grade published to student');
      }

      await fetchGrades();
    } catch (error: any) {
      console.error('Failed to toggle grade status:', error);
      toast.error(error.response?.data?.message || 'Failed to update grade status');
    }
  };

  const calculateStats = () => {
    const publishedGrades = grades.filter(g => g.status === 'PUBLISHED');
    
    if (publishedGrades.length === 0) {
      return {
        totalGrades: grades.length,
        publishedCount: 0,
        pendingCount: grades.filter(g => g.status === 'PENDING').length,
        averagePercentage: 0,
        averagePoints: 0,
        letterGrade: 'N/A',
      };
    }

    const totalPercentage = publishedGrades.reduce((sum, g) => sum + g.percentage, 0);
    const totalPoints = publishedGrades.reduce((sum, g) => sum + g.points, 0);
    const averagePercentage = totalPercentage / publishedGrades.length;
    const averagePoints = totalPoints / publishedGrades.length;

    return {
      totalGrades: grades.length,
      publishedCount: publishedGrades.length,
      pendingCount: grades.filter(g => g.status === 'PENDING').length,
      averagePercentage,
      averagePoints,
      letterGrade: getLetterGrade(averagePercentage),
    };
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const filteredGrades = grades.filter(grade => {
    if (filter === 'all') return true;
    if (filter === 'published') return grade.status === 'PUBLISHED';
    if (filter === 'pending') return grade.status === 'PENDING';
    return true;
  });

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gradebook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-church-gold" />
          Gradebook
        </h1>
        <p className="text-gray-600 mt-2">
          Manage and publish grades for all student submissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Total Grades
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalGrades}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Published
                </p>
                <p className="text-3xl font-bold text-green-600">{stats.publishedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Pending
                </p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Class Average
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.averagePercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  Letter Grade
                </p>
                <p className="text-3xl font-bold text-indigo-600">{stats.letterGrade}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-church-gold hover:bg-yellow-600' : ''}
          >
            All ({grades.length})
          </Button>
          <Button
            variant={filter === 'published' ? 'default' : 'outline'}
            onClick={() => setFilter('published')}
            className={filter === 'published' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Published ({stats.publishedCount})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
          >
            Pending ({stats.pendingCount})
          </Button>
        </div>
      </div>

      {/* Grades Table */}
      <Card>
        <CardContent className="p-0">
          {filteredGrades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <GraduationCap className="h-20 w-20 text-gray-300 mb-4" />
              <p className="text-gray-600">
                {filter === 'pending' ? 'No pending grades' : 'No grades recorded yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Student</TableHead>
                    <TableHead className="font-semibold">Assignment</TableHead>
                    <TableHead className="font-semibold">Week</TableHead>
                    <TableHead className="font-semibold">Grade</TableHead>
                    <TableHead className="font-semibold">Percentage</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Submitted</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrades.map((grade) => (
                    <>
                      <TableRow key={grade.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-church-gold text-white flex items-center justify-center font-semibold text-sm">
                              {grade.submission.student.user.firstName[0]}
                              {grade.submission.student.user.lastName[0]}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {grade.submission.student.user.firstName} {grade.submission.student.user.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {grade.submission.student.user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-medium text-gray-900">
                            {grade.submission.assignment.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {grade.submission.assignment.lesson.title}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            Week {grade.submission.assignment.lesson.weekNumber}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {editingGrade === grade.id ? (
                            <Input
                              type="number"
                              value={editData.points}
                              onChange={(e) => setEditData({ ...editData, points: parseFloat(e.target.value) })}
                              className="w-20"
                              min="0"
                              max={grade.maxPoints}
                              step="0.5"
                            />
                          ) : (
                            <span className="font-semibold">
                              {grade.points}/{grade.maxPoints}
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold ${getGradeColor(grade.percentage)}`}>
                            {grade.percentage.toFixed(1)}%
                          </div>
                        </TableCell>

                        <TableCell>
                          {grade.status === 'PUBLISHED' ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Published
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-sm text-gray-600">
                          {grade.submission.submittedAt 
                            ? new Date(grade.submission.submittedAt).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {editingGrade === grade.id ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => saveGrade(grade.id, grade.maxPoints)}
                                  disabled={saving}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEdit}
                                  disabled={saving}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEdit(grade)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setExpandedGrade(expandedGrade === grade.id ? null : grade.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={grade.status === 'PUBLISHED' ? 'outline' : 'default'}
                                  onClick={() => togglePublish(grade.id, grade.status)}
                                  className={grade.status === 'PUBLISHED' ? '' : 'bg-green-600 hover:bg-green-700'}
                                >
                                  {grade.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row */}
                      {expandedGrade === grade.id && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-gray-50 p-6">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  Instructor Comment
                                </h4>
                                {editingGrade === grade.id ? (
                                  <Textarea
                                    value={editData.comment}
                                    onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
                                    placeholder="Add feedback for the student..."
                                    rows={4}
                                    className="w-full"
                                  />
                                ) : (
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    {grade.instructorComment || (
                                      <span className="text-gray-500 italic">No comment provided</span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="text-sm text-gray-600 mb-1">Graded At</div>
                                  <div className="font-medium text-gray-900">
                                    {new Date(grade.gradedAt).toLocaleString()}
                                  </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="text-sm text-gray-600 mb-1">Published At</div>
                                  <div className="font-medium text-gray-900">
                                    {grade.publishedAt 
                                      ? new Date(grade.publishedAt).toLocaleString()
                                      : 'Not published'}
                                  </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="text-sm text-gray-600 mb-1">Letter Grade</div>
                                  <div className="font-medium text-gray-900 text-2xl">
                                    {getLetterGrade(grade.percentage)}
                                  </div>
                                </div>
                              </div>

                              {grade.submission.fileUrl && (
                                <Button 
                                  variant="outline"
                                  onClick={() => window.open(grade.submission.fileUrl, '_blank')}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  View Student Submission
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
