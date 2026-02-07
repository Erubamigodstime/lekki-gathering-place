/**
 * Attendance Query Hooks
 * 
 * All attendance-related data fetching in one place
 * Pages should ONLY use these hooks, never direct API calls
 */

import { useQuery } from '@tanstack/react-query';
import apiClient, { extractData } from '@/api/apiClient';
import { queryKeys, staleTime } from '@/api/queryKeys';
import type { AttendanceRecord, PaginatedResponse } from '@/api/types';

// ============ Query Hooks ============

/**
 * Fetch current user's attendance history
 */
export function useMyAttendance() {
  return useQuery({
    queryKey: queryKeys.attendance.myAttendance(),
    queryFn: async (): Promise<AttendanceRecord[]> => {
      const response = await apiClient.get('/attendance/my-attendance');
      return extractData<AttendanceRecord[]>(response) || [];
    },
    staleTime: staleTime.dynamic,
  });
}

/**
 * Fetch attendance records with filters
 */
export function useAttendanceList(filters?: {
  classId?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.attendance.list(filters),
    queryFn: async (): Promise<PaginatedResponse<AttendanceRecord>> => {
      const params = new URLSearchParams();
      if (filters?.classId) params.append('classId', filters.classId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));
      
      const response = await apiClient.get(`/attendance?${params}`);
      const data = extractData<AttendanceRecord[]>(response) || [];
      return {
        data,
        pagination: response.data?.data?.pagination || { page: 1, limit: 20, total: data.length, pages: 1 },
      };
    },
    staleTime: staleTime.dynamic,
  });
}

/**
 * Fetch pending attendance for instructor's classes
 */
export function usePendingAttendance(classIds?: string[]) {
  return useQuery({
    queryKey: queryKeys.attendance.pending(classIds),
    queryFn: async (): Promise<AttendanceRecord[]> => {
      const response = await apiClient.get('/attendance?status=PENDING&limit=50');
      const allPending = extractData<AttendanceRecord[]>(response) || [];
      
      // Filter for instructor's classes if classIds provided
      if (classIds && classIds.length > 0) {
        return allPending.filter(a => classIds.includes(a.classId));
      }
      
      return allPending;
    },
    enabled: !classIds || classIds.length > 0,
    staleTime: staleTime.dynamic,
  });
}

/**
 * Fetch attendance for a specific class
 */
export function useClassAttendance(classId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.attendance.byClass(classId || ''),
    queryFn: async (): Promise<AttendanceRecord[]> => {
      const response = await apiClient.get(`/attendance?classId=${classId}`);
      return extractData<AttendanceRecord[]>(response) || [];
    },
    enabled: !!classId,
    staleTime: staleTime.dynamic,
  });
}

// ============ Derived Helpers ============

/**
 * Calculate attendance rate from records
 */
export function calculateAttendanceRate(records: AttendanceRecord[]): number {
  if (records.length === 0) return 0;
  const approved = records.filter(r => r.status === 'APPROVED').length;
  return Math.round((approved / records.length) * 100);
}

/**
 * Get today's attendance for a specific class
 */
export function getTodayAttendance(
  records: AttendanceRecord[], 
  classId: string
): AttendanceRecord | undefined {
  const today = new Date().toDateString();
  return records.find(
    r => r.classId === classId && new Date(r.date).toDateString() === today
  );
}

/**
 * Check if attendance is marked for today
 */
export function isAttendanceMarkedToday(
  records: AttendanceRecord[], 
  classId: string
): boolean {
  return !!getTodayAttendance(records, classId);
}
