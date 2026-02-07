/**
 * Profile/User Mutation Hooks
 * 
 * All profile and user-related mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { queryKeys } from '@/api/queryKeys';
import type { User, Instructor, Student } from '@/api/types';

// ============ Types ============

interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
}

interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

interface UploadAvatarInput {
  file: File;
}

// ============ Mutations ============

/**
 * Update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateProfileInput): Promise<User> => {
      const response = await apiClient.patch('/users/profile', data);
      return response.data.data;
    },
    onSuccess: (updatedUser) => {
      // Update the cached profile data
      queryClient.setQueryData(queryKeys.users.profile(), updatedUser);
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
    },
  });
}

/**
 * Update instructor profile
 */
export function useUpdateInstructorProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Instructor>): Promise<Instructor> => {
      const response = await apiClient.patch('/instructors/profile', data);
      return response.data.data;
    },
    onSuccess: (updatedInstructor) => {
      queryClient.setQueryData(queryKeys.users.instructorProfile(), updatedInstructor);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.instructorProfile() });
    },
  });
}

/**
 * Update student profile
 */
export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Student>): Promise<Student> => {
      const response = await apiClient.patch('/students/profile', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
    },
  });
}

/**
 * Change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: UpdatePasswordInput): Promise<{ message: string }> => {
      const response = await apiClient.patch('/users/password', data);
      return response.data;
    },
  });
}

/**
 * Upload profile avatar
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file }: UploadAvatarInput): Promise<{ avatarUrl: string }> => {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await apiClient.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.instructorProfile() });
    },
  });
}

/**
 * Delete account (soft delete)
 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async (): Promise<void> => {
      await apiClient.delete('/users/account');
      // Clear all local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  });
}

/**
 * Request password reset
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (email: string): Promise<{ message: string }> => {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    },
  });
}

/**
 * Reset password with token
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ 
      token, 
      password 
    }: { 
      token: string; 
      password: string;
    }): Promise<{ message: string }> => {
      const response = await apiClient.post('/auth/reset-password', { token, password });
      return response.data;
    },
  });
}
