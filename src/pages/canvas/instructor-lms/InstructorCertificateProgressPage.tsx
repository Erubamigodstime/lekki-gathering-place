import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Award, 
  TrendingUp, 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle,
  Download,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import axios from 'axios';
import { toast } from 'sonner';
import { getAuthHeaders, staleTimes, queryKeys } from '@/hooks/useApiQueries';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface StudentProgress {
  studentId: string;
  enrollmentId: string;
  studentName: string;
  email: string;
  overallGrade: number;
  attendanceScore: number;
  assignmentScore: number;
  eligible: boolean;
  progressUpdatedAt: string | null;
}

interface ProgressStats {
  totalStudents: number;
  eligible: number;
  averageProgress: number;
  averageAttendance: number;
  averageAssignments: number;
}

interface InstructorCertificateProgressPageProps {
  classId: string;
}

export default function InstructorCertificateProgressPage({ classId }: InstructorCertificateProgressPageProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'eligible' | 'not-eligible'>('all');

  // Fetch certificate progress using React Query
  const { 
    data: progressData, 
    isLoading, 
    isFetching: refreshing,
    refetch 
  } = useQuery({
    queryKey: queryKeys.allStudentsProgress(classId),
    queryFn: async () => {
      const headers = getAuthHeaders();
      if (!headers) return { students: [], stats: null };
      
      const response = await axios.get(
        `${API_URL}/certificates/class-progress/${classId}`,
        { headers }
      );
      return response.data.data || { students: [], stats: null };
    },
    staleTime: staleTimes.dynamic,
    enabled: !!classId,
  });

  const students = progressData?.students || [];
  const stats = progressData?.stats || null;

  // Filter students based on search and status using useMemo
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((s: StudentProgress) => 
        s.studentName.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus === 'eligible') {
      filtered = filtered.filter((s: StudentProgress) => s.eligible);
    } else if (filterStatus === 'not-eligible') {
      filtered = filtered.filter((s: StudentProgress) => !s.eligible);
    }

    return filtered;
  }, [students, searchQuery, filterStatus]);

  const refreshProgress = async () => {
    await refetch();
    toast.success('Progress data refreshed');
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const exportToCSV = () => {
    const headers = ['Student Name', 'Email', 'Overall Progress', 'Attendance Score', 'Assignment Score', 'Eligible'];
    const rows = filteredStudents.map(s => [
      s.studentName,
      s.email,
      `${s.overallGrade}%`,
      `${s.attendanceScore}%`,
      `${s.assignmentScore}%`,
      s.eligible ? 'Yes' : 'No'
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-progress-${classId}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success('Progress report exported');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-gold"></div>
          <p className="text-muted-foreground">Loading progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Progress</h1>
            <p className="text-gray-600">
              Track student progress toward certificate eligibility
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              onClick={refreshProgress}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold">{stats.totalStudents}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Eligible</p>
                    <p className="text-2xl font-bold text-green-600">{stats.eligible}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg. Progress</p>
                    <p className="text-2xl font-bold">{stats.averageProgress}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-teal-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg. Attendance</p>
                    <p className="text-2xl font-bold">{stats.averageAttendance}%</p>
                  </div>
                  <Users className="h-8 w-8 text-teal-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg. Assignments</p>
                    <p className="text-2xl font-bold">{stats.averageAssignments}%</p>
                  </div>
                  <FileText className="h-8 w-8 text-amber-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Formula Explanation */}
        <Card className="mb-6 bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-church-gold" />
              <div className="text-sm text-gray-700">
                <strong>Certificate Eligibility Formula:</strong>{' '}
                (Attendance × 75%) + (Assignment Completion × 25%) ≥ 60% required
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="eligible">Eligible Only</SelectItem>
              <SelectItem value="not-eligible">Not Eligible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Progress Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-bold">Student</TableHead>
                    <TableHead className="font-bold text-center">Overall Progress</TableHead>
                    <TableHead className="font-bold text-center">Attendance (75%)</TableHead>
                    <TableHead className="font-bold text-center">Assignments (25%)</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No students found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.studentId} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{student.studentName}</p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-center gap-2">
                            <span className={`font-bold text-lg ${getScoreColor(student.overallGrade)}`}>
                              {student.overallGrade}%
                            </span>
                            <div className="w-24 h-2 bg-gray-200 rounded-full">
                              <div
                                className={`h-2 rounded-full transition-all ${getProgressColor(student.overallGrade)}`}
                                style={{ width: `${student.overallGrade}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-semibold ${getScoreColor(student.attendanceScore)}`}>
                              {student.attendanceScore}%
                            </span>
                            <span className="text-xs text-gray-500">
                              → {Math.round(student.attendanceScore * 0.75)}pts
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-semibold ${getScoreColor(student.assignmentScore)}`}>
                              {student.assignmentScore}%
                            </span>
                            <span className="text-xs text-gray-500">
                              → {Math.round(student.assignmentScore * 0.25)}pts
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {student.eligible ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Eligible
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-amber-300 text-amber-700">
                              <XCircle className="h-3 w-3 mr-1" />
                              In Progress
                            </Badge>
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

        {/* Summary Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredStudents.length} of {students.length} students
          {stats && stats.eligible > 0 && (
            <span className="ml-2">
              • {Math.round((stats.eligible / stats.totalStudents) * 100)}% eligible for certificates
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
