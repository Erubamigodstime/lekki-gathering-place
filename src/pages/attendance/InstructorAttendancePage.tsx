import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Check, X, Clock, Users, Calendar as CalendarIcon, CheckCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { getAuthHeaders, staleTimes } from '@/hooks/useApiQueries';

const API_URL = import.meta.env.VITE_API_URL || 'https://lekki-gathering-place-backend-1.onrender.com/api/v1';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  rejectionReason?: string;
  student: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      profilePicture?: string;
    };
  };
  class: {
    id: string;
    name: string;
  };
}

interface InstructorClass {
  id: string;
  name: string;
}

export default function InstructorAttendancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch instructor's classes with React Query
  const { data: classes = [], isLoading: loadingClasses, error: classesError } = useQuery({
    queryKey: ['instructor', 'classes', user?.id],
    queryFn: async () => {
      const headers = getAuthHeaders();
      if (!headers) return [];
      
      const response = await axios.get(`${API_URL}/classes`, {
        headers,
        timeout: 15000,
      });

      const allClasses = response.data.data?.data || response.data.data || [];
      const instructorClasses = allClasses.filter((cls: any) => 
        cls.instructor?.userId === user?.id
      );

      return instructorClasses.map((cls: any) => ({
        id: cls.id,
        name: cls.name
      })) as InstructorClass[];
    },
    staleTime: staleTimes.static,
    enabled: !!user?.id,
  });

  // Fetch attendance records with React Query (depends on classes)
  const { data: attendanceRecords = [], isLoading: loadingAttendance, error: attendanceError, refetch: refetchAttendance } = useQuery({
    queryKey: ['instructor', 'attendance', classes.map(c => c.id), statusFilter],
    queryFn: async () => {
      const headers = getAuthHeaders();
      if (!headers || classes.length === 0) return [];

      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter.toUpperCase();
      }

      const response = await axios.get(`${API_URL}/attendance`, {
        headers,
        params,
        timeout: 15000,
      });

      // Handle paginated response
      const paginatedData = response.data.data || {};
      const allAttendance = paginatedData.data || paginatedData || [];
      
      // Filter for instructor's classes only
      const classIds = classes.map(c => c.id);
      const instructorAttendance = Array.isArray(allAttendance) 
        ? allAttendance.filter((record: AttendanceRecord) =>
            classIds.includes(record.class?.id)
          )
        : [];

      return instructorAttendance as AttendanceRecord[];
    },
    staleTime: staleTimes.dynamic,
    enabled: classes.length > 0,
  });

  const loading = loadingClasses || loadingAttendance;
  const error = classesError || attendanceError 
    ? (classesError as Error)?.message || (attendanceError as Error)?.message || 'An error occurred'
    : null;

  // Invalidate and refetch after mutations
  const invalidateAttendance = () => {
    queryClient.invalidateQueries({ queryKey: ['instructor', 'attendance'] });
    queryClient.invalidateQueries({ queryKey: ['attendance'] });
  };

  const handleApprove = async (recordId: string) => {
    try {
      setProcessingId(recordId);
      const token = localStorage.getItem('token');
      if (!token) return;

      // Optimistic update
      queryClient.setQueryData<AttendanceRecord[]>(
        ['instructor', 'attendance', classes.map(c => c.id), statusFilter],
        (old = []) => old.map(r => r.id === recordId ? { ...r, status: 'APPROVED' } : r)
      );

      await axios.patch(
        `${API_URL}/attendance/${recordId}/approve`,
        { status: 'APPROVED' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: 'Success',
        description: 'Attendance approved successfully',
      });
      
      // Invalidate to ensure fresh data
      invalidateAttendance();
    } catch (error: any) {
      console.error('Failed to approve attendance:', error);
      // Revert on error
      invalidateAttendance();
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve attendance',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRecord || !rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessingId(selectedRecord.id);
      const token = localStorage.getItem('token');
      if (!token) return;

      // Optimistic update
      queryClient.setQueryData<AttendanceRecord[]>(
        ['instructor', 'attendance', classes.map(c => c.id), statusFilter],
        (old = []) => old.map(r => r.id === selectedRecord.id 
          ? { ...r, status: 'REJECTED', rejectionReason } 
          : r)
      );

      await axios.patch(
        `${API_URL}/attendance/${selectedRecord.id}/approve`,
        { 
          status: 'REJECTED',
          rejectionReason: rejectionReason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: 'Success',
        description: 'Attendance rejected',
      });

      setRejectDialogOpen(false);
      setSelectedRecord(null);
      setRejectionReason('');
      
      // Invalidate to ensure fresh data
      invalidateAttendance();
    } catch (error: any) {
      console.error('Failed to reject attendance:', error);
      // Revert on error
      invalidateAttendance();
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject attendance',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setRejectDialogOpen(true);
  };

  const filteredRecords = attendanceRecords.filter(record => {
    // Safely check if record and nested properties exist
    if (!record?.student?.user || !record?.class) {
      return false;
    }
    
    const studentName = `${record.student.user.firstName || ''} ${record.student.user.lastName || ''}`.toLowerCase();
    const className = (record.class.name || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = studentName.includes(query) || className.includes(query);
    const matchesClass = classFilter === 'all' || record.class.id === classFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter.toUpperCase();
    return matchesSearch && matchesClass && matchesStatus;
  });

  const pendingCount = attendanceRecords.filter(r => r.status === 'PENDING').length;
  const approvedCount = attendanceRecords.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = attendanceRecords.filter(r => r.status === 'REJECTED').length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Attendance Records</h1>
          <p className="text-muted-foreground mt-1">
            View and manage student attendance for your classes
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="shadow-card border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                  Unable to Load Attendance Data
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                  {error}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-600 hover:bg-red-100 dark:border-red-400 dark:text-red-400"
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ['instructor'] });
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show content only if no error */}
      {!error && (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-4">
        <Card className="shadow-card border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              Successfully approved
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">
              Not approved
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{attendanceRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              All attendance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map(cls => (
              <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Attendance Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-3 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-lg font-medium">Loading attendance records...</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Please wait while we fetch the data</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2 font-semibold">No records found</p>
              <p className="text-sm text-muted-foreground">
                {attendanceRecords.length === 0 
                  ? "No attendance records available"
                  : "No records match your search criteria"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={record.student.user.profilePicture} alt={`${record.student.user.firstName} ${record.student.user.lastName}`} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                {record.student.user.firstName[0]}{record.student.user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {record.student.user.firstName} {record.student.user.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {record.student.user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {record.class.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{formatDate(record.date)}</span>
                        </TableCell>
                        <TableCell>
                          {record.status === 'PENDING' && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                          {record.status === 'APPROVED' && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                              <Check className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                          )}
                          {record.status === 'REJECTED' && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                              <X className="h-3 w-3 mr-1" />
                              Rejected
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.rejectionReason ? (
                            <p className="text-sm text-red-600 max-w-xs truncate">
                              {record.rejectionReason}
                            </p>
                          ) : record.notes ? (
                            <p className="text-sm text-muted-foreground max-w-xs truncate">
                              {record.notes}
                            </p>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No notes</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {record.status === 'PENDING' ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApprove(record.id)}
                                disabled={processingId === record.id}
                              >
                                {processingId === record.id ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4 mr-1" />
                                )}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openRejectDialog(record)}
                                disabled={processingId === record.id}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {record.status === 'APPROVED' ? 'Completed' : 'Processed'}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Mobile Cards */}
              <div className="md:hidden p-4 space-y-3">
                {filteredRecords.map((record) => (
                  <div key={record.id} className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={record.student.user.profilePicture} alt={`${record.student.user.firstName} ${record.student.user.lastName}`} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {record.student.user.firstName[0]}{record.student.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {record.student.user.firstName} {record.student.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {record.student.user.email}
                        </p>
                      </div>
                      {record.status === 'PENDING' && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 shrink-0">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      {record.status === 'APPROVED' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 shrink-0">
                          <Check className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      )}
                      {record.status === 'REJECTED' && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 shrink-0">
                          <X className="h-3 w-3 mr-1" />
                          Rejected
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center text-sm">
                      <Badge variant="outline" className="font-medium">
                        {record.class.name}
                      </Badge>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{formatDate(record.date)}</span>
                    </div>
                    
                    {(record.notes || record.rejectionReason) && (
                      <p className={`text-sm ${record.rejectionReason ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {record.rejectionReason || record.notes}
                      </p>
                    )}
                    
                    {record.status === 'PENDING' && (
                      <div className="flex gap-2 pt-2 border-t border-border/50">
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(record.id)}
                          disabled={processingId === record.id}
                        >
                          {processingId === record.id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => openRejectDialog(record)}
                          disabled={processingId === record.id}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Attendance</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this attendance record.
              The student will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRecord && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  {selectedRecord.student.user.firstName} {selectedRecord.student.user.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedRecord.class.name} • {formatDate(selectedRecord.date)}
                </p>
              </div>
            )}
            <Textarea
              placeholder="Enter rejection reason (e.g., Marked too late, Not present in class)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setSelectedRecord(null);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || processingId === selectedRecord?.id}
            >
              <X className="h-4 w-4 mr-2" />
              Reject Attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  );
}
