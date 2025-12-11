export type UserRole = 'admin' | 'instructor' | 'student';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type AttendanceStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  wardId: string;
  profilePicture?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface Ward {
  id: string;
  name: string;
}

export interface Instructor extends User {
  skills: string[];
  availabilityCalendar?: Record<string, string[]>;
  documents: string[];
  approvalStatus: ApprovalStatus;
}

export interface Student extends User {
  enrollmentHistory: string[];
}

export interface Class {
  id: string;
  name: string;
  description: string;
  schedule: {
    days: string[];
    time: string;
  };
  instructorId: string;
  maxCapacity: number;
  wardId: string;
  enrolledCount: number;
}

export interface Enrollment {
  id: string;
  classId: string;
  studentId: string;
  status: ApprovalStatus;
  enrolledAt: Date;
}

export interface Attendance {
  id: string;
  classId: string;
  studentId: string;
  date: Date;
  status: AttendanceStatus;
  approvedByInstructorId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  type: 'info' | 'success' | 'warning' | 'error';
}
