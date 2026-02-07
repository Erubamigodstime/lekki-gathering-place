/**
 * Enterprise Query Keys Factory
 * 
 * Type-safe query key management for React Query
 * Ensures consistent cache invalidation across the app
 * 
 * Pattern: Each entity has a factory that returns consistent keys
 * Reference: https://tkdodo.eu/blog/effective-react-query-keys
 */

// ============ Query Key Factory Pattern ============

export const queryKeys = {
  // ============ User/Profile ============
  users: {
    all: ['users'] as const,
    profile: () => [...queryKeys.users.all, 'profile'] as const,
    instructorProfile: () => [...queryKeys.users.all, 'instructor-profile'] as const,
    byId: (userId: string) => [...queryKeys.users.all, userId] as const,
  },

  // ============ Instructors ============
  instructors: {
    all: ['instructors'] as const,
    profile: () => [...queryKeys.instructors.all, 'profile'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.instructors.all, 'list', filters] as const,
    byId: (instructorId: string) => [...queryKeys.instructors.all, instructorId] as const,
  },

  // ============ Students ============
  students: {
    all: ['students'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.students.all, 'list', filters] as const,
    byId: (studentId: string) => [...queryKeys.students.all, studentId] as const,
    byUserId: (userId: string) => [...queryKeys.students.all, 'user', userId] as const,
  },

  // ============ Classes ============
  classes: {
    all: ['classes'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.classes.all, 'list', filters] as const,
    byId: (classId: string) => [...queryKeys.classes.all, classId] as const,
    myClasses: () => [...queryKeys.classes.all, 'my-classes'] as const,
  },

  // ============ Enrollments ============
  enrollments: {
    all: ['enrollments'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.enrollments.all, 'list', filters] as const,
    byId: (enrollmentId: string) => [...queryKeys.enrollments.all, enrollmentId] as const,
    myEnrollments: () => [...queryKeys.enrollments.all, 'my-enrollments'] as const,
    myClasses: () => [...queryKeys.enrollments.all, 'my-classes'] as const,
    byClass: (classId: string, status?: string) => [...queryKeys.enrollments.all, 'class', classId, status] as const,
    pending: (classIds?: string[]) => [...queryKeys.enrollments.all, 'pending', classIds] as const,
  },

  // ============ Attendance ============
  attendance: {
    all: ['attendance'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.attendance.all, 'list', filters] as const,
    byId: (attendanceId: string) => [...queryKeys.attendance.all, attendanceId] as const,
    myAttendance: () => [...queryKeys.attendance.all, 'my-attendance'] as const,
    byClass: (classId: string) => [...queryKeys.attendance.all, 'class', classId] as const,
    pending: (classIds?: string[]) => [...queryKeys.attendance.all, 'pending', classIds] as const,
  },

  // ============ Lessons ============
  lessons: {
    all: ['lessons'] as const,
    byClass: (classId: string, includeUnpublished?: boolean) => 
      [...queryKeys.lessons.all, 'class', classId, { includeUnpublished }] as const,
    byId: (lessonId: string) => [...queryKeys.lessons.all, lessonId] as const,
    materials: (lessonId: string) => [...queryKeys.lessons.all, lessonId, 'materials'] as const,
    progress: (classId: string) => [...queryKeys.lessons.all, 'progress', classId] as const,
  },

  // ============ Assignments ============
  assignments: {
    all: ['assignments'] as const,
    byClass: (classId: string) => [...queryKeys.assignments.all, 'class', classId] as const,
    byLesson: (lessonId: string) => [...queryKeys.assignments.all, 'lesson', lessonId] as const,
    byId: (assignmentId: string) => [...queryKeys.assignments.all, assignmentId] as const,
    submissions: (assignmentId: string) => [...queryKeys.assignments.all, assignmentId, 'submissions'] as const,
  },

  // ============ Grades ============
  grades: {
    all: ['grades'] as const,
    byClass: (classId: string) => [...queryKeys.grades.all, 'class', classId] as const,
    myGrades: (classId: string) => [...queryKeys.grades.all, 'my-grades', classId] as const,
    byStudent: (studentId: string, classId?: string) => 
      [...queryKeys.grades.all, 'student', studentId, classId] as const,
  },

  // ============ Certificates ============
  certificates: {
    all: ['certificates'] as const,
    myCertificates: () => [...queryKeys.certificates.all, 'my-certificates'] as const,
    eligibility: (classId: string) => [...queryKeys.certificates.all, 'eligibility', classId] as const,
    progress: (classId: string) => [...queryKeys.certificates.all, 'progress', classId] as const,
    allStudentsProgress: (classId: string) => [...queryKeys.certificates.all, 'all-students', classId] as const,
  },

  // ============ Messages ============
  messages: {
    all: ['messages'] as const,
    conversations: () => [...queryKeys.messages.all, 'conversations'] as const,
    thread: (partnerId: string) => [...queryKeys.messages.all, 'thread', partnerId] as const,
    users: () => [...queryKeys.messages.all, 'users'] as const,
  },

  // ============ Wards ============
  wards: {
    all: ['wards'] as const,
    list: () => [...queryKeys.wards.all, 'list'] as const,
    byId: (wardId: string) => [...queryKeys.wards.all, wardId] as const,
  },

  // ============ Dashboard ============
  dashboard: {
    all: ['dashboard'] as const,
    student: () => [...queryKeys.dashboard.all, 'student'] as const,
    instructor: () => [...queryKeys.dashboard.all, 'instructor'] as const,
    admin: () => [...queryKeys.dashboard.all, 'admin'] as const,
    pendingAttendance: (classIds?: string[]) => 
      [...queryKeys.dashboard.all, 'pending-attendance', classIds] as const,
    pendingEnrollments: (classIds?: string[]) => 
      [...queryKeys.dashboard.all, 'pending-enrollments', classIds] as const,
  },
} as const;

// ============ Stale Time Configuration ============

/**
 * Stale time configuration for different data types
 * Determines how long data is considered fresh before refetching
 */
export const staleTime = {
  /** 30 minutes - Data that rarely changes (wards, class info) */
  static: 30 * 60 * 1000,
  
  /** 5 minutes - Standard data (profiles, enrollments) */
  standard: 5 * 60 * 1000,
  
  /** 2 minutes - Frequently changing data (attendance, grades) */
  dynamic: 2 * 60 * 1000,
  
  /** 30 seconds - Near-realtime data (messages) */
  realtime: 30 * 1000,
  
  /** 0 - Always refetch (critical data) */
  none: 0,
} as const;

// ============ Cache Time Configuration ============

/**
 * Garbage collection time - how long inactive data stays in cache
 */
export const gcTime = {
  /** 1 hour - Keep static data longer */
  long: 60 * 60 * 1000,
  
  /** 30 minutes - Standard cache time */
  standard: 30 * 60 * 1000,
  
  /** 5 minutes - Short-lived data */
  short: 5 * 60 * 1000,
} as const;

// ============ Type exports for key inference ============
export type QueryKeys = typeof queryKeys;
