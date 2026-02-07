/**
 * Mutation Hooks Index
 * 
 * Re-exports all mutation hooks for clean imports
 */

// Attendance
export {
  useMarkAttendance,
  useApproveAttendance,
  useRejectAttendance,
  useBulkMarkAttendance,
  useProcessAllPending,
} from './useAttendanceMutations';

// Enrollments
export {
  useEnroll,
  useApproveEnrollment,
  useRejectEnrollment,
  useUnenroll,
  useBulkProcessEnrollments,
} from './useEnrollmentMutations';

// Profile
export {
  useUpdateProfile,
  useUpdateInstructorProfile,
  useUpdateStudentProfile,
  useChangePassword,
  useUploadAvatar,
  useDeleteAccount,
  useRequestPasswordReset,
  useResetPassword,
} from './useProfileMutations';

// Grades & Assignments
export {
  useCreateAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
  useSubmitAssignment,
  useUploadSubmissionFile,
  useGradeSubmission,
  useUpdateGrade,
  usePublishGrades,
  useIssueCertificate,
  useBulkIssueCertificates,
} from './useGradeMutations';
