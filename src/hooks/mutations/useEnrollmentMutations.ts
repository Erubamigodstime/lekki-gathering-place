/**
 * Enrollment Mutation Hooks
 * 
 * All enrollment-related mutations with cache invalidation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { queryKeys } from '@/api/queryKeys';
import type { Enrollment } from '@/api/types';

// ============ Types ============

interface EnrollInput {
  classId: string;
}

interface ProcessEnrollmentInput {
  enrollmentId: string;
  classId: string;
}

// ============ Mutations ============

/**
 * Enroll in a class (student)
 */
export function useEnroll() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ classId }: EnrollInput): Promise<Enrollment> => {
      const response = await apiClient.post('/enrollments', { classId });
      return response.data.data;
    },
    onSuccess: (_, { classId }) => {
      // Invalidate enrollment-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.myEnrollments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.myClasses() });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.byClass(classId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
    },
  });
}

/**
 * Approve pending enrollment (instructor)
 */
export function useApproveEnrollment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ enrollmentId }: ProcessEnrollmentInput): Promise<Enrollment> => {
      const response = await apiClient.patch(`/enrollments/${enrollmentId}/approve`);
      return response.data.data;
    },
    onMutate: async ({ enrollmentId, classId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.enrollments.byClass(classId) });
      
      const previousEnrollments = queryClient.getQueryData(queryKeys.enrollments.byClass(classId));
      
      // Optimistically update enrollment status
      queryClient.setQueryData(
        queryKeys.enrollments.byClass(classId),
        (old: Enrollment[] | undefined) => 
          old?.map(enrollment => 
            enrollment.id === enrollmentId 
              ? { ...enrollment, status: 'APPROVED' as const } 
              : enrollment
          ) || []
      );
      
      return { previousEnrollments };
    },
    onError: (_, { classId }, context) => {
      if (context?.previousEnrollments) {
        queryClient.setQueryData(queryKeys.enrollments.byClass(classId), context.previousEnrollments);
      }
    },
    onSettled: (_, __, { classId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.byClass(classId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.pending([classId]) });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.byClass(classId) });
    },
  });
}

/**
 * Reject pending enrollment (instructor)
 */
export function useRejectEnrollment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ enrollmentId }: ProcessEnrollmentInput): Promise<void> => {
      await apiClient.patch(`/enrollments/${enrollmentId}/reject`);
    },
    onMutate: async ({ enrollmentId, classId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.enrollments.byClass(classId) });
      
      const previousEnrollments = queryClient.getQueryData(queryKeys.enrollments.byClass(classId));
      
      // Optimistically update enrollment status
      queryClient.setQueryData(
        queryKeys.enrollments.byClass(classId),
        (old: Enrollment[] | undefined) => 
          old?.map(enrollment => 
            enrollment.id === enrollmentId 
              ? { ...enrollment, status: 'REJECTED' as const } 
              : enrollment
          ) || []
      );
      
      return { previousEnrollments };
    },
    onError: (_, { classId }, context) => {
      if (context?.previousEnrollments) {
        queryClient.setQueryData(queryKeys.enrollments.byClass(classId), context.previousEnrollments);
      }
    },
    onSettled: (_, __, { classId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.byClass(classId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.pending([classId]) });
    },
  });
}

/**
 * Unenroll from a class (student)
 */
export function useUnenroll() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ enrollmentId }: { enrollmentId: string; classId: string }): Promise<void> => {
      await apiClient.delete(`/enrollments/${enrollmentId}`);
    },
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.myEnrollments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.myClasses() });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.byClass(classId) });
    },
  });
}

/**
 * Bulk approve/reject enrollments (instructor)
 */
export function useBulkProcessEnrollments() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      classId, 
      enrollmentIds, 
      action 
    }: { 
      classId: string;
      enrollmentIds: string[];
      action: 'approve' | 'reject';
    }): Promise<{ processed: number }> => {
      const response = await apiClient.post(`/enrollments/bulk-process`, { 
        enrollmentIds, 
        action 
      });
      return response.data.data;
    },
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.byClass(classId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.pending([classId]) });
    },
  });
}
