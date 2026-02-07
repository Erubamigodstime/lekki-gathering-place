/**
 * Grade & Certificate Query Hooks
 * 
 * All grading and certificate-related data fetching
 */

import { useQuery } from '@tanstack/react-query';
import apiClient, { extractData } from '@/api/apiClient';
import { queryKeys, staleTime } from '@/api/queryKeys';
import type { 
  Grade, 
  Certificate, 
  CertificateEligibility, 
  StudentProgress,
  Assignment,
  AssignmentSubmission 
} from '@/api/types';

// ============ Grade Queries ============

/**
 * Fetch student's grades for a class
 */
export function useMyGrades(classId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.grades.myGrades(classId || ''),
    queryFn: async (): Promise<Grade[]> => {
      const response = await apiClient.get(`/grades/my-grades/${classId}`);
      return extractData<Grade[]>(response) || [];
    },
    enabled: !!classId,
    staleTime: staleTime.dynamic,
  });
}

/**
 * Fetch all assignments for a class (instructor view)
 */
export function useClassAssignments(classId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.assignments.byClass(classId || ''),
    queryFn: async (): Promise<Assignment[]> => {
      const response = await apiClient.get(`/assignments/class/${classId}`);
      return extractData<Assignment[]>(response) || [];
    },
    enabled: !!classId,
    staleTime: staleTime.standard,
  });
}

/**
 * Fetch submissions for an assignment
 */
export function useAssignmentSubmissions(assignmentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.assignments.submissions(assignmentId || ''),
    queryFn: async (): Promise<AssignmentSubmission[]> => {
      const response = await apiClient.get(`/assignments/${assignmentId}/submissions`);
      return extractData<AssignmentSubmission[]>(response) || [];
    },
    enabled: !!assignmentId,
    staleTime: staleTime.dynamic,
  });
}

// ============ Certificate Queries ============

/**
 * Fetch student's certificates
 */
export function useMyCertificates() {
  return useQuery({
    queryKey: queryKeys.certificates.myCertificates(),
    queryFn: async (): Promise<Certificate[]> => {
      const response = await apiClient.get('/certificates/my-certificates');
      return extractData<Certificate[]>(response) || [];
    },
    staleTime: staleTime.static,
  });
}

/**
 * Fetch certificate eligibility for a class
 */
export function useCertificateEligibility(classId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.certificates.eligibility(classId || ''),
    queryFn: async (): Promise<CertificateEligibility> => {
      const response = await apiClient.get(`/certificates/eligibility/${classId}`);
      return extractData<CertificateEligibility>(response) || {
        eligible: false,
        reason: 'Unable to determine eligibility',
        progress: 0,
        attendanceRate: 0,
        assignmentRate: 0,
        details: {
          totalLessons: 0,
          attendedLessons: 0,
          totalAssignments: 0,
          completedAssignments: 0,
          passingThreshold: 75,
        },
      };
    },
    enabled: !!classId,
    staleTime: staleTime.dynamic,
  });
}

/**
 * Fetch all students' progress for a class (instructor view)
 */
export function useAllStudentsProgress(classId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.certificates.allStudentsProgress(classId || ''),
    queryFn: async (): Promise<StudentProgress[]> => {
      const response = await apiClient.get(`/certificates/progress/${classId}`);
      return extractData<StudentProgress[]>(response) || [];
    },
    enabled: !!classId,
    staleTime: staleTime.dynamic,
  });
}

// ============ Derived Helpers ============

/**
 * Calculate overall grade percentage
 */
export function calculateOverallGrade(grades: Grade[]): number {
  if (grades.length === 0) return 0;
  const publishedGrades = grades.filter(g => g.status === 'PUBLISHED');
  if (publishedGrades.length === 0) return 0;
  
  const totalPoints = publishedGrades.reduce((sum, g) => sum + g.points, 0);
  const maxPoints = publishedGrades.reduce((sum, g) => sum + g.maxPoints, 0);
  
  return maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
}

/**
 * Get letter grade from percentage
 */
export function getLetterGrade(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

/**
 * Filter students by eligibility status
 */
export function filterStudentsByEligibility(
  students: StudentProgress[], 
  filter: 'all' | 'eligible' | 'not-eligible'
): StudentProgress[] {
  if (filter === 'all') return students;
  if (filter === 'eligible') return students.filter(s => s.eligible);
  return students.filter(s => !s.eligible);
}

/**
 * Calculate class statistics
 */
export function calculateClassStats(students: StudentProgress[]): {
  totalStudents: number;
  eligibleCount: number;
  averageAttendance: number;
  averageAssignment: number;
} {
  if (students.length === 0) {
    return {
      totalStudents: 0,
      eligibleCount: 0,
      averageAttendance: 0,
      averageAssignment: 0,
    };
  }
  
  const eligibleCount = students.filter(s => s.eligible).length;
  const avgAttendance = students.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length;
  const avgAssignment = students.reduce((sum, s) => sum + s.assignmentRate, 0) / students.length;
  
  return {
    totalStudents: students.length,
    eligibleCount,
    averageAttendance: Math.round(avgAttendance),
    averageAssignment: Math.round(avgAssignment),
  };
}
