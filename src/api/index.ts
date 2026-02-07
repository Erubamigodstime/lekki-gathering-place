/**
 * API Module Index
 * 
 * Central export for all API-related utilities
 */

// Client
export { default as apiClient, extractData, extractPaginatedData } from './apiClient';

// Query Keys & Cache Config
export { queryKeys, staleTime, gcTime } from './queryKeys';

// Types
export type {
  // Base
  Pagination,
  PaginatedResponse,
  
  // User & Auth
  User,
  Instructor,
  InstructorProfile,
  Student,
  Ward,
  
  // Classes & Lessons
  Class,
  ClassSchedule,
  Lesson,
  LessonMaterial,
  
  // Enrollment
  Enrollment,
  
  // Attendance
  AttendanceRecord,
  
  // Assignments & Grades
  Assignment,
  AssignmentSubmission,
  Grade,
  
  // Certificates
  Certificate,
  CertificateEligibility,
  StudentProgress,
  
  // Messaging
  Message,
  Conversation,
} from './types';
