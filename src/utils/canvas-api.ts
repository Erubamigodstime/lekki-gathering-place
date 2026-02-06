import axios from 'axios';
import type {
  Lesson,
  CreateLessonDTO,
  UpdateLessonDTO,
  Assignment,
  CreateAssignmentDTO,
  UpdateAssignmentDTO,
  Submission,
  CreateSubmissionDTO,
  UpdateSubmissionDTO,
  Grade,
  CreateGradeDTO,
  UpdateGradeDTO,
  Message,
  CreateMessageDTO,
  Certificate,
  ApiResponse,
  SubmissionStats,
  GradeDistribution,
  CertificateStats,
} from '../types/canvas';

const API_URL = import.meta.env.VITE_API_URL || 'https://lekki-gathering-place-backend-1.onrender.com/api/v1';

// Helper to decode JWT and check expiration
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    // Check if token expires in the next 5 minutes
    return expirationTime < currentTime + (5 * 60 * 1000);
  } catch (error) {
    return true;
  }
}

// Helper to refresh access token
async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return null;
    }

    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken,
    });

    const newAccessToken = response.data.data.accessToken;
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('token', newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

// Create axios instance with auth token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests and refresh if needed
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('token');
  
  // Check if token is expired or expiring soon
  if (token && isTokenExpired(token)) {
    console.log('Token expired or expiring soon, refreshing...');
    const newToken = await refreshAccessToken();
    if (newToken) {
      token = newToken;
      console.log('Token refreshed successfully');
    } else {
      console.error('Token refresh failed, redirecting to login');
      // Clear tokens and redirect to login
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired'));
    }
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log('Received 401, attempting token refresh...');
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        console.log('Token refreshed, retrying request...');
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } else {
        console.error('Token refresh failed, clearing session');
        // Clear tokens and redirect to login
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// LESSON API
// ============================================================================

export const lessonApi = {
  create: async (data: CreateLessonDTO): Promise<Lesson> => {
    const response = await api.post<ApiResponse<Lesson>>('/lessons', data);
    return response.data.data!;
  },

  getById: async (id: string): Promise<Lesson> => {
    const response = await api.get<ApiResponse<Lesson>>(`/lessons/${id}`);
    return response.data.data!;
  },

  getByClass: async (classId: string): Promise<Lesson[]> => {
    const response = await api.get<ApiResponse<Lesson[]>>(`/lessons/class/${classId}`);
    return response.data.data!;
  },

  getByWeek: async (classId: string, weekNumber: number): Promise<Lesson> => {
    const response = await api.get<ApiResponse<Lesson>>(`/lessons/class/${classId}/week/${weekNumber}`);
    return response.data.data!;
  },

  update: async (id: string, data: UpdateLessonDTO): Promise<Lesson> => {
    const response = await api.put<ApiResponse<Lesson>>(`/lessons/${id}`, data);
    return response.data.data!;
  },

  publish: async (id: string): Promise<Lesson> => {
    const response = await api.patch<ApiResponse<Lesson>>(`/lessons/${id}/publish`);
    return response.data.data!;
  },

  unpublish: async (id: string): Promise<Lesson> => {
    const response = await api.patch<ApiResponse<Lesson>>(`/lessons/${id}/unpublish`);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/lessons/${id}`);
  },

  markComplete: async (lessonId: string): Promise<void> => {
    await api.post(`/lessons/${lessonId}/complete`);
  },

  markIncomplete: async (lessonId: string): Promise<void> => {
    await api.delete(`/lessons/${lessonId}/complete`);
  },

  getStudentCompletedLessons: async (classId?: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/lessons/student/completed', {
      params: { classId },
    });
    return response.data.data!;
  },

  getStudentProgress: async (lessonId: string, studentId: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/lessons/${lessonId}/progress/${studentId}`);
    return response.data.data!;
  },
};

// ============================================================================
// ASSIGNMENT API
// ============================================================================

export const assignmentApi = {
  create: async (data: CreateAssignmentDTO): Promise<Assignment> => {
    const response = await api.post<ApiResponse<Assignment>>('/assignments', data);
    return response.data.data!;
  },

  getById: async (id: string): Promise<Assignment> => {
    const response = await api.get<ApiResponse<Assignment>>(`/assignments/${id}`);
    return response.data.data!;
  },

  getByLesson: async (lessonId: string): Promise<Assignment[]> => {
    const response = await api.get<ApiResponse<Assignment[]>>(`/assignments/lesson/${lessonId}`);
    return response.data.data!;
  },

  getByClass: async (classId: string): Promise<Assignment[]> => {
    const response = await api.get<ApiResponse<Assignment[]>>(`/assignments/class/${classId}`);
    return response.data.data!;
  },

  getForStudent: async (classId: string, studentId: string): Promise<Assignment[]> => {
    const response = await api.get<ApiResponse<Assignment[]>>(`/assignments/class/${classId}/student/${studentId}`);
    return response.data.data!;
  },

  update: async (id: string, data: UpdateAssignmentDTO): Promise<Assignment> => {
    const response = await api.put<ApiResponse<Assignment>>(`/assignments/${id}`, data);
    return response.data.data!;
  },

  publish: async (id: string): Promise<Assignment> => {
    const response = await api.patch<ApiResponse<Assignment>>(`/assignments/${id}/publish`);
    return response.data.data!;
  },

  unpublish: async (id: string): Promise<Assignment> => {
    const response = await api.patch<ApiResponse<Assignment>>(`/assignments/${id}/unpublish`);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/assignments/${id}`);
  },

  getSubmissionStats: async (id: string): Promise<SubmissionStats> => {
    const response = await api.get<ApiResponse<SubmissionStats>>(`/assignments/${id}/stats`);
    return response.data.data!;
  },

  duplicate: async (id: string): Promise<Assignment> => {
    const response = await api.post<ApiResponse<Assignment>>(`/assignments/${id}/duplicate`);
    return response.data.data!;
  },
};

// ============================================================================
// SUBMISSION API
// ============================================================================

export const submissionApi = {
  create: async (data: CreateSubmissionDTO): Promise<Submission> => {
    const response = await api.post<ApiResponse<Submission>>('/submissions', data);
    return response.data.data!;
  },

  getById: async (id: string): Promise<Submission> => {
    const response = await api.get<ApiResponse<Submission>>(`/submissions/${id}`);
    return response.data.data!;
  },

  getByAssignment: async (assignmentId: string): Promise<Submission[]> => {
    const response = await api.get<ApiResponse<Submission[]>>(`/submissions/assignment/${assignmentId}`);
    return response.data.data!;
  },

  getByStudent: async (studentId: string): Promise<Submission[]> => {
    const response = await api.get<ApiResponse<Submission[]>>(`/submissions/student/${studentId}`);
    return response.data.data!;
  },

  update: async (id: string, data: UpdateSubmissionDTO): Promise<Submission> => {
    const response = await api.put<ApiResponse<Submission>>(`/submissions/${id}`, data);
    return response.data.data!;
  },

  submit: async (id: string): Promise<Submission> => {
    const response = await api.patch<ApiResponse<Submission>>(`/submissions/${id}/submit`);
    return response.data.data!;
  },

  approve: async (id: string): Promise<Submission> => {
    const response = await api.patch<ApiResponse<Submission>>(`/submissions/${id}/approve`);
    return response.data.data!;
  },

  reject: async (id: string, feedback: string): Promise<Submission> => {
    const response = await api.patch<ApiResponse<Submission>>(`/submissions/${id}/reject`, { feedback });
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/submissions/${id}`);
  },
};

