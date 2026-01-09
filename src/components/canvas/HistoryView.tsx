import { useState, useEffect } from 'react';
import { History, Calendar, Award, BookOpen, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface CourseHistory {
  id: string;
  classId: string;
  className: string;
  classDescription?: string;
  enrollmentDate: string;
  completionDate?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'INACTIVE';
  progress?: number;
  grade?: string;
  certificateIssued?: boolean;
  totalLessons?: number;
  completedLessons?: number;
}

interface HistoryViewProps {
  userId: string;
  userRole?: 'STUDENT' | 'INSTRUCTOR';
}

export function HistoryView({ userId, userRole = 'STUDENT' }: HistoryViewProps) {
  const [courses, setCourses] = useState<CourseHistory[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseHistory[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourseHistory();
  }, [userId]);

  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredCourses(courses);
    } else {
      setFilteredCourses(courses.filter((course) => course.status === filterStatus));
    }
  }, [filterStatus, courses]);

  const fetchCourseHistory = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      // Fetch all enrollments for the user
      const response = await axios.get(`${API_URL}/enrollments/student/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const enrollments = response.data.data || [];

      // Transform to course history format
      const history: CourseHistory[] = await Promise.all(
        enrollments.map(async (enrollment: any) => {
          // Fetch class details
          const classResponse = await axios.get(`${API_URL}/classes/${enrollment.classId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const classData = classResponse.data.data;

          // Fetch lesson completion stats
          let completedLessons = 0;
          let totalLessons = 0;
          
          try {
            const lessonsResponse = await axios.get(`${API_URL}/lessons/student/completed?classId=${enrollment.classId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            completedLessons = lessonsResponse.data.data?.length || 0;

            const allLessonsResponse = await axios.get(`${API_URL}/lessons/class/${enrollment.classId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            totalLessons = allLessonsResponse.data.data?.length || 0;
          } catch (err) {
            // Ignore errors, use defaults
          }

          return {
            id: enrollment.id,
            classId: enrollment.classId,
            className: classData?.name || 'Unknown Course',
            classDescription: classData?.description,
            enrollmentDate: enrollment.enrolledAt || enrollment.createdAt,
            completionDate: enrollment.completedAt,
            status: enrollment.status,
            progress: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
            totalLessons,
            completedLessons,
          };
        })
      );

      setCourses(history);
      setFilteredCourses(history);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch course history',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case 'COMPLETED':
        return 'default';
      case 'ACTIVE':
        return 'secondary';
      case 'DROPPED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">Loading course history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Course History</h3>
          <Badge variant="outline">{filteredCourses.length} Courses</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="DROPPED">Dropped</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course List */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No course history found</p>
            {filterStatus !== 'all' && (
              <Button
                variant="link"
                onClick={() => setFilterStatus('all')}
                className="mt-2"
              >
                Clear filter
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">{course.className}</CardTitle>
                    </div>
                    {course.classDescription && (
                      <CardDescription className="line-clamp-2">
                        {course.classDescription}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant={getStatusBadgeVariant(course.status)}>
                    {course.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Enrollment Date */}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Enrolled
                    </p>
                    <p className="text-sm font-medium">
                      {format(new Date(course.enrollmentDate), 'MMM dd, yyyy')}
                    </p>
                  </div>

                  {/* Completion Date */}
                  {course.completionDate && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        Completed
                      </p>
                      <p className="text-sm font-medium">
                        {format(new Date(course.completionDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}

                  {/* Progress */}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${course.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{Math.round(course.progress || 0)}%</span>
                    </div>
                  </div>

                  {/* Lessons Completed */}
                  {course.totalLessons !== undefined && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Lessons</p>
                      <p className="text-sm font-medium">
                        {course.completedLessons || 0} / {course.totalLessons} completed
                      </p>
                    </div>
                  )}

                  {/* Grade */}
                  {course.grade && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Final Grade</p>
                      <p className="text-lg font-bold text-primary">{course.grade}</p>
                    </div>
                  )}

                  {/* Certificate */}
                  {course.certificateIssued && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        Certificate
                      </p>
                      <Badge variant="default">Issued</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
