/**
 * Enterprise API Types
 * 
 * Centralized TypeScript definitions for all API responses
 * Single source of truth for data shapes
 */

// ============ Common Types ============
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// ============ User Types ============
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  wardId?: string;
  ward?: Ward;
  createdAt: string;
  updatedAt: string;
}

export interface Ward {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

// ============ Instructor Types ============
export interface Instructor {
  id: string;
  userId: string;
  user: User;
  bio?: string;
  specializations?: string[];
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  classes?: Class[];
  createdAt: string;
}

export interface InstructorProfile extends Instructor {
  _count?: {
    classes: number;
    enrollments: number;
  };
}

// ============ Student Types ============
export interface Student {
  id: string;
  userId: string;
  user: User;
  enrollments?: Enrollment[];
  attendances?: AttendanceRecord[];
  _count?: {
    enrollments: number;
    attendances: number;
  };
}

// ============ Class Types ============
export interface ClassSchedule {
  days: string[];
  startTime?: string;
  endTime?: string;
}

export interface Class {
  id: string;
  name: string;
  description?: string;
  wardId: string;
  ward: Ward;
  instructorId: string;
  instructor: {
    id: string;
    user: Pick<User, 'id' | 'firstName' | 'lastName' | 'profilePicture'>;
  };
  schedule?: ClassSchedule;
  maxCapacity: number;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
  startDate?: string;
  endDate?: string;
  _count?: {
    enrollments: number;
    lessons: number;
  };
  createdAt: string;
}

// ============ Enrollment Types ============
export type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DROPPED';

export interface Enrollment {
  id: string;
  studentId: string;
  student: Student;
  classId: string;
  class: Class;
  status: EnrollmentStatus;
  enrolledAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

// ============ Attendance Types ============
export type AttendanceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  student?: {
    id: string;
    user: Pick<User, 'id' | 'firstName' | 'lastName' | 'profilePicture'>;
  };
  classId: string;
  class?: Pick<Class, 'id' | 'name'>;
  date: string;
  status: AttendanceStatus;
  markedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

// ============ Lesson Types ============
export interface Lesson {
  id: string;
  classId: string;
  title: string;
  description?: string;
  weekNumber: number;
  content?: string;
  isPublished: boolean;
  publishedAt?: string;
  order: number;
  materials?: LessonMaterial[];
  assignments?: Assignment[];
  createdAt: string;
}

export interface LessonMaterial {
  id: string;
  lessonId: string;
  title: string;
  type: 'PDF' | 'VIDEO' | 'LINK' | 'IMAGE' | 'DOCUMENT';
  url: string;
  size?: number;
  createdAt: string;
}

// ============ Assignment Types ============
export type AssignmentType = 'QUIZ' | 'ESSAY' | 'PROJECT' | 'HOMEWORK';

export interface Assignment {
  id: string;
  lessonId: string;
  lesson?: Pick<Lesson, 'id' | 'title' | 'weekNumber'>;
  title: string;
  description?: string;
  type: AssignmentType;
  maxPoints: number;
  dueDate: string;
  isPublished: boolean;
  submissions?: AssignmentSubmission[];
  _count?: {
    submissions: number;
  };
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignment?: Assignment;
  studentId: string;
  student?: Student;
  content?: string;
  fileUrl?: string;
  submittedAt: string;
  grade?: Grade;
}

// ============ Grade Types ============
export type GradeStatus = 'PENDING' | 'PUBLISHED' | 'ARCHIVED';

export interface Grade {
  id: string;
  submissionId: string;
  submission?: AssignmentSubmission;
  points: number;
  maxPoints: number;
  percentage: number;
  instructorComment?: string;
  status: GradeStatus;
  gradedAt: string;
  gradedBy?: string;
  publishedAt?: string;
}

// ============ Certificate Types ============
export interface Certificate {
  id: string;
  studentId: string;
  classId: string;
  class?: Class;
  issuedAt: string;
  certificateUrl?: string;
  attendanceScore: number;
  assignmentScore: number;
  finalScore: number;
}

export interface CertificateEligibility {
  eligible: boolean;
  reason: string;
  progress: number;
  attendanceRate: number;
  assignmentRate: number;
  details: {
    totalLessons: number;
    attendedLessons: number;
    totalAssignments: number;
    completedAssignments: number;
    passingThreshold: number;
  };
}

export interface StudentProgress {
  student: Pick<Student, 'id'> & {
    user: Pick<User, 'id' | 'firstName' | 'lastName' | 'profilePicture'>;
  };
  attendanceRate: number;
  assignmentRate: number;
  finalScore: number;
  eligible: boolean;
  attendanceCount: number;
  totalLessons: number;
  completedAssignments: number;
  totalAssignments: number;
}

// ============ Message Types ============
export interface Message {
  id: string;
  senderId: string;
  sender?: User;
  receiverId: string;
  receiver?: User;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  partnerId: string;
  partner: Pick<User, 'id' | 'firstName' | 'lastName' | 'profilePicture' | 'role'>;
  lastMessage?: Message;
  unreadCount: number;
}

// ============ API Request Types ============
export interface MarkAttendanceRequest {
  classId: string;
  date?: string;
}

export interface ApproveAttendanceRequest {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface ApproveEnrollmentRequest {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  wardId?: string;
}

export interface SubmitAssignmentRequest {
  content?: string;
  fileUrl?: string;
}

export interface GradeSubmissionRequest {
  points: number;
  instructorComment?: string;
  publish?: boolean;
}
