// Canvas LMS Types
export type AssignmentType = 'HOMEWORK' | 'QUIZ' | 'PROJECT' | 'EXAM';
export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'GRADED' | 'APPROVED' | 'REJECTED';
export type MessageType = 'DIRECT' | 'CLASS' | 'BROADCAST';
export type CertificateStatus = 'ACTIVE' | 'REVOKED';
export type GradeStatus = 'DRAFT' | 'PUBLISHED';

// Lesson Types
export interface Lesson {
  id: string;
  classId: string;
  weekNumber: number;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  attachments?: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
  class?: {
    id: string;
    name: string;
  };
}

export interface CreateLessonDTO {
  classId: string;
  weekNumber: number;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  attachments?: string[];
}

export interface UpdateLessonDTO {
  weekNumber?: number;
  title?: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  attachments?: string[];
}

// Assignment Types
export interface Assignment {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  type: AssignmentType;
  dueDate: string;
  maxPoints: number;
  attachments?: string[];
  published: boolean;
  allowLateSubmission: boolean;
  lateSubmissionPenalty?: number;
  createdAt: string;
  updatedAt: string;
  lesson?: {
    id: string;
    title: string;
    class: {
      id: string;
      name: string;
    };
  };
}

export interface CreateAssignmentDTO {
  lessonId: string;
  title: string;
  description: string;
  type: AssignmentType;
  dueDate: string;
  maxPoints: number;
  attachments?: string[];
  allowLateSubmission?: boolean;
  lateSubmissionPenalty?: number;
}

export interface UpdateAssignmentDTO {
  title?: string;
  description?: string;
  type?: AssignmentType;
  dueDate?: string;
  maxPoints?: number;
  attachments?: string[];
  allowLateSubmission?: boolean;
  lateSubmissionPenalty?: number;
}

// Submission Types
export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  attemptNumber: number;
  submissionUrl?: string;
  attachments?: string[];
  content?: string;
  status: SubmissionStatus;
  submittedAt?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  assignment?: Assignment;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  grade?: Grade;
}

export interface CreateSubmissionDTO {
  assignmentId: string;
  content?: string;
  submissionUrl?: string;
  attachments?: string[];
}

export interface UpdateSubmissionDTO {
  content?: string;
  submissionUrl?: string;
  attachments?: string[];
}

// Grade Types
export interface Grade {
  id: string;
  submissionId: string;
  studentId: string;
  gradedById: string;
  score: number;
  percentage: number;
  letterGrade?: string;
  feedback?: string;
  status: GradeStatus;
  gradedAt?: string;
  createdAt: string;
  updatedAt: string;
  submission?: Submission;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  gradedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateGradeDTO {
  submissionId: string;
  score: number;
  feedback?: string;
}

export interface UpdateGradeDTO {
  score?: number;
  feedback?: string;
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  recipientId?: string;
  classId?: string;
  type: MessageType;
  subject: string;
  body: string;
  attachments?: string[];
  parentMessageId?: string;
  isRead: boolean;
  readAt?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  recipient?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  class?: {
    id: string;
    name: string;
  };
}

export interface CreateMessageDTO {
  recipientId?: string;
  classId?: string;
  type: MessageType;
  subject: string;
  body: string;
  attachments?: string[];
  parentMessageId?: string;
}

// Certificate Types
export interface Certificate {
  id: string;
  studentId: string;
  classId: string;
  code: string;
  issuedAt: string;
  expiresAt?: string;
  status: CertificateStatus;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  class?: {
    id: string;
    name: string;
  };
}

// Week Progress Types
export interface WeekProgress {
  id: string;
  enrollmentId: string;
  weekNumber: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Statistics Types
export interface SubmissionStats {
  total: number;
  submitted: number;
  graded: number;
  pending: number;
  averageScore?: number;
}

export interface GradeDistribution {
  A: number;
  B: number;
  C: number;
  D: number;
  F: number;
}

export interface CertificateStats {
  totalIssued: number;
  activeCount: number;
  revokedCount: number;
}
