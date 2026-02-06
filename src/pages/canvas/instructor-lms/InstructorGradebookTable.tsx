import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Download, 
  Filter,
  TrendingUp,
  Users,
  Award,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle
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
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Assignment {
  id: string;
  title: string;
  lessonTitle: string;
  week: number;
  maxPoints: number;
  dueDate: string;
  type: string;
}

interface GradeRow {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  week: number;
  assignmentId: string;
  assignmentTitle: string;
  maxPoints: number;
  gradeId?: string;
  points: number | null;
  percentage: number | null;
  letterGrade: string | null;
  status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
  submissionId?: string;
}

interface Gradebook {
  assignments: Assignment[];
  students: any[];
}

interface InstructorGradebookTableProps {
  classId: string;
}

export default function InstructorGradebookTable({ classId }: InstructorGradebookTableProps) {
  const [gradebook, setGradebook] = useState<Gradebook | null>(null);
  const [gradeRows, setGradeRows] = useState<GradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [filterWeek, setFilterWeek] = useState<string>('all');

  useEffect(() => {
    fetchGradebook();
  }, [classId]);

  useEffect(() => {
    if (gradebook) {
      transformGradebookToRows();
    }
  }, [gradebook]);

  const fetchGradebook = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/grades/class/${classId}/gradebook`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Gradebook data:', response.data);
      console.log('Assignments:', response.data.data?.assignments);
      console.log('Assignments weeks:', response.data.data?.assignments?.map((a: any) => a.week));
      setGradebook(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch gradebook:', error);
      toast.error(error.response?.data?.message || 'Failed to load gradebook');
    } finally {
      setLoading(false);
    }
  };

  const transformGradebookToRows = () => {
    if (!gradebook) return;

    const rows: GradeRow[] = [];
    
    // Iterate through all students
    gradebook.students.forEach((studentData: any) => {
      const student = studentData.student;
      
      // Iterate through ALL assignments (not just submitted ones)
      gradebook.assignments.forEach((assignment: any) => {
        // Find if this assignment has a grade/submission for this student
        const ag = studentData.assignmentGrades.find((grade: any) => grade.assignmentId === assignment.id);
        
        const letterGrade = ag?.grade ? getLetterGrade(ag.grade.percentage) : null;
        
        rows.push({
          id: `${student.id}-${assignment.id}`,
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          studentEmail: student.email,
          week: assignment.week || 0,
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
          maxPoints: assignment.maxPoints,
          gradeId: ag?.grade?.id,
          points: ag?.grade?.points || null,
          percentage: ag?.grade?.percentage || null,
          letterGrade: letterGrade,
          status: ag?.status || 'NOT_SUBMITTED',
          submissionId: ag?.submissionId,
        });
      });
    });

    console.log('Transformed grade rows:', rows.length, 'rows created');
    console.log('Weeks in rows:', Array.from(new Set(rows.map(r => r.week))).sort());
    setGradeRows(rows);
  };

  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const startEdit = (rowId: string, currentPoints: number) => {
    setEditingRowId(rowId);
    setEditPoints(currentPoints || 0);
  };

  const cancelEdit = () => {
    setEditingRowId(null);
    setEditPoints(0);
  };

  const saveGrade = async (row: GradeRow) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      if (row.gradeId) {
        // Update existing grade
        await axios.put(
          `${API_URL}/grades/${row.gradeId}`,
          {
            points: editPoints,
            maxPoints: row.maxPoints,
            status: 'PUBLISHED',
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Grade updated successfully');
      } else if (row.submissionId) {
        // Create new grade
        await axios.post(
          `${API_URL}/grades`,
          {
            submissionId: row.submissionId,
            points: editPoints,
            maxPoints: row.maxPoints,
            status: 'PUBLISHED',
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Grade created successfully');
      } else {
        toast.error('Cannot grade: No submission found');
        return;
      }
      
      setEditingRowId(null);
      await fetchGradebook();
    } catch (error: any) {
      console.error('Failed to update grade:', error);
      toast.error(error.response?.data?.message || 'Failed to update grade');
    } finally {
      setSaving(false);
    }
  };

  const publishAllPendingGrades = async () => {
    if (!confirm('This will publish all pending grades for this class. Students will be able to see them. Continue?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/grades/class/${classId}/publish-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const count = response.data.data?.published || 0;
      if (count > 0) {
        toast.success(`Published ${count} pending grade${count !== 1 ? 's' : ''} successfully!`);
        await fetchGradebook();
      } else {
        toast.info('No pending grades to publish');
      }
    } catch (error: any) {
      console.error('Failed to publish grades:', error);
      toast.error(error.response?.data?.message || 'Failed to publish grades');
    }
  };

  const calculateClassStats = () => {
    if (!gradebook || gradebook.students.length === 0) {
      return {
        totalStudents: 0,
        totalAssignments: 0,
        gradedAssignments: 0,
        pendingGrades: 0,
      };
    }

    const totalStudents = gradebook.students.length;
    const totalAssignments = gradebook.assignments.length;
    
    let gradedCount = 0;
    let pendingCount = 0;

    gradebook.students.forEach((student: any) => {
      student.assignmentGrades.forEach((ag: any) => {
        if (ag.grade && ag.status === 'PUBLISHED') {
          gradedCount++;
        } else if (ag.status === 'PENDING' || ag.status === 'SUBMITTED') {
          pendingCount++;
        }
      });
    });

    return {
      totalStudents,
      totalAssignments,
      gradedAssignments: gradedCount,
      pendingGrades: pendingCount,
    };
  };

  const filteredRows = gradeRows.filter(row => {
    if (filterStudent !== 'all' && row.studentId !== filterStudent) return false;
    if (filterWeek !== 'all' && row.week.toString() !== filterWeek) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge className="bg-green-100 text-green-800 text-xs">Published</Badge>;
      case 'SUBMITTED':
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>;
      case 'NOT_SUBMITTED':
        return <Badge variant="outline" className="text-xs">Not Submitted</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const getGradeColor = (percentage: number | null) => {
    if (percentage === null) return 'text-gray-400';

    if (percentage >= 90) return 'text-green-600 font-semibold';
    if (percentage >= 80) return 'text-blue-600 font-semibold';
    if (percentage >= 70) return 'text-yellow-600 font-semibold';
    if (percentage >= 60) return 'text-orange-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  // Get all unique weeks from assignments (not just from gradeRows)
  const weeks = gradebook?.assignments 
    ? Array.from(new Set(gradebook.assignments.map(a => a.week).filter(w => w !== undefined && w !== null)))
        .sort((a, b) => a - b)
    : [];
  
  console.log('Available weeks:', weeks);
  console.log('Grade rows:', gradeRows.slice(0, 3)); // Log first 3 rows
  console.log('Filter week:', filterWeek);
  console.log('Filtered rows count:', filteredRows.length);
  
  const students = gradebook?.students || [];

  const stats = calculateClassStats();

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

  if (!gradebook) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load gradebook</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-church-gold" />
          Gradebook
        </h1>
        <p className="text-gray-600 mt-2">
          View and manage grades for all students in this class
        </p>
      </div>

      {/* Class Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Total Students
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Award className="h-4 w-4" />
                Total Assignments
              </p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalAssignments}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Graded
              </p>
              <p className="text-3xl font-bold text-green-600">{stats.gradedAssignments}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Pending
              </p>
              <p className="text-3xl font-bold text-orange-600">{stats.pendingGrades}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-500" />
          <Select value={filterStudent} onValueChange={setFilterStudent}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {students.map((s: any) => (
                <SelectItem key={s.student.id} value={s.student.id}>
                  {s.student.firstName} {s.student.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterWeek} onValueChange={setFilterWeek}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by week" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Weeks</SelectItem>
              {weeks.map((week) => (
                <SelectItem key={week} value={week.toString()}>
                  Week {week}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            onClick={publishAllPendingGrades}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Publish All Pending
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Gradebook Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-bold w-[250px]">Student</TableHead>
                  <TableHead className="font-bold text-center w-[100px]">Week</TableHead>
                  <TableHead className="font-bold w-[300px]">Assignment</TableHead>
                  <TableHead className="font-bold text-center w-[150px]">Grade</TableHead>
                  <TableHead className="font-bold text-center w-[100px]">Status</TableHead>
                  <TableHead className="font-bold text-center w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      No grades found for the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row) => {
                    const isEditing = editingRowId === row.id;

                    return (
                      <TableRow key={row.id} className="hover:bg-gray-50">
                        {/* Student */}
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold text-sm">{row.studentName}</div>
                            <div className="text-xs text-gray-500">{row.studentEmail}</div>
                          </div>
                        </TableCell>

                        {/* Week */}
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-medium">
                            Week {row.week}
                          </Badge>
                        </TableCell>

                        {/* Assignment */}
                        <TableCell>
                          <div className="text-sm">{row.assignmentTitle}</div>
                          <div className="text-xs text-gray-500">Max Points: {row.maxPoints}</div>
                        </TableCell>

                        {/* Grade (Editable) */}
                        <TableCell className="text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-2">
                              <Input
                                type="number"
                                value={editPoints}
                                onChange={(e) => setEditPoints(parseFloat(e.target.value) || 0)}
                                className="w-20 h-8 text-center"
                                min="0"
                                max={row.maxPoints}
                                step="0.5"
                              />
                              <span className="text-sm text-gray-600">/ {row.maxPoints}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              {row.points !== null ? (
                                <>
                                  <div className={`text-base font-semibold ${getGradeColor(row.percentage)}`}>
                                    {row.points} / {row.maxPoints}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {row.percentage?.toFixed(1)}% ({row.letterGrade})
                                  </div>
                                </>
                              ) : (
                                <span className="text-gray-400">Not graded</span>
                              )}
                            </div>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">
                          {getStatusBadge(row.status)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="sm"
                                onClick={() => saveGrade(row)}
                                disabled={saving}
                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                disabled={saving}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(row.id, row.points || 0)}
                              disabled={row.status === 'NOT_SUBMITTED'}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Grading Scale</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span>A (90-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span>B (80-89%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
            <span>C (70-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-600"></div>
            <span>D (60-69%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span>F (&lt;60%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