// ============================================================================
// GRADE API
// ============================================================================

export const gradeApi = {
  create: async (data: CreateGradeDTO): Promise<Grade> => {
    const response = await api.post<ApiResponse<Grade>>('/grades', data);
    return response.data.data!;
  },

  getById: async (id: string): Promise<Grade> => {
    const response = await api.get<ApiResponse<Grade>>(`/grades/${id}`);
    return response.data.data!;
  },

  getBySubmission: async (submissionId: string): Promise<Grade> => {
    const response = await api.get<ApiResponse<Grade>>(`/grades/submission/${submissionId}`);
    return response.data.data!;
  },

  getByStudent: async (studentId: string, classId?: string): Promise<Grade[]> => {
    const url = classId 
      ? `/grades/student/${studentId}?classId=${classId}`
      : `/grades/student/${studentId}`;
    const response = await api.get<ApiResponse<Grade[]>>(url);
    return response.data.data!;
  },

  update: async (id: string, data: UpdateGradeDTO): Promise<Grade> => {
    const response = await api.put<ApiResponse<Grade>>(`/grades/${id}`, data);
    return response.data.data!;
  },

  publish: async (id: string): Promise<Grade> => {
    const response = await api.patch<ApiResponse<Grade>>(`/grades/${id}/publish`);
    return response.data.data!;
  },

  unpublish: async (id: string): Promise<Grade> => {
    const response = await api.patch<ApiResponse<Grade>>(`/grades/${id}/unpublish`);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/grades/${id}`);
  },

  getClassGrades: async (classId: string): Promise<Grade[]> => {
    const response = await api.get<ApiResponse<Grade[]>>(`/grades/class/${classId}`);
    return response.data.data!;
  },

  getDistribution: async (classId: string): Promise<GradeDistribution> => {
    const response = await api.get<ApiResponse<GradeDistribution>>(`/grades/class/${classId}/distribution`);
    return response.data.data!;
  },
};

// ============================================================================
// MESSAGE API
// ============================================================================

export const messageApi = {
  send: async (data: CreateMessageDTO): Promise<Message> => {
    const response = await api.post<ApiResponse<Message>>('/messages', data);
    return response.data.data!;
  },

  reply: async (messageId: string, body: string): Promise<Message> => {
    const response = await api.post<ApiResponse<Message>>(`/messages/${messageId}/reply`, { body });
    return response.data.data!;
  },

  getInbox: async (): Promise<Message[]> => {
    const response = await api.get<ApiResponse<Message[]>>('/messages/inbox');
    return response.data.data!;
  },

  getSent: async (): Promise<Message[]> => {
    const response = await api.get<ApiResponse<Message[]>>('/messages/sent');
    return response.data.data!;
  },

  getClassMessages: async (classId: string): Promise<Message[]> => {
    const response = await api.get<ApiResponse<Message[]>>(`/messages/class/${classId}`);
    return response.data.data!;
  },

  getConversation: async (userId: string): Promise<Message[]> => {
    const response = await api.get<ApiResponse<Message[]>>(`/messages/conversation/${userId}`);
    return response.data.data!;
  },

  markRead: async (id: string): Promise<void> => {
    await api.patch(`/messages/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await api.patch('/messages/read-all');
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/messages/${id}`);
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<{ count: number }>>('/messages/unread-count');
    return response.data.data!.count;
  },
};

// ============================================================================
// CERTIFICATE API
// ============================================================================

export const certificateApi = {
  generate: async (studentId: string, classId: string): Promise<Certificate> => {
    const response = await api.post<ApiResponse<Certificate>>('/certificates/generate', { studentId, classId });
    return response.data.data!;
  },

  getById: async (id: string): Promise<Certificate> => {
    const response = await api.get<ApiResponse<Certificate>>(`/certificates/${id}`);
    return response.data.data!;
  },

  getByCode: async (code: string): Promise<Certificate> => {
    const response = await api.get<ApiResponse<Certificate>>(`/certificates/code/${code}`);
    return response.data.data!;
  },

  getByStudent: async (studentId: string): Promise<Certificate[]> => {
    const response = await api.get<ApiResponse<Certificate[]>>(`/certificates/student/${studentId}`);
    return response.data.data!;
  },

  getByClass: async (classId: string): Promise<Certificate[]> => {
    const response = await api.get<ApiResponse<Certificate[]>>(`/certificates/class/${classId}`);
    return response.data.data!;
  },

  verify: async (code: string): Promise<{ valid: boolean; certificate?: Certificate }> => {
    const response = await api.get<ApiResponse<{ valid: boolean; certificate?: Certificate }>>(`/certificates/verify/${code}`);
    return response.data.data!;
  },

  revoke: async (id: string): Promise<Certificate> => {
    const response = await api.patch<ApiResponse<Certificate>>(`/certificates/${id}/revoke`);
    return response.data.data!;
  },

  download: async (id: string): Promise<Blob> => {
    const response = await api.get(`/certificates/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getStatistics: async (): Promise<CertificateStats> => {
    const response = await api.get<ApiResponse<CertificateStats>>('/certificates/statistics');
    return response.data.data!;
  },
};
