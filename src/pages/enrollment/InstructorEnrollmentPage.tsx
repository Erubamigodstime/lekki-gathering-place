import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Check, X, Clock, Users, BookOpen, CheckCircle, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

interface EnrollmentRecord {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  enrolledAt: string;
  rejectionReason?: string;
  student: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      wardId?: string;
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

export default function InstructorEnrollmentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EnrollmentRecord | null>(null);
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

  // Fetch pending enrollments with React Query
  const { data: enrollmentRecords = [], isLoading: loadingEnrollments, error: enrollmentsError } = useQuery({
    queryKey: ['instructor', 'enrollments', 'pending', classes.map(c => c.id)],
    queryFn: async () => {
      const headers = getAuthHeaders();
      if (!headers || classes.length === 0) return [];

      const response = await axios.get(`${API_URL}/enrollments`, {
        headers,
        params: { status: 'PENDING' },
        timeout: 15000,
      });

      const allEnrollments = response.data.data || [];
      return (Array.isArray(allEnrollments) ? allEnrollments : []) as EnrollmentRecord[];
    },
    staleTime: staleTimes.dynamic,
    enabled: classes.length > 0,
  });

  const loading = loadingClasses || loadingEnrollments;
  const error = classesError || enrollmentsError 
    ? (classesError as Error)?.message || (enrollmentsError as Error)?.message || 'An error occurred'
    : null;

  // Invalidate and refetch after mutations
  const invalidateEnrollments = () => {
    queryClient.invalidateQueries({ queryKey: ['instructor', 'enrollments'] });
    queryClient.invalidateQueries({ queryKey: ['enrollments'] });
  };

  const handleApprove = async (recordId: string) => {
    try {
      setProcessingId(recordId);
      const token = localStorage.getItem('token');
      if (!token) return;

      // Optimistic update - remove from list
      queryClient.setQueryData<EnrollmentRecord[]>(
        ['instructor', 'enrollments', 'pending', classes.map(c => c.id)],
        (old = []) => old.filter(r => r.id !== recordId)
      );

      await axios.patch(
        `${API_URL}/enrollments/${recordId}/approve`,
        { status: 'APPROVED' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: 'Success',
        description: 'Enrollment approved successfully',
      });
      
      invalidateEnrollments();
    } catch (error: any) {
      console.error('Failed to approve enrollment:', error);
      invalidateEnrollments(); // Revert on error
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve enrollment',
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

      // Optimistic update - remove from list
      queryClient.setQueryData<EnrollmentRecord[]>(
        ['instructor', 'enrollments', 'pending', classes.map(c => c.id)],
        (old = []) => old.filter(r => r.id !== selectedRecord.id)
      );

      await axios.patch(
        `${API_URL}/enrollments/${selectedRecord.id}/approve`,
        { 
          status: 'REJECTED',
          rejectionReason: rejectionReason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: 'Success',
        description: 'Enrollment rejected',
      });

      setRejectDialogOpen(false);
      setSelectedRecord(null);
      setRejectionReason('');
      
      invalidateEnrollments();
    } catch (error: any) {
      console.error('Failed to reject enrollment:', error);
      invalidateEnrollments(); // Revert on error
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject enrollment',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (record: EnrollmentRecord) => {
    setSelectedRecord(record);
    setRejectDialogOpen(true);
  };

  const filteredRecords = enrollmentRecords.filter(record => {
    // Safely check if record and nested properties exist
    if (!record?.student?.user || !record?.class) {
      return false;
    }
    
    const studentName = `${record.student.user.firstName || ''} ${record.student.user.lastName || ''}`.toLowerCase();
    const email = (record.student.user.email || '').toLowerCase();
    const className = (record.class.name || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = studentName.includes(query) ||
                         email.includes(query) ||
                         className.includes(query);
    const matchesClass = classFilter === 'all' || record.class.id === classFilter;
    return matchesSearch && matchesClass;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Enrollment Requests</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve student enrollment requests for your classes
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
                  Unable to Load Enrollment Data
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
          <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-card border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{enrollmentRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your review
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{classes.length}</div>
            <p className="text-xs text-muted-foreground">
              Active teaching classes
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{filteredRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              Requests to review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, email, or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-64">
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

      {/* Enrollment Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-3 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-lg font-medium">Loading enrollment requests...</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Please wait while we fetch the data</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-muted-foreground mb-2 font-semibold">All caught up!</p>
              <p className="text-sm text-muted-foreground">
                {enrollmentRecords.length === 0 
                  ? "No pending enrollment requests at the moment"
                  : "No requests match your search criteria"}
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
                      <TableHead>Ward</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => {
                      // Safely extract values with fallbacks
                      const firstName = record?.student?.user?.firstName || '';
                      const lastName = record?.student?.user?.lastName || '';
                      const email = record?.student?.user?.email || '';
                      const phone = record?.student?.user?.phone;
                      const className = record?.class?.name || 'Unknown Class';
                      const wardId = record?.student?.user?.wardId;
                      
                      return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                {firstName[0] || '?'}{lastName[0] || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {firstName} {lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {email}
                              </p>
                              {phone && (
                                <p className="text-xs text-muted-foreground">
                                  {phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {className}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            Ward {wardId ? wardId.slice(0, 8) : 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{formatDate(record.enrolledAt)}</span>
                            <span className="text-xs text-muted-foreground">{formatTime(record.enrolledAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(record.id)}
                              disabled={processingId === record.id}
                            >
                              <Check className="h-4 w-4 mr-1" />
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
                        </TableCell>
                      </TableRow>
                    );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {/* Mobile Cards */}
              <div className="md:hidden p-4 space-y-3">
                {filteredRecords.map((record) => {
                  const firstName = record?.student?.user?.firstName || '';
                  const lastName = record?.student?.user?.lastName || '';
                  const email = record?.student?.user?.email || '';
                  const phone = record?.student?.user?.phone;
                  const className = record?.class?.name || 'Unknown Class';
                  const wardId = record?.student?.user?.wardId;
                  
                  return (
                    <div key={record.id} className="bg-muted/30 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {firstName[0] || '?'}{lastName[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {firstName} {lastName}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge variant="outline" className="font-medium">
                          {className}
                        </Badge>
                        <Badge variant="secondary">
                          Ward {wardId ? wardId.slice(0, 8) : 'N/A'}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDate(record.enrolledAt)}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 pt-2 border-t border-border/50">
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(record.id)}
                          disabled={processingId === record.id}
                        >
                          <Check className="h-4 w-4 mr-1" />
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
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Enrollment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this enrollment request.
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
                  {selectedRecord.class.name} • {formatDate(selectedRecord.enrolledAt)}
                </p>
              </div>
            )}
            <Textarea
              placeholder="Enter rejection reason (e.g., Class is full, Student doesn't meet prerequisites)"
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
              Reject Enrollment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  );
}
