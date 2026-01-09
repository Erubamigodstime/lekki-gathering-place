/**
 * Enrollment Service
 * Handles all enrollment-related API calls
 * 
 * @module services/enrollment
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface EnrollmentValidationRequest {
  email: string;
  classId: string;
}

export interface EnrollmentValidationResponse {
  userExists: boolean;
  alreadyEnrolled: boolean;
  canEnroll: boolean;
  message: string;
  userId?: string;
  enrollmentId?: string;
}

export interface EnrollmentRequest {
  email: string;
  classId: string;
  userId?: string;
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  enrollmentId: string;
  classId: string;
  userId: string;
  enrolledAt: string;
}

export interface EnrollmentError {
  error: string;
  message: string;
  statusCode: number;
}

/**
 * Validates if a user can enroll in a class
 * Checks:
 * 1. If user exists in the system
 * 2. If user is already enrolled in the class
 * 3. If there are available spots
 * 
 * @param data - Validation request data
 * @returns Promise with validation result
 */
export async function validateEnrollment(
  data: EnrollmentValidationRequest
): Promise<EnrollmentValidationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/enrollment/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData: EnrollmentError = await response.json();
      throw new Error(errorData.message || 'Validation failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Enrollment validation error:', error);
    throw error;
  }
}

/**
 * Enrolls a user in a class
 * Prerequisites:
 * - User must exist (validated)
 * - User must not be already enrolled
 * - Class must have available spots
 * 
 * @param data - Enrollment request data
 * @returns Promise with enrollment result
 */
export async function enrollInClass(
  data: EnrollmentRequest
): Promise<EnrollmentResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/enrollment/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication token when available
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData: EnrollmentError = await response.json();
      throw new Error(errorData.message || 'Enrollment failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Enrollment error:', error);
    throw error;
  }
}

/**
 * Gets all enrollments for a user
 * 
 * @param userId - User ID
 * @returns Promise with list of enrollments
 */
export async function getUserEnrollments(userId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/enrollment/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication token when available
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData: EnrollmentError = await response.json();
      throw new Error(errorData.message || 'Failed to fetch enrollments');
    }

    return await response.json();
  } catch (error) {
    console.error('Get enrollments error:', error);
    throw error;
  }
}

/**
 * Gets all enrollments for a class
 * 
 * @param classId - Class ID
 * @returns Promise with list of enrollments
 */
export async function getClassEnrollments(classId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/enrollment/class/${classId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication token when available
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData: EnrollmentError = await response.json();
      throw new Error(errorData.message || 'Failed to fetch class enrollments');
    }

    return await response.json();
  } catch (error) {
    console.error('Get class enrollments error:', error);
    throw error;
  }
}

/**
 * Cancels/withdraws a user's enrollment from a class
 * 
 * @param enrollmentId - Enrollment ID
 * @returns Promise with cancellation result
 */
export async function cancelEnrollment(enrollmentId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/enrollment/${enrollmentId}/cancel`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication token when available
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData: EnrollmentError = await response.json();
      throw new Error(errorData.message || 'Failed to cancel enrollment');
    }

    return await response.json();
  } catch (error) {
    console.error('Cancel enrollment error:', error);
    throw error;
  }
}

/**
 * Checks if a specific user is enrolled in a specific class
 * 
 * @param userId - User ID
 * @param classId - Class ID
 * @returns Promise with enrollment status
 */
export async function checkEnrollmentStatus(userId: string, classId: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/enrollment/check?userId=${userId}&classId=${classId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token when available
          // 'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData: EnrollmentError = await response.json();
      throw new Error(errorData.message || 'Failed to check enrollment status');
    }

    return await response.json();
  } catch (error) {
    console.error('Check enrollment status error:', error);
    throw error;
  }
}
