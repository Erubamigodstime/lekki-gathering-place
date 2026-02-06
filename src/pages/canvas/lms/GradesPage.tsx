import { useState, useEffect } from 'react';
import { GraduationCap, TrendingUp, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Grade {
  id: string;
  points: number;
  maxPoints: number;
  percentage: number;
  instructorComment?: string;
  feedback?: any;
  status: 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
  gradedAt: string;
  publishedAt?: string;
  gradedBy: {
    firstName: string;
    lastName: string;
  };
  submission: {
    id: string;
    submittedAt?: string;
    assignment: {
      id: string;
      title: string;
      type: string;
      maxPoints: number;
      dueDate?: string;
      lesson: {
        title: string;
        weekNumber: number;
        class: {
          id: string;
          name: string;
        };
      };
    };
  };
}

interface GradesPageProps {
  classId: string;
}

export default function GradesPage({ classId }: GradesPageProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPoints: 0,
    earnedPoints: 0,
    percentage: 0,
    averageScore: 0,
    letterGrade: 'N/A',
    publishedCount: 0,
    pendingCount: 0,
  });

  useEffect(() => {
    fetchGrades();
  }, [classId]);

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const studentId = localStorage.getItem('studentId');

      if (!studentId) {
        toast.error('Student ID not found');
        return;
      }

      const response = await axios.get(
        `${API_URL}/grades/student/${studentId}?classId=${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const gradesData = response.data.data || [];
      
      // Filter only published grades for display
      const publishedGrades = gradesData.filter((g: Grade) => g.status === 'PUBLISHED');
      setGrades(gradesData); // Keep all grades for stats

      // Calculate stats from published grades only
      if (publishedGrades.length > 0) {
        const totalPoints = publishedGrades.reduce((sum: number, g: Grade) => sum + g.maxPoints, 0);
        const earnedPoints = publishedGrades.reduce((sum: number, g: Grade) => sum + g.points, 0);
        const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
        const averageScore = earnedPoints / publishedGrades.length;
        const letterGrade = getLetterGrade(percentage);

        setStats({
          totalPoints,
          earnedPoints,
          percentage,
          averageScore,
          letterGrade,
          publishedCount: publishedGrades.length,
          pendingCount: gradesData.filter((g: Grade) => g.status === 'PENDING').length,
        });
      } else {
        setStats({
          totalPoints: 0,
          earnedPoints: 0,
          percentage: 0,
          averageScore: 0,
          letterGrade: 'N/A',
          publishedCount: 0,
          pendingCount: gradesData.filter((g: Grade) => g.status === 'PENDING').length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch grades:', error);
      toast.error('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLetterGradeBadgeColor = (letter: string) => {
    switch (letter) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Published
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  const getAssignmentTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      HOMEWORK: 'bg-blue-100 text-blue-800',
      QUIZ: 'bg-purple-100 text-purple-800',
      EXAM: 'bg-red-100 text-red-800',
      PROJECT: 'bg-green-100 text-green-800',
      ESSAY: 'bg-indigo-100 text-indigo-800',
      DISCUSSION: 'bg-orange-100 text-orange-800',
    };

    return (
      <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>
        {type.charAt(0) + type.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const publishedGrades = grades.filter(g => g.status === 'PUBLISHED');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-gold"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Grades</h1>
        <p className="text-gray-600 mb-8">
          View your performance and instructor feedback for all assignments
        </p>

        {/* Overall Performance Stats */}
        {publishedGrades.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Overall Grade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className={`text-4xl font-bold ${getGradeColor(stats.percentage)}`}>
                    {stats.letterGrade}
                  </div>
                  <Badge className={getLetterGradeBadgeColor(stats.letterGrade)}>
                    {stats.percentage.toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={stats.percentage} className="mt-3" />
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.earnedPoints.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  out of {stats.totalPoints.toFixed(1)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Assignments Graded
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.publishedCount}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Avg: {stats.averageScore.toFixed(1)} pts
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pending Grades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {stats.pendingCount}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Awaiting instructor
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Grades List */}
        {publishedGrades.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <GraduationCap className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No published grades yet
              </h3>
              <p className="text-gray-600">
                Your instructor hasn't published any grades yet
              </p>
              {stats.pendingCount > 0 && (
                <p className="text-gray-600 mt-2">
                  You have {stats.pendingCount} grade{stats.pendingCount !== 1 ? 's' : ''} pending review
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Assignment Grades</h2>
              <div className="text-sm text-gray-600">
                Showing {publishedGrades.length} published grade{publishedGrades.length !== 1 ? 's' : ''}
              </div>
            </div>

            {publishedGrades.map((grade) => {
              const percentage = grade.percentage;
              
              return (
                <Card key={grade.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {grade.submission.assignment.title}
                          </h3>
                          {getAssignmentTypeBadge(grade.submission.assignment.type)}
                          {getStatusBadge(grade.status)}
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-gray-600">
                          <span>
                            Week {grade.submission.assignment.lesson.weekNumber} - {grade.submission.assignment.lesson.title}
                          </span>
                          <div className="flex items-center gap-2">
                            <span>
                              Graded by {grade.gradedBy.firstName} {grade.gradedBy.lastName}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(grade.gradedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          {grade.submission.assignment.dueDate && (
                            <span className="text-gray-500">
                              Due: {new Date(grade.submission.assignment.dueDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-4xl font-bold text-gray-900 mb-1">
                          {grade.points.toFixed(1)} / {grade.maxPoints}
                        </div>
                        <Badge className={`text-lg px-3 py-1 ${
                          percentage >= 90 ? 'bg-green-100 text-green-800' :
                          percentage >= 80 ? 'bg-blue-100 text-blue-800' :
                          percentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          percentage >= 60 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Progress value={percentage} className="h-2" />
                    </div>

                    {grade.instructorComment && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Instructor Feedback</span>
                        </div>
                        <p className="text-blue-900 text-sm whitespace-pre-wrap">
                          {grade.instructorComment}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pending Grades Info */}
        {stats.pendingCount > 0 && publishedGrades.length > 0 && (
          <Card className="mt-6 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">
                  You have {stats.pendingCount} assignment{stats.pendingCount !== 1 ? 's' : ''} currently being reviewed by your instructor
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
