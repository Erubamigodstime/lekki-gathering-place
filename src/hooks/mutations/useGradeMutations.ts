/**
 * Grade & Assignment Mutation Hooks
 * 
 * All grading-related mutations with cache invalidation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { queryKeys } from '@/api/queryKeys';
import type { Grade, Assignment, AssignmentSubmission, Certificate } from '@/api/types';

// ============ Types ============

interface CreateAssignmentInput {
  classId: string;
  title: string;
  description?: string;
  dueDate?: string;
  maxPoints: number;
  lessonId?: string;
}

interface SubmitAssignmentInput {
  assignmentId: string;
  classId: string;
  content?: string;
  fileUrl?: string;
}

interface GradeSubmissionInput {
  submissionId: string;
  assignmentId: string;
  classId: string;
  points: number;
  feedback?: string;
}

interface UpdateGradeInput {
  gradeId: string;
  classId: string;
  points?: number;
  feedback?: string;
  status?: 'DRAFT' | 'PUBLISHED';
}

// ============ Assignment Mutations ============

/**
 * Create a new assignment (instructor)
 */
export function useCreateAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateAssignmentInput): Promise<Assignment> => {
      const response = await apiClient.post('/assignments', data);
      return response.data.data;
    },
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.byClass(classId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.byClass(classId) });
    },
  });
}

/**
 * Update an assignment (instructor)
 */
export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      assignmentId, 
      classId,
      ...data 
    }: Partial<CreateAssignmentInput> & { 
      assignmentId: string;
      classId: string;
    }): Promise<Assignment> => {
      const response = await apiClient.patch(`/assignments/${assignmentId}`, data);
      return response.data.data;
    },
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.byClass(classId) });
    },
  });
}

/**
 * Delete an assignment (instructor)
 */
export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      assignmentId 
    }: { 
      assignmentId: string; 
      classId: string;
    }): Promise<void> => {
      await apiClient.delete(`/assignments/${assignmentId}`);
    },
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.byClass(classId) });
    },
  });
}

// ============ Submission Mutations ============

/**
 * Submit an assignment (student)
 */
export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ assignmentId, content, fileUrl }: SubmitAssignmentInput): Promise<AssignmentSubmission> => {
      const response = await apiClient.post(`/assignments/${assignmentId}/submit`, { 
        content, 
        fileUrl 
      });
      return response.data.data;
    },
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.grades.myGrades(classId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.certificates.eligibility(classId) });
    },
  });
}

/**
 * Upload file for assignment submission
 */
export function useUploadSubmissionFile() {
  return useMutation({
    mutationFn: async ({ 
      assignmentId, 
      file 
    }: { 
      assignmentId: string; 
      file: File;
    }): Promise<{ fileUrl: string }> => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(`/assignments/${assignmentId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
  });
}

// ============ Grading Mutations ============

/**
 * Grade a submission (instructor)
 */
export function useGradeSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      submissionId, 
      points, 
      feedback 
    }: GradeSubmissionInput): Promise<Grade> => {
      const response = await apiClient.post(`/submissions/${submissionId}/grade`, { 
        points, 
        feedback 
      });
      return response.data.data;
    },
    onSuccess: (_, { classId, assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.submissions(assignmentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.certificates.allStudentsProgress(classId) });
    },
  });
}

/**
 * Update an existing grade (instructor)
 */
export function useUpdateGrade() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ gradeId, points, feedback, status }: UpdateGradeInput): Promise<Grade> => {
      const response = await apiClient.patch(`/grades/${gradeId}`, { 
        points, 
        feedback,
        status 
      });
      return response.data.data;
    },
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.grades.myGrades(classId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.certificates.allStudentsProgress(classId) });
    },
  });
}

/**
 * Publish all draft grades for a class (instructor)
 */
export function usePublishGrades() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ classId }: { classId: string }): Promise<{ published: number }> => {
      const response = await apiClient.post(`/grades/class/${classId}/publish`);
      return response.data.data;
    },
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.grades.myGrades(classId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.certificates.allStudentsProgress(classId) });
    },
  });
}

// ============ Certificate Mutations ============

/**
 * Issue certificate to a student (instructor)
 */
export function useIssueCertificate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      classId, 
      studentId 
    }: { 
      classId: string; 
      studentId: string;
    }): Promise<Certificate> => {
      const response = await apiClient.post('/certificates/issue', { classId, studentId });
      return response.data.data;
    },
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.certificates.allStudentsProgress(classId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.certificates.myCertificates() });
    },
  });
}

/**
 * Bulk issue certificates (instructor)
 */
export function useBulkIssueCertificates() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      classId, 
      studentIds 
    }: { 
      classId: string; 
      studentIds: string[];
    }): Promise<{ issued: number }> => {
      const response = await apiClient.post('/certificates/bulk-issue', { classId, studentIds });
      return response.data.data;
    },
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.certificates.allStudentsProgress(classId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.certificates.myCertificates() });
    },
  });
}
