/**
 * Enrollment Query Hooks
 * 
 * All enrollment-related data fetching in one place
 * Pages should ONLY use these hooks, never direct API calls
 */

import { useQuery } from '@tanstack/react-query';
import apiClient, { extractData, extractPaginatedData } from '@/api/apiClient';
import { queryKeys, staleTime } from '@/api/queryKeys';
import type { Enrollment, PaginatedResponse } from '@/api/types';

// ============ Query Hooks ============

/**
 * Fetch current student's enrollments
 */
export function useMyEnrollments() {
  return useQuery({
    queryKey: queryKeys.enrollments.myEnrollments(),
    queryFn: async (): Promise<Enrollment[]> => {
      const response = await apiClient.get('/enrollments/my-enrollments');
      return extractData<Enrollment[]>(response) || [];
    },
    staleTime: staleTime.standard,
  });
}

/**
 * Fetch current student's classes (approved enrollments with class data)
 */
export function useMyClasses() {
  return useQuery({
    queryKey: queryKeys.enrollments.myClasses(),
    queryFn: async (): Promise<Enrollment[]> => {
      const response = await apiClient.get('/enrollments/my-classes');
      return extractData<Enrollment[]>(response) || [];
    },
    staleTime: staleTime.standard,
  });
}

/**
 * Fetch enrollments with filters
 */
export function useEnrollmentList(filters?: {
  classId?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DROPPED';
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.enrollments.list(filters),
    queryFn: async (): Promise<PaginatedResponse<Enrollment>> => {
      const params = new URLSearchParams();
      if (filters?.classId) params.append('classId', filters.classId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));
      
      const response = await apiClient.get(`/enrollments?${params}`);
      return extractPaginatedData<Enrollment>(response);
    },
    staleTime: staleTime.dynamic,
  });
}

/**
 * Fetch enrollments for a specific class
 */
export function useClassEnrollments(classId: string | undefined, status?: string) {
  return useQuery({
    queryKey: queryKeys.enrollments.byClass(classId || '', status),
    queryFn: async (): Promise<Enrollment[]> => {
      const url = status 
        ? `/enrollments/class/${classId}?status=${status}`
        : `/enrollments/class/${classId}`;
      const response = await apiClient.get(url);
      return extractData<Enrollment[]>(response) || [];
    },
    enabled: !!classId,
    staleTime: staleTime.dynamic,
  });
}

/**
 * Fetch pending enrollments for instructor's classes
 */
export function usePendingEnrollments(classIds?: string[]) {
  return useQuery({
    queryKey: queryKeys.dashboard.pendingEnrollments(classIds),
    queryFn: async (): Promise<Enrollment[]> => {
      const response = await apiClient.get('/enrollments?status=PENDING&limit=50');
      const allPending = extractData<Enrollment[]>(response) || [];
      
      // Filter for instructor's classes if classIds provided
      if (classIds && classIds.length > 0) {
        return allPending.filter(e => classIds.includes(e.classId));
      }
      
      return allPending;
    },
    enabled: !classIds || classIds.length > 0,
    staleTime: staleTime.dynamic,
  });
}

// ============ Derived Helpers ============

/**
 * Filter enrollments by status
 */
export function filterByStatus(enrollments: Enrollment[], status: string): Enrollment[] {
  return enrollments.filter(e => e.status === status);
}

/**
 * Get approved enrollments only
 */
export function getApprovedEnrollments(enrollments: Enrollment[]): Enrollment[] {
  return filterByStatus(enrollments, 'APPROVED');
}

/**
 * Get pending enrollments only
 */
export function getPendingEnrollments(enrollments: Enrollment[]): Enrollment[] {
  return filterByStatus(enrollments, 'PENDING');
}

/**
 * Check if enrolled in a specific class
 */
export function isEnrolledInClass(enrollments: Enrollment[], classId: string): boolean {
  return enrollments.some(e => e.classId === classId && e.status === 'APPROVED');
}
