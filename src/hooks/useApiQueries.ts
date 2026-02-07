/**
 * Centralized React Query hooks for API data fetching
 * These hooks provide caching, automatic refetching, and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// ============ Auth Helpers ============
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

// ============ Query Keys ============
// Centralized query keys for cache management
export const queryKeys = {
  // User/Profile
  userProfile: ['user', 'profile'],
  
  // Instructors
  instructorProfile: ['instructor', 'profile'],
  instructors: (filters?: object) => ['instructors', filters],
  
  // Classes
  classes: (filters?: object) => ['classes', filters],
  classById: (id: string) => ['classes', id],
  instructorMyClasses: ['classes', 'my-classes'],
  
  // Enrollments
  enrollments: (filters?: object) => ['enrollments', filters],
  myEnrollments: ['enrollments', 'my-enrollments'],
  studentMyClasses: ['enrollments', 'my-classes'],
  classEnrollments: (classId: string, status?: string) => ['enrollments', 'class', classId, status],
  
  // Attendance
  attendance: (filters?: object) => ['attendance', filters],
  myAttendance: ['attendance', 'my-attendance'],
  pendingAttendance: ['attendance', 'pending'],
  
  // Students
  students: (filters?: object) => ['students', filters],
  
  // Lessons/Modules
  lessons: (classId: string, includeUnpublished?: boolean) => ['lessons', classId, includeUnpublished],
  lessonMaterials: (lessonId: string) => ['materials', lessonId],
  lessonProgress: (classId: string) => ['progress', classId],
  
  // Messages
  conversations: ['messages', 'conversations'],
  messageThread: (partnerId: string) => ['messages', 'thread', partnerId],
  messageUsers: ['messages', 'users'],
  
  // Certificates/Progress
  certificateProgress: (classId: string) => ['certificate', 'progress', classId],
  allStudentsProgress: (classId: string) => ['certificate', 'all-students', classId],
  
  // Wards
  wards: ['wards'],
  
  // Grades
  studentGrades: (classId: string) => ['grades', classId],
};

// ============ Stale Times ============
// How long data is considered fresh (won't refetch)
export const staleTimes = {
  static: 30 * 60 * 1000,      // 30 mins - rarely changes (wards, class info)
  standard: 5 * 60 * 1000,      // 5 mins - standard data
  dynamic: 2 * 60 * 1000,       // 2 mins - frequently changing (attendance, grades)
  realtime: 30 * 1000,          // 30 secs - near-realtime (messages)
};

// ============ User/Profile Hooks ============
export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.userProfile,
    queryFn: async () => {
      const headers = getAuthHeaders();
      if (!headers) return null;
      const response = await axios.get(`${API_URL}/users/profile`, { headers });
      return response.data.data;
    },
    staleTime: staleTimes.standard,
  });
};

export const useInstructorProfile = () => {
  return useQuery({
    queryKey: queryKeys.instructorProfile,
    queryFn: async () => {
      const headers = getAuthHeaders();
      if (!headers) return null;
      const response = await axios.get(`${API_URL}/instructors/profile`, { headers });
      return response.data.data;
    },
    staleTime: staleTimes.standard,
  });
};

// ============ Classes Hooks ============
export const useClasses = (filters?: { page?: number; limit?: number; wardId?: string }) => {
  return useQuery({
    queryKey: queryKeys.classes(filters),
    queryFn: async () => {
      const headers = getAuthHeaders();
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));
      if (filters?.wardId) params.append('wardId', filters.wardId);
      
      const response = await axios.get(`${API_URL}/classes?${params}`, { headers });
      return response.data;
    },
    staleTime: staleTimes.static,
  });
};

export const useClassById = (classId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.classById(classId || ''),
    queryFn: async () => {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/classes/${classId}`, { headers });
      return response.data.data;
    },
    enabled: !!classId,
    staleTime: staleTimes.static,
  });
};

// ============ Enrollments Hooks ============
export const useEnrollments = (filters?: { 
  classId?: string; 
  status?: string; 
  page?: number; 
  limit?: number 
}) => {
  return useQuery({
    queryKey: queryKeys.enrollments(filters),
    queryFn: async () => {
      const headers = getAuthHeaders();
      if (!headers) return { data: [], pagination: {} };
      
      const params = new URLSearchParams();
      if (filters?.classId) params.append('classId', filters.classId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));
      
      const response = await axios.get(`${API_URL}/enrollments?${params}`, { headers });
      return response.data;
    },
    staleTime: staleTimes.dynamic,
  });
};

export const useMyEnrollments = () => {
  return useQuery({
    queryKey: queryKeys.myEnrollments,
    queryFn: async () => {
      const headers = getAuthHeaders();
      if (!headers) return [];
      const response = await axios.get(`${API_URL}/enrollments/my-enrollments`, { headers });
      return response.data.data || [];
    },
    staleTime: staleTimes.standard,
  });
};

export const useMyClasses = () => {
  return useQuery({
    queryKey: ['enrollments', 'my-classes'],
    queryFn: async () => {
      const headers = getAuthHeaders();
      if (!headers) return [];
      const response = await axios.get(`${API_URL}/enrollments/my-classes`, { headers });
      return response.data.data || [];
    },
    staleTime: staleTimes.standard,
  });
};

export const useClassEnrollments = (classId: string | undefined, status?: string) => {
  return useQuery({
    queryKey: queryKeys.classEnrollments(classId || '', status),
    queryFn: async () => {
      const headers = getAuthHeaders();
      if (!headers) return [];
      const url = status 
        ? `${API_URL}/enrollments/class/${classId}?status=${status}`
        : `${API_URL}/enrollments/class/${classId}`;
      const response = await axios.get(url, { headers });
      return response.data.data || [];
    },
    enabled: !!classId,
    staleTime: staleTimes.dynamic,
  });
};

// ============ Attendance Hooks ============
export const useAttendance = (filters?: {
  classId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.attendance(filters),
    queryFn: async () => {
      const headers = getAuthHeaders();
      if (!headers) return { data: [], pagination: {} };
      
      const params = new URLSearchParams();
      if (filters?.classId) params.append('classId', filters.classId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));
      
      const response = await axios.get(`${API_URL}/attendance?${params}`, { headers });
      return response.data;
    },
    staleTime: staleTimes.dynamic,
  });
};

export const useMyAttendance = () => {
  return useQuery({
    queryKey: queryKeys.myAttendance,
    queryFn: async () => {
      const headers = getAuthHeaders();
      if (!headers) return [];
      const response = await axios.get(`${API_URL}/attendance/my-attendance`, { headers });
      return response.data.data || [];
    },
    staleTime: staleTimes.standard,
  });
};

// ============ Lessons/Modules Hooks ============
export const useLessons = (classId: string | undefined, includeUnpublished = false) => {
  return useQuery({
    queryKey: queryKeys.lessons(classId || '', includeUnpublished),
    queryFn: async () => {
      const headers = getAuthHeaders();
      const url = includeUnpublished 
        ? `${API_URL}/lessons/class/${classId}?includeUnpublished=true`
        : `${API_URL}/lessons/class/${classId}`;
      const response = await axios.get(url, { headers });
      return response.data.data || [];
    },
    enabled: !!classId,
    staleTime: staleTimes.standard,
  });
};

export const useLessonMaterials = (lessonId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.lessonMaterials(lessonId || ''),
    queryFn: async () => {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/course-materials/lesson/${lessonId}`, { headers });
      return response.data.data || [];
    },
    enabled: !!lessonId,
    staleTime: staleTimes.standard,
  });
};

export const useLessonProgress = (classId: string | undefined, studentId?: string) => {
  return useQuery({
    queryKey: queryKeys.lessonProgress(classId || ''),
    queryFn: async () => {
      const headers = getAuthHeaders();
      const url = studentId 
        ? `${API_URL}/progress/class/${classId}?studentId=${studentId}`
        : `${API_URL}/progress/class/${classId}`;
      const response = await axios.get(url, { headers });
      return response.data.data || [];
    },
    enabled: !!classId,
    staleTime: staleTimes.dynamic,
  });
};

// ============ Students Hooks ============
export const useStudents = (filters?: { wardId?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: queryKeys.students(filters),
    queryFn: async () => {
      const headers = getAuthHeaders();
      const params = new URLSearchParams();
      if (filters?.wardId) params.append('wardId', filters.wardId);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));
      
      const response = await axios.get(`${API_URL}/students?${params}`, { headers });
      return response.data;
    },
    staleTime: staleTimes.standard,
  });
};

// ============ Instructors Hooks ============
export const useInstructors = (filters?: { wardId?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: queryKeys.instructors(filters),
    queryFn: async () => {
      const headers = getAuthHeaders();
      const params = new URLSearchParams();
      if (filters?.wardId) params.append('wardId', filters.wardId);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));
      
      const response = await axios.get(`${API_URL}/instructors?${params}`, { headers });
      return response.data;
    },
    staleTime: staleTimes.standard,
  });
};

// ============ Wards Hooks ============
export const useWards = () => {
  return useQuery({
    queryKey: queryKeys.wards,
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/wards`);
      return response.data.data || [];
    },
    staleTime: staleTimes.static, // Wards rarely change
  });
};

// ============ Certificate/Progress Hooks ============
export const useCertificateProgress = (classId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.certificateProgress(classId || ''),
    queryFn: async () => {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/progress/certificate/${classId}`, { headers });
      return response.data.data;
    },
    enabled: !!classId,
    staleTime: staleTimes.dynamic,
  });
};

export const useAllStudentsProgress = (classId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.allStudentsProgress(classId || ''),
    queryFn: async () => {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/progress/class/${classId}/all-students`, { headers });
      return response.data.data || [];
    },
    enabled: !!classId,
    staleTime: staleTimes.dynamic,
  });
};

// ============ Grades Hooks ============
export const useStudentGrades = (classId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.studentGrades(classId || ''),
    queryFn: async () => {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/grades/class/${classId}/students`, { headers });
      return response.data.data || [];
    },
    enabled: !!classId,
    staleTime: staleTimes.dynamic,
  });
};

// ============ Messages Hooks ============
export const useConversations = () => {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: async () => {
      const headers = getAuthHeaders();
      if (!headers) return [];
      const response = await axios.get(`${API_URL}/messages/conversations`, { headers });
      return response.data.data || [];
    },
    staleTime: staleTimes.realtime,
  });
};

export const useMessageThread = (partnerId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.messageThread(partnerId || ''),
    queryFn: async () => {
      const headers = getAuthHeaders();
      if (!headers) return [];
      const response = await axios.get(`${API_URL}/messages/thread/${partnerId}`, { headers });
      return response.data.data || [];
    },
    enabled: !!partnerId,
    staleTime: staleTimes.realtime,
  });
};

// ============ Cache Invalidation Helpers ============
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAttendance: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    invalidateEnrollments: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
    invalidateLessons: (classId?: string) => {
      if (classId) {
        queryClient.invalidateQueries({ queryKey: ['lessons', classId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['lessons'] });
      }
    },
    invalidateProgress: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['certificate'] });
    },
    invalidateMessages: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    invalidateGrades: (classId?: string) => {
      if (classId) {
        queryClient.invalidateQueries({ queryKey: ['grades', classId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['grades'] });
      }
    },
    invalidateAll: () => {
      queryClient.invalidateQueries();
    },
  };
};
