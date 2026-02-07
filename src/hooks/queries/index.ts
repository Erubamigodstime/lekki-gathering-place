/**
 * Query Hooks Index
 * 
 * Re-exports all query hooks for clean imports
 */

// Attendance
export {
  useMyAttendance,
  useAttendanceList,
  usePendingAttendance,
  useClassAttendance,
  calculateAttendanceRate,
  getTodayAttendance,
  isAttendanceMarkedToday,
} from './useAttendanceQueries';

// Enrollments
export {
  useMyEnrollments,
  useMyClasses,
  useEnrollmentList,
  useClassEnrollments,
  usePendingEnrollments,
  filterByStatus,
  getApprovedEnrollments,
  isEnrolledInClass,
} from './useEnrollmentQueries';

// Users
export {
  useUserProfile,
  useInstructorProfile,
  useInstructorList,
  useStudentByUserId,
  useStudentList,
  useWards,
} from './useUserQueries';

// Classes
export {
  useClasses,
  useClassById,
  useInstructorClasses,
  getUniqueWards,
  filterByWard,
  searchClasses,
} from './useClassQueries';

// Lessons
export {
  useLessons,
  useLessonById,
  useLessonMaterials,
  useLessonProgress,
  groupLessonsByWeek,
  countCompletedLessons,
  calculateCompletionPercentage,
} from './useLessonQueries';
export type { WeekModule, LessonProgress } from './useLessonQueries';

// Grades & Certificates
export {
  useMyGrades,
  useClassAssignments,
  useAssignmentSubmissions,
  useMyCertificates,
  useCertificateEligibility,
  useAllStudentsProgress,
  calculateOverallGrade,
  getLetterGrade,
  filterStudentsByEligibility,
  calculateClassStats,
} from './useGradeQueries';
