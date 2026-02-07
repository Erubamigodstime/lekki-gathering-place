/**
 * Attendance Mutation Hooks
 * 
 * All attendance-related mutations with cache invalidation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { queryKeys } from '@/api/queryKeys';
import type { AttendanceRecord } from '@/api/types';

// ============ Types ============

interface MarkAttendanceInput {
  lessonId: string;
  classId: string;
}

interface ProcessAttendanceInput {
  attendanceId: string;
  classId: string;
}

interface BulkMarkAttendanceInput {
  lessonId: string;
  classId: string;
  studentIds: string[];
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

// ============ Mutations ============

/**
 * Mark own attendance (student self-check-in)
 */
export function useMarkAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ lessonId }: MarkAttendanceInput): Promise<AttendanceRecord> => {
      const response = await apiClient.post('/attendance/mark', { lessonId });
      return response.data.data;
    },
    onSuccess: (_, { classId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.myAttendance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.byClass(classId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.certificates.eligibility(classId) });
    },
  });
}

/**
 * Approve pending attendance (instructor)
 */
export function useApproveAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ attendanceId }: ProcessAttendanceInput): Promise<AttendanceRecord> => {
      const response = await apiClient.patch(`/attendance/${attendanceId}/approve`);
      return response.data.data;
    },
    onMutate: async ({ attendanceId, classId }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.attendance.pending([classId]) });
      
      const previousPending = queryClient.getQueryData(queryKeys.attendance.pending([classId]));
      
      queryClient.setQueryData(
        queryKeys.attendance.pending([classId]),
        (old: AttendanceRecord[] | undefined) => 
          old?.map(record => 
            record.id === attendanceId 
              ? { ...record, status: 'APPROVED' as const } 
              : record
          ) || []
      );
      
      return { previousPending };
    },
    onError: (_, { classId }, context) => {
      // Rollback on error
      if (context?.previousPending) {
        queryClient.setQueryData(queryKeys.attendance.pending([classId]), context.previousPending);
      }
    },
    onSettled: (_, __, { classId }) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.pending([classId]) });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.byClass(classId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.certificates.allStudentsProgress(classId) });
    },
  });
}

/**
 * Reject pending attendance (instructor)
 */
export function useRejectAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ attendanceId }: ProcessAttendanceInput): Promise<void> => {
      await apiClient.patch(`/attendance/${attendanceId}/reject`);
    },
    onMutate: async ({ attendanceId, classId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.attendance.pending([classId]) });
      
      const previousPending = queryClient.getQueryData(queryKeys.attendance.pending([classId]));
      
      // Optimistically remove from pending list
      queryClient.setQueryData(
        queryKeys.attendance.pending([classId]),
        (old: AttendanceRecord[] | undefined) => 
          old?.filter(record => record.id !== attendanceId) || []
      );
      
      return { previousPending };
    },
    onError: (_, { classId }, context) => {
      if (context?.previousPending) {
        queryClient.setQueryData(queryKeys.attendance.pending([classId]), context.previousPending);
      }
    },
    onSettled: (_, __, { classId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.pending([classId]) });
    },
  });
}

/**
 * Bulk mark attendance for multiple students (instructor)
 */
export function useBulkMarkAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ lessonId, studentIds, status }: BulkMarkAttendanceInput): Promise<AttendanceRecord[]> => {
      const response = await apiClient.post('/attendance/bulk-mark', { 
        lessonId, 
        studentIds, 
        status 
      });
      return response.data.data;
    },
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.byClass(classId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.pending([classId]) });
      queryClient.invalidateQueries({ queryKey: queryKeys.certificates.allStudentsProgress(classId) });
    },
  });
}

/**
 * Process all pending attendance for a class (bulk approve/reject)
 */
export function useProcessAllPending() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      classId, 
      action 
    }: { 
      classId: string; 
      action: 'approve' | 'reject';
    }): Promise<{ processed: number }> => {
      const response = await apiClient.post(`/attendance/class/${classId}/process-all`, { action });
      return response.data.data;
    },
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.pending([classId]) });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.byClass(classId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.certificates.allStudentsProgress(classId) });
    },
  });
}
