import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Mail, Search, Loader2, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import axios from 'axios';
import { getAuthHeaders, staleTimes, queryKeys } from '@/hooks/useApiQueries';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Student {
  id: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  enrolledAt: string;
  classId: string;
  currentGrade?: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profilePicture?: string;
  };
}

interface InstructorPeoplePageProps {
  classId: string;
}

export default function InstructorPeoplePage({ classId }: InstructorPeoplePageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch students with grades using React Query
  const { data: students = [], isLoading } = useQuery({
    queryKey: queryKeys.classEnrollments(classId, 'APPROVED'),
    queryFn: async (): Promise<Student[]> => {
      const headers = getAuthHeaders();
      if (!headers) return [];
      
      // Fetch enrollments for this specific class
      const enrollResponse = await axios.get(`${API_URL}/enrollments/class/${classId}?status=APPROVED`, {
        headers,
      });
      
      // Handle paginated response structure
      const enrollData = enrollResponse.data.data;
      const enrollments = Array.isArray(enrollData) ? enrollData : (enrollData?.data || []);
      
      // Fetch grades for each student
      const studentsWithGrades = await Promise.all(
        enrollments.map(async (e: any) => {
          let currentGrade = undefined;
          try {
            // Use studentId (Student record ID) not userId for grade lookup
            const studentRecordId = e.studentId || e.student?.id;
            const gradeResponse = await axios.get(
              `${API_URL}/grades/student/${studentRecordId}/class/${classId}`,
              { headers }
            );
            const gradeData = gradeResponse.data.data;
            // Backend returns {totalPoints, earnedPoints, percentage, letterGrade}
            if (gradeData && gradeData.percentage !== undefined && gradeData.percentage > 0) {
              currentGrade = Math.round(gradeData.percentage * 100) / 100;
            }
          } catch (err) {
            console.log('No grades found for student:', e.studentId || e.student?.id);
          }

          return {
            id: e.id,
            userId: e.student?.userId || e.userId || '',
            status: e.status || 'APPROVED',
            enrolledAt: e.enrolledAt || new Date().toISOString(),
            classId: e.classId || '',
            currentGrade,
            user: {
              id: e.student?.user?.id || e.user?.id || '',
              firstName: e.student?.user?.firstName || e.user?.firstName || 'Unknown',
              lastName: e.student?.user?.lastName || e.user?.lastName || 'User',
              email: e.student?.user?.email || e.user?.email || 'N/A',
              phone: e.student?.user?.phone || e.user?.phone || '',
              profilePicture: e.student?.user?.profilePicture || e.user?.profilePicture || '',
            }
          };
        })
      );
      
      return studentsWithGrades;
    },
    staleTime: staleTimes.dynamic,
    enabled: !!classId,
  });

  // Filter students based on search query using useMemo
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;

    return students.filter((s) => {
      const fullName = `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.toLowerCase();
      const email = (s.user?.email || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
  }, [students, searchQuery]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const getGradeColor = (grade?: number) => {
    if (!grade) return 'text-gray-500';
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const averageGrade = students.length > 0
    ? students.reduce((sum, s) => sum + (s.currentGrade || 0), 0) / students.filter(s => s.currentGrade).length
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Students</h1>
          <p className="text-gray-600">
            Manage enrolled students and their performance
          </p>
        </div>

        {/* Professional Statistics Cards with Left Border */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Students</p>
                  <p className="text-3xl font-bold text-gray-900">{students.filter(s => s.status === 'APPROVED').length}</p>
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Average Grade</p>
                  <p className={`text-3xl font-bold ${getGradeColor(averageGrade)}`}>
                    {averageGrade > 0 ? `${averageGrade.toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Students Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-bold">Student</TableHead>
                    <TableHead className="font-bold">Email</TableHead>
                    <TableHead className="font-bold text-center">Current Grade</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                    <TableHead className="font-bold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Users className="h-12 w-12 mb-3 text-gray-300" />
                          <p className="font-medium">
                            {searchQuery ? 'No students found' : 'No students enrolled yet'}
                          </p>
                          <p className="text-sm mt-1">
                            {searchQuery
                              ? 'Try adjusting your search'
                              : 'Students will appear here once they enroll'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow 
                        key={student.id} 
                        className="hover:bg-gray-50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              {student.user.profilePicture && (
                                <AvatarImage src={student.user.profilePicture} alt={`${student.user.firstName} ${student.user.lastName}`} />
                              )}
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                                {getInitials(student.user.firstName, student.user.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">
                                {student.user.firstName} {student.user.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {student.userId.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-700">{student.user.email}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-semibold text-lg ${getGradeColor(student.currentGrade)}`}>
                            {student.currentGrade ? `${student.currentGrade}%` : 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            className="bg-green-100 text-green-700"
                            variant="secondary"
                          >
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-blue-50"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
