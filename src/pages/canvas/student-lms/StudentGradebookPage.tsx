import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  TrendingUp, 
  Award,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useAuth } from '@/contexts/AuthContext';

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
    assignment: {
      id: string;
      title: string;
      maxPoints: number;
      dueDate: string;
      type: string;
      lesson: {
        weekNumber: number;
        title: string;
      };
    };
  };
}

interface StudentGradebookPageProps {
  classId: string;
}

export default function StudentGradebookPage({ classId }: StudentGradebookPageProps) {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'pending'>('all');
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [classId, user]);

  const fetchData = async () => {
    await Promise.all([
      fetchGrades(),
      fetchStudentData(),
      fetchAssignments(),
    ]);
  };

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/assignments/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllAssignments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    }
  };

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/students/user/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudentData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch student data:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Get student record first
      const studentRes = await axios.get(`${API_URL}/students/user/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const studentId = studentRes.data.data.id;
      
      // Fetch grades for this student in this class
      const response = await axios.get(
        `${API_URL}/grades/student/${studentId}?classId=${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Backend returns { data: { data: grades[], pagination: {...} } }
      const gradesData = response.data.data?.data || response.data.data || [];
      console.log('Student grades response:', response.data);
      console.log('Extracted grades data:', gradesData);
      setGrades(Array.isArray(gradesData) ? gradesData : []);
    } catch (error: any) {
      console.error('Failed to fetch grades:', error);
      toast.error(error.response?.data?.message || 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  // Combine all assignments with grades
  const getAssignmentsWithGrades = () => {
    return allAssignments.map(assignment => {
      const grade = grades.find(g => g.submission.assignment.id === assignment.id);
      return {
        ...assignment,
        grade: grade || null,
        status: grade ? grade.status : 'NOT_SUBMITTED',
      };
    });
  };

  const assignmentsWithGrades = getAssignmentsWithGrades();

  const calculateOverallGrade = () => {
    const publishedGrades = grades.filter(g => g.status === 'PUBLISHED');
    
    if (publishedGrades.length === 0) {
      return {
        totalPoints: 0,
        earnedPoints: 0,
        percentage: 0,
        letterGrade: 'N/A',
        publishedCount: 0,
        pendingCount: grades.filter(g => g.status === 'PENDING').length,
      };
    }

    const totalPoints = publishedGrades.reduce((sum, g) => sum + g.maxPoints, 0);
    const earnedPoints = publishedGrades.reduce((sum, g) => sum + g.points, 0);
    const percentage = (earnedPoints / totalPoints) * 100;

    return {
      totalPoints,
      earnedPoints,
      percentage,
      letterGrade: getLetterGrade(percentage),
      publishedCount: publishedGrades.length,
      pendingCount: grades.filter(g => g.status === 'PENDING').length,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Published
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'NOT_SUBMITTED':
        return (
          <Badge variant="outline" className="text-gray-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Submitted
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredAssignments = assignmentsWithGrades.filter(assignment => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'published') return assignment.status === 'PUBLISHED';
    if (filterStatus === 'pending') return assignment.status === 'PENDING' || assignment.status === 'NOT_SUBMITTED';
    return true;
  });

  console.log('All grades:', grades);
  console.log('All assignments:', allAssignments);
  console.log('Assignments with grades:', assignmentsWithGrades);
  console.log('Filter status:', filterStatus);
  console.log('Filtered assignments:', filteredAssignments);

  const stats = calculateOverallGrade();

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
          Grades
        </h1>
        <p className="text-gray-600 mt-2">View your assignment grades and overall progress</p>
      </div>

      {/* Professional Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Assignments</p>
                <p className="text-3xl font-bold text-gray-900">{allAssignments.length}</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Graded & Published</p>
                <p className="text-3xl font-bold text-gray-900">{stats.publishedCount}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingCount}</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Overall Grade</p>
                <p className="text-3xl font-bold text-gray-900">{stats.percentage.toFixed(1)}%</p>
                <p className="text-xs font-semibold text-purple-600 mt-1">
                  {stats.letterGrade}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('all')}
          className={filterStatus === 'all' ? 'bg-church-gold hover:bg-yellow-600' : ''}
        >
          All ({grades.length})
        </Button>
        <Button
          variant={filterStatus === 'published' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('published')}
          className={filterStatus === 'published' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          Published ({stats.publishedCount})
        </Button>
        <Button
          variant={filterStatus === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('pending')}
          className={filterStatus === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
        >
          Pending ({stats.pendingCount})
        </Button>
      </div>

      {/* Grades Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-bold">Week</TableHead>
                  <TableHead className="font-bold">Assignment</TableHead>
                  <TableHead className="font-bold text-center">Submitted</TableHead>
                  <TableHead className="font-bold text-center">Score</TableHead>
                  <TableHead className="font-bold text-center">Percentage</TableHead>
                  <TableHead className="font-bold">Instructor Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FileText className="h-12 w-12 mb-3 text-gray-300" />
                        <p className="font-medium">No assignments to display</p>
                        <p className="text-sm mt-1">
                          {filterStatus === 'pending' 
                            ? 'You have no pending assignments' 
                            : 'No assignments available for this class yet'}
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
                          <span className="font-medium text-gray-900">
                            {assignment.title}
                          </span>
                          <span className="text-sm text-gray-500">
                            {assignment.lesson?.title || 'No lesson'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {assignment.status !== 'NOT_SUBMITTED' && assignment.submittedAt ? (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-gray-700">
                              {new Date(assignment.submittedAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {assignment.grade && assignment.status === 'PUBLISHED' ? (
                          <span className="font-semibold text-lg">
                            {assignment.grade.points} / {assignment.grade.maxPoints}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {assignment.grade && assignment.status === 'PUBLISHED' ? (
                          <span className="text-sm font-medium text-gray-700">
                            {assignment.grade.percentage.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {assignment.grade?.instructorComment ? (
                          <div className="flex items-start gap-2 max-w-md">
                            <MessageSquare className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{assignment.grade.instructorComment}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No feedback</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Overall Summary */}
      {stats.publishedCount > 0 && (
        <div className="mt-6 border-t-2 border-gray-300 pt-4">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <div className="flex items-center gap-8">
              <span className="text-lg font-semibold text-gray-900">
                {stats.percentage.toFixed(2)}%
              </span>
              <span className="text-lg text-gray-600">
                {stats.earnedPoints.toFixed(2)} / {stats.totalPoints.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grading Scale Reference */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3 text-gray-900">Grading Scale</h3>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded bg-emerald-500"></div>
            <span className="text-gray-700"><strong>A:</strong> 90-100%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded bg-sky-500"></div>
            <span className="text-gray-700"><strong>B:</strong> 80-89%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded bg-amber-500"></div>
            <span className="text-gray-700"><strong>C:</strong> 70-79%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded bg-orange-400"></div>
            <span className="text-gray-700"><strong>D:</strong> 60-69%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded bg-rose-500"></div>
            <span className="text-gray-700"><strong>F:</strong> Below 60%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
