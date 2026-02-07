/**
 * User & Profile Query Hooks
 * 
 * All user/profile-related data fetching in one place
 */

import { useQuery } from '@tanstack/react-query';
import apiClient, { extractData } from '@/api/apiClient';
import { queryKeys, staleTime } from '@/api/queryKeys';
import type { User, Instructor, InstructorProfile, Ward, Student } from '@/api/types';

// ============ User Queries ============

/**
 * Fetch current user's profile
 */
export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.users.profile(),
    queryFn: async (): Promise<User | null> => {
      const response = await apiClient.get('/users/profile');
      return extractData<User>(response);
    },
    staleTime: staleTime.standard,
  });
}

// ============ Instructor Queries ============

/**
 * Fetch current instructor's profile (includes classes)
 */
export function useInstructorProfile() {
  return useQuery({
    queryKey: queryKeys.instructors.profile(),
    queryFn: async (): Promise<InstructorProfile | null> => {
      const response = await apiClient.get('/instructors/profile');
      return extractData<InstructorProfile>(response);
    },
    staleTime: staleTime.standard,
  });
}

/**
 * Fetch all instructors
 */
export function useInstructorList(filters?: { wardId?: string; status?: string }) {
  return useQuery({
    queryKey: queryKeys.instructors.list(filters),
    queryFn: async (): Promise<Instructor[]> => {
      const params = new URLSearchParams();
      if (filters?.wardId) params.append('wardId', filters.wardId);
      if (filters?.status) params.append('status', filters.status);
      
      const response = await apiClient.get(`/instructors?${params}`);
      return extractData<Instructor[]>(response) || [];
    },
    staleTime: staleTime.standard,
  });
}

// ============ Student Queries ============

/**
 * Fetch student by user ID
 */
export function useStudentByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.students.byUserId(userId || ''),
    queryFn: async (): Promise<Student | null> => {
      // First get students list and filter
      const response = await apiClient.get(`/students?userId=${userId}`);
      const students = extractData<Student[]>(response) || [];
      return students[0] || null;
    },
    enabled: !!userId,
    staleTime: staleTime.standard,
  });
}

/**
 * Fetch all students
 */
export function useStudentList(filters?: { classId?: string; wardId?: string }) {
  return useQuery({
    queryKey: queryKeys.students.list(filters),
    queryFn: async (): Promise<Student[]> => {
      const params = new URLSearchParams();
      if (filters?.classId) params.append('classId', filters.classId);
      if (filters?.wardId) params.append('wardId', filters.wardId);
      
      const response = await apiClient.get(`/students?${params}`);
      return extractData<Student[]>(response) || [];
    },
    staleTime: staleTime.standard,
  });
}

// ============ Ward Queries ============

/**
 * Fetch all wards
 */
export function useWards() {
  return useQuery({
    queryKey: queryKeys.wards.list(),
    queryFn: async (): Promise<Ward[]> => {
      const response = await apiClient.get('/wards');
      return extractData<Ward[]>(response) || [];
    },
    staleTime: staleTime.static, // Wards rarely change
  });
}
