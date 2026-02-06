import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  TrendingUp, 
  FileText, 
  CheckCircle, 
  Clock, 
  Award,
  Calendar,
  MessageSquare,
  Download,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    fileUrl?: string;
    content?: string;
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
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'pending'>('all');

  useEffect(() => {
    fetchGrades();
  }, [classId]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!userId) {
        toast.error('User ID not found');
        return;
      }

      // Get student ID from user ID
      const studentResponse = await axios.get(
        `${API_URL}/students/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const studentId = studentResponse.data.data.id;

      const response = await axios.get(
        `${API_URL}/grades/student/${studentId}?classId=${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const gradesData = response.data.data || [];
      setGrades(gradesData);
    } catch (error) {
      console.error('Failed to fetch grades:', error);
      toast.error('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const publishedGrades = grades.filter(g => g.status === 'PUBLISHED');
    
    if (publishedGrades.length === 0) {
      return {
        totalPoints: 0,
        earnedPoints: 0,
        percentage: 0,
        averageScore: 0,
        letterGrade: 'N/A',
        publishedCount: 0,
        pendingCount: grades.filter(g => g.status === 'PENDING').length,
        highestGrade: 0,
        lowestGrade: 0,
      };
    }

    const totalPoints = publishedGrades.reduce((sum, g) => sum + g.maxPoints, 0);
    const earnedPoints = publishedGrades.reduce((sum, g) => sum + g.points, 0);
    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const averageScore = earnedPoints / publishedGrades.length;
    const percentages = publishedGrades.map(g => g.percentage);

    return {
      totalPoints,
      earnedPoints,
      percentage,
      averageScore,
      letterGrade: getLetterGrade(percentage),
      publishedCount: publishedGrades.length,
      pendingCount: grades.filter(g => g.status === 'PENDING').length,
      highestGrade: Math.max(...percentages),
      lowestGrade: Math.min(...percentages),
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
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLetterGradeBadgeColor = (letter: string) => {
    switch (letter) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'F': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
          <p className="text-gray-600">Loading your grades...</p>
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
          My Grades
        </h1>
        <p className="text-gray-600 mt-2">
          Track your performance and view instructor feedback for all assignments
        </p>
      </div>

      {/* Stats Cards */}
      {stats.publishedCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
                <Badge className={`${getLetterGradeBadgeColor(stats.letterGrade)} border`}>
                  {stats.percentage.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={stats.percentage} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.earnedPoints.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                out of {stats.totalPoints.toFixed(0)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Graded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.publishedCount}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {stats.pendingCount} pending
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Highest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.highestGrade.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Best score
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.percentage.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Overall average
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-church-gold hover:bg-yellow-600' : ''}
          >
            All Grades ({grades.length})
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

      {/* Grades List */}
      <div className="space-y-4">
        {filteredGrades.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <GraduationCap className="h-20 w-20 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'pending' ? 'No Pending Grades' : 'No Grades Yet'}
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                {filter === 'pending' 
                  ? 'All your submissions have been graded!' 
                  : 'Complete and submit assignments to see your grades here'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredGrades.map((grade) => (
            <Card 
              key={grade.id} 
              className={`overflow-hidden transition-all ${
                expandedGrade === grade.id ? 'shadow-lg' : 'hover:shadow-md'
              }`}
            >
              <div 
                className="p-6 cursor-pointer"
                onClick={() => setExpandedGrade(expandedGrade === grade.id ? null : grade.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {grade.submission.assignment.title}
                      </h3>
                      {grade.status === 'PUBLISHED' ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 border">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Published
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 border">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Week {grade.submission.assignment.lesson.weekNumber}
                      </span>
                      <span>•</span>
                      <span>{grade.submission.assignment.lesson.title}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {grade.submission.assignment.type}
                      </span>
                    </div>

                    {grade.status === 'PUBLISHED' && (
                      <div className="flex items-center gap-6">
                        <div>
                          <div className={`text-3xl font-bold ${getGradeColor(grade.percentage)}`}>
                            {grade.points}/{grade.maxPoints}
                          </div>
                          <div className="text-sm text-gray-600">points earned</div>
                        </div>
                        <div>
                          <div className={`text-3xl font-bold ${getGradeColor(grade.percentage)}`}>
                            {grade.percentage.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Grade: {getLetterGrade(grade.percentage)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <Progress value={grade.percentage} className="h-2" />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button variant="ghost" size="sm">
                    {expandedGrade === grade.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedGrade === grade.id && (
                <div className="border-t bg-gray-50 p-6 space-y-4">
                  {grade.instructorComment && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">Instructor Feedback</h4>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{grade.instructorComment}</p>
                      <div className="mt-3 text-sm text-gray-600">
                        — {grade.gradedBy.firstName} {grade.gradedBy.lastName}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Submitted</div>
                      <div className="font-medium text-gray-900">
                        {grade.submission.submittedAt
                          ? new Date(grade.submission.submittedAt).toLocaleString()
                          : 'Not submitted'}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Graded</div>
                      <div className="font-medium text-gray-900">
                        {new Date(grade.gradedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {grade.submission.fileUrl && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(grade.submission.fileUrl, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      View My Submission
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
