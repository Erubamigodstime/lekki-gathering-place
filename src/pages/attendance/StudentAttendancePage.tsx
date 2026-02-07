import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Calendar, CheckCircle, Clock, XCircle, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import axios from 'axios';
import {
  generateClassDates,
  formatAttendanceDate,
  getAttendanceStatus,
  isToday,
  isFutureDate,
  filterDatesByMonth,
  formatMonthYear,
  PROGRAM_START_DATE,
  TOTAL_WEEKS,
} from '@/utils/attendanceUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  classId: string;
}

interface ClassInfo {
  id: string;
  name: string;
  schedule?: {
    days?: string[];
    time?: string;
  };
}

interface Enrollment {
  id: string;
  classId: string;
  class: ClassInfo;
}

// API helper functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const fetchEnrollments = async (): Promise<Enrollment[]> => {
  const headers = getAuthHeaders();
  if (!headers) return [];
  const response = await axios.get(`${API_URL}/enrollments/my-classes`, { headers });
  return response.data.data || [];
};

const fetchAttendance = async (): Promise<AttendanceRecord[]> => {
  const headers = getAuthHeaders();
  if (!headers) return [];
  const response = await axios.get(`${API_URL}/attendance/my-attendance`, { headers });
  return response.data.data || [];
};

export default function StudentAttendancePage() {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  // Track multiple in-progress operations by date key
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  
  // Current month for pagination - starts at current date's month
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Fetch enrollments with React Query (cached for 5 minutes by default)
  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ['enrollments', 'my-classes'],
    queryFn: fetchEnrollments,
    staleTime: 10 * 60 * 1000, // 10 minutes for enrollments (rarely changes)
  });

  // Fetch attendance with React Query
  const { data: attendanceRecords = [], isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance', 'my-attendance'],
    queryFn: fetchAttendance,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set initial class selection when enrollments load
  useEffect(() => {
    if (enrollments.length > 0 && !selectedClassId) {
      setSelectedClassId(enrollments[0].classId);
    }
  }, [enrollments, selectedClassId]);

  const loading = loadingEnrollments || loadingAttendance;

  // Get selected class info
  const selectedClass = useMemo(() => {
    const enrollment = enrollments.find(e => e.classId === selectedClassId);
    return enrollment?.class;
  }, [enrollments, selectedClassId]);

  // Generate all class dates for the selected class
  const allClassDates = useMemo(() => {
    if (!selectedClass) return [];
    const scheduleDays = selectedClass.schedule?.days || ['Thursday'];
    return generateClassDates(scheduleDays, PROGRAM_START_DATE, TOTAL_WEEKS);
  }, [selectedClass]);

  // Get program months (all months that have class dates)
  const programMonths = useMemo(() => {
    const months: Date[] = [];
    const uniqueMonths = new Set<string>();
    
    allClassDates.forEach(date => {
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!uniqueMonths.has(key)) {
        uniqueMonths.add(key);
        months.push(new Date(date.getFullYear(), date.getMonth(), 1));
      }
    });
    
    return months.sort((a, b) => a.getTime() - b.getTime());
  }, [allClassDates]);

  // Get current month index in programMonths
  const currentMonthIndex = useMemo(() => {
    return programMonths.findIndex(
      m => m.getFullYear() === currentDisplayMonth.getFullYear() && 
           m.getMonth() === currentDisplayMonth.getMonth()
    );
  }, [programMonths, currentDisplayMonth]);

  // Filter attendance records for selected class
  const classAttendanceRecords = useMemo(() => {
    return attendanceRecords.filter(r => r.classId === selectedClassId);
  }, [attendanceRecords, selectedClassId]);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const pastDates = allClassDates.filter(d => d <= today);
    const totalPastDates = pastDates.length;

    const approvedCount = classAttendanceRecords.filter(r => r.status === 'APPROVED').length;
    const pendingCount = classAttendanceRecords.filter(r => r.status === 'PENDING').length;
    const rejectedCount = classAttendanceRecords.filter(r => r.status === 'REJECTED').length;

    // Missed = past dates without any attendance record
    const markedDates = new Set(classAttendanceRecords.map(r => new Date(r.date).toDateString()));
    const missedCount = pastDates.filter(d => !markedDates.has(d.toDateString())).length;

    const attendancePercentage = totalPastDates > 0 
      ? Math.round((approvedCount / totalPastDates) * 100) 
      : 0;

    return {
      totalClasses: allClassDates.length,
      totalPastDates,
      approvedCount,
      pendingCount,
      rejectedCount,
      missedCount,
      attendancePercentage,
    };
  }, [allClassDates, classAttendanceRecords]);

  // Get attendance status for a specific date
  const getStatusForDate = useCallback((date: Date) => {
    return getAttendanceStatus(date, classAttendanceRecords);
  }, [classAttendanceRecords]);

  // Handle marking/unmarking attendance with optimistic updates via React Query
  const handleToggleAttendance = async (date: Date) => {
    const dateKey = date.toDateString();
    const currentStatus = getStatusForDate(date);
    
    // Prevent double-clicking while operation is in progress
    if (pendingOperations.has(dateKey)) return;
    
    // Add to pending operations
    setPendingOperations(prev => new Set(prev).add(dateKey));

    const headers = getAuthHeaders();
    if (!headers) {
      setPendingOperations(prev => {
        const next = new Set(prev);
        next.delete(dateKey);
        return next;
      });
      return;
    }

    // Get current cache data for optimistic updates
    const previousData = queryClient.getQueryData<AttendanceRecord[]>(['attendance', 'my-attendance']);

    if (currentStatus === 'PENDING') {
      // Optimistic update - remove immediately from cache
      queryClient.setQueryData<AttendanceRecord[]>(['attendance', 'my-attendance'], (old = []) => 
        old.filter(r => !(r.classId === selectedClassId && new Date(r.date).toDateString() === date.toDateString()))
      );

      try {
        await axios.delete(`${API_URL}/attendance/unmark`, {
          headers,
          data: { classId: selectedClassId, date: date.toISOString() },
        });
        toast.success('Attendance unmarked');
      } catch (error: any) {
        // Revert optimistic update on error
        queryClient.setQueryData(['attendance', 'my-attendance'], previousData);
        const message = error.response?.data?.message || 'Failed to unmark attendance';
        toast.error(message);
      } finally {
        setPendingOperations(prev => {
          const next = new Set(prev);
          next.delete(dateKey);
          return next;
        });
      }
    } else if (!currentStatus) {
      // Optimistic update - add pending record immediately to cache
      const optimisticRecord: AttendanceRecord = {
        id: `temp-${dateKey}`,
        date: date.toISOString(),
        status: 'PENDING',
        classId: selectedClassId,
      };
      queryClient.setQueryData<AttendanceRecord[]>(['attendance', 'my-attendance'], (old = []) => 
        [...old, optimisticRecord]
      );

      try {
        const response = await axios.post(`${API_URL}/attendance/mark`, {
          classId: selectedClassId,
          date: date.toISOString(),
        }, { headers });

        // Replace optimistic record with real one in cache
        const newRecord = response.data.data;
        queryClient.setQueryData<AttendanceRecord[]>(['attendance', 'my-attendance'], (old = []) => 
          old.map(r => r.id === optimisticRecord.id ? newRecord : r)
        );
        toast.success('Attendance marked');
      } catch (error: any) {
        // Revert optimistic update on error
        queryClient.setQueryData(['attendance', 'my-attendance'], previousData);
        const message = error.response?.data?.message || 'Failed to mark attendance';
        toast.error(message);
      } finally {
        setPendingOperations(prev => {
          const next = new Set(prev);
          next.delete(dateKey);
          return next;
        });
      }
    } else {
      // Nothing to do for APPROVED/REJECTED
      setPendingOperations(prev => {
        const next = new Set(prev);
        next.delete(dateKey);
        return next;
      });
    }
  };

  // Navigate months
  const goToPrevMonth = () => {
    if (currentMonthIndex > 0) {
      setCurrentDisplayMonth(programMonths[currentMonthIndex - 1]);
    }
  };

  const goToNextMonth = () => {
    if (currentMonthIndex < programMonths.length - 1) {
      setCurrentDisplayMonth(programMonths[currentMonthIndex + 1]);
    }
  };

  // Go to current month (today)
  const goToCurrentMonth = () => {
    const today = new Date();
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Find the closest program month
    const closest = programMonths.find(
      m => m.getFullYear() === todayMonth.getFullYear() && m.getMonth() === todayMonth.getMonth()
    );
    
    if (closest) {
      setCurrentDisplayMonth(closest);
    } else if (programMonths.length > 0) {
      // If current month not in program, go to last month
      setCurrentDisplayMonth(programMonths[programMonths.length - 1]);
    }
  };

  // Get months to display (1 for mobile, 2-3 for desktop)
  const getDisplayMonths = useCallback((isMobile: boolean) => {
    if (programMonths.length === 0) return [];
    
    if (isMobile) {
      // Mobile: show only current display month
      const idx = currentMonthIndex >= 0 ? currentMonthIndex : 0;
      return [programMonths[idx]];
    }
    
    // Desktop: show 2-3 months centered on current
    const monthsToShow = Math.min(3, programMonths.length);
    let startIdx = Math.max(0, currentMonthIndex - 1);
    let endIdx = Math.min(programMonths.length, startIdx + monthsToShow);
    
    // Adjust if we're at the end
    if (endIdx - startIdx < monthsToShow) {
      startIdx = Math.max(0, endIdx - monthsToShow);
    }
    
    return programMonths.slice(startIdx, endIdx);
  }, [programMonths, currentMonthIndex]);

  // Render attendance checkbox
  const renderAttendanceCheckbox = (date: Date) => {
    const status = getStatusForDate(date);
    const dateKey = date.toDateString();
    const isOperationPending = pendingOperations.has(dateKey);
    const today = isToday(date);
    const future = isFutureDate(date);

    // Can only toggle if pending or not marked, and no operation in progress
    const canToggle = (status === 'PENDING' || status === null) && !isOperationPending;

    if (status === 'APPROVED') {
      return (
        <div 
          className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center cursor-not-allowed"
          title="Approved - cannot change"
        >
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      );
    }

    if (status === 'REJECTED') {
      return (
        <div 
          className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center cursor-not-allowed"
          title="Rejected - cannot change"
        >
          <XCircle className="w-4 h-4 text-white" />
        </div>
      );
    }

    if (status === 'PENDING') {
      return (
        <button
          type="button"
          onClick={() => handleToggleAttendance(date)}
          disabled={isOperationPending}
          className={cn(
            "w-8 h-8 rounded-full border-2 border-amber-500 bg-amber-50 flex items-center justify-center transition-colors",
            isOperationPending ? "opacity-70 cursor-wait" : "hover:bg-amber-100 cursor-pointer"
          )}
          title={isOperationPending ? "Processing..." : "Pending approval - click to unmark"}
        >
          {isOperationPending ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
          ) : (
            <Check className="w-4 h-4 text-amber-600" strokeWidth={3} />
          )}
        </button>
      );
    }

    // Empty - can mark (darker border)
    return (
      <button
        type="button"
        onClick={() => handleToggleAttendance(date)}
        className={cn(
          "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center",
          isOperationPending
            ? "border-amber-500 bg-amber-50 cursor-wait"
            : canToggle
              ? "border-gray-500 hover:border-primary hover:bg-primary/10 cursor-pointer"
              : "border-gray-400 bg-gray-50 cursor-not-allowed opacity-50",
          today && !isOperationPending && "ring-2 ring-primary ring-offset-2"
        )}
        title={isOperationPending ? "Processing..." : today ? "Today - click to mark attendance" : future ? "Future date" : "Past date - click to mark"}
        disabled={!canToggle}
      >
        {isOperationPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
        ) : (
          today && <span className="w-2 h-2 rounded-full bg-primary" />
        )}
      </button>
    );
  };

  // Render a single month grid
  const renderMonthGrid = (month: Date) => {
    const monthDates = filterDatesByMonth(allClassDates, month);
    
    return (
      <div key={month.toISOString()} className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-center md:text-left mb-3 text-muted-foreground">
          {formatMonthYear(month)}
        </h4>
        <div className="flex flex-wrap gap-2">
          {monthDates.map((date, idx) => {
            const today = isToday(date);
            const future = isFutureDate(date);
            
            return (
              <div
                key={idx}
                className={cn(
                  "flex flex-col p-2 rounded-lg items-start",
                  today && "bg-primary/10",
                  future && "opacity-60"
                )}
              >
                <span className={cn(
                  "text-xs mb-1 font-medium",
                  today ? "text-primary" : "text-muted-foreground"
                )}>
                  {formatAttendanceDate(date)}
                </span>
                {today && (
                  <span className="text-[8px] text-primary font-bold mb-0.5">TODAY</span>
                )}
                {renderAttendanceCheckbox(date)}
              </div>
            );
          })}
        </div>
        {monthDates.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No classes this month
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading attendance...</p>
        </div>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Classes Enrolled</h3>
            <p className="text-muted-foreground">
              You need to be enrolled in a class to mark attendance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header with Class Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Attendance</h1>
          <p className="text-muted-foreground">Track and mark your class attendance</p>
        </div>

        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            {enrollments.map((enrollment) => (
              <SelectItem key={enrollment.classId} value={enrollment.classId}>
                {enrollment.class.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.attendancePercentage}%</p>
                <p className="text-xs text-muted-foreground">Attendance Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.missedCount}</p>
                <p className="text-xs text-muted-foreground">Missed Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approvedCount}/{stats.totalClasses}</p>
                <p className="text-xs text-muted-foreground">Classes Attended</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mark Attendance Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{selectedClass?.name || 'Class'}</h2>
            <p className="text-sm text-muted-foreground">
              Click on any date to mark or unmark your attendance. Pending attendance can be toggled.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={goToCurrentMonth}>
            Today
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span>Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-amber-500 bg-amber-50 flex items-center justify-center">
                  <Check className="w-3 h-3 text-amber-600" strokeWidth={3} />
                </div>
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                  <XCircle className="w-3 h-3 text-white" />
                </div>
                <span>Rejected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-gray-500" />
                <span>Not Marked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-gray-500 ring-2 ring-primary ring-offset-1 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <span>Today</span>
              </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevMonth}
                disabled={currentMonthIndex <= 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm font-medium md:hidden">
                {formatMonthYear(currentDisplayMonth)}
              </span>
              
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextMonth}
                disabled={currentMonthIndex >= programMonths.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Desktop: Multiple months */}
            <div className="hidden md:flex gap-6">
              {getDisplayMonths(false).map(month => renderMonthGrid(month))}
            </div>

            {/* Mobile: Single month */}
            <div className="md:hidden">
              {getDisplayMonths(true).map(month => renderMonthGrid(month))}
            </div>

            {allClassDates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No class dates found for this schedule.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
