/**
 * Class Query Hooks
 * 
 * All class-related data fetching in one place
 */

import { useQuery } from '@tanstack/react-query';
import apiClient, { extractData, extractPaginatedData } from '@/api/apiClient';
import { queryKeys, staleTime } from '@/api/queryKeys';
import type { Class, PaginatedResponse } from '@/api/types';

// ============ Query Hooks ============

/**
 * Fetch all classes with optional filters
 */
export function useClasses(filters?: {
  wardId?: string;
  instructorId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.classes.list(filters),
    queryFn: async (): Promise<PaginatedResponse<Class>> => {
      const params = new URLSearchParams();
      if (filters?.wardId) params.append('wardId', filters.wardId);
      if (filters?.instructorId) params.append('instructorId', filters.instructorId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));
      
      const response = await apiClient.get(`/classes?${params}`);
      return extractPaginatedData<Class>(response);
    },
    staleTime: staleTime.static,
  });
}

/**
 * Fetch a single class by ID
 */
export function useClassById(classId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.classes.byId(classId || ''),
    queryFn: async (): Promise<Class | null> => {
      const response = await apiClient.get(`/classes/${classId}`);
      return extractData<Class>(response);
    },
    enabled: !!classId,
    staleTime: staleTime.static,
  });
}

/**
 * Fetch instructor's classes
 * Uses the instructor profile endpoint which includes classes
 */
export function useInstructorClasses(instructorId?: string) {
  return useQuery({
    queryKey: queryKeys.classes.myClasses(),
    queryFn: async (): Promise<Class[]> => {
      // Get instructor profile which includes classes
      const response = await apiClient.get('/instructors/profile');
      const profile = extractData<{ classes?: Class[] }>(response);
      return profile?.classes || [];
    },
    enabled: !!instructorId || true, // Always enabled for current instructor
    staleTime: staleTime.standard,
  });
}

// ============ Derived Helpers ============

/**
 * Get unique wards from classes
 */
export function getUniqueWards(classes: Class[]): string[] {
  const wards = new Set(classes.map(c => c.ward?.name).filter(Boolean));
  return Array.from(wards) as string[];
}

/**
 * Filter classes by ward
 */
export function filterByWard(classes: Class[], wardName: string): Class[] {
  if (wardName === 'all') return classes;
  return classes.filter(c => c.ward?.name === wardName);
}

/**
 * Search classes by name or instructor
 */
export function searchClasses(classes: Class[], query: string): Class[] {
  if (!query) return classes;
  const lowerQuery = query.toLowerCase();
  return classes.filter(c => {
    const instructorName = c.instructor?.user
      ? `${c.instructor.user.firstName} ${c.instructor.user.lastName}`.toLowerCase()
      : '';
    return c.name.toLowerCase().includes(lowerQuery) || 
           instructorName.includes(lowerQuery);
  });
}
