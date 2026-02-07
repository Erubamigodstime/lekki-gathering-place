/**
 * Enterprise API Client
 * 
 * Centralized axios instance with:
 * - Request/Response interceptors
 * - Automatic auth header injection
 * - Global error handling
 * - Request/Response logging (dev mode)
 */

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ Request Interceptor ============
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Inject auth token
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============ Response Interceptor ============
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ [API Response] ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error: AxiosError) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error(`❌ [API Error] ${error.config?.url} - ${error.response?.status}`, error.message);
    }

    // Handle specific error codes
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') && 
          !window.location.pathname.startsWith('/signup')) {
        window.location.href = '/login';
      }
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server may be waking up');
    }

    return Promise.reject(error);
  }
);

// ============ Helper Functions ============

/**
 * Extract data from API response
 * Handles both { data: T } and { data: { data: T } } structures
 */
export function extractData<T>(response: AxiosResponse): T {
  const responseData = response.data;
  
  // Handle nested data structure { data: { data: [...] } }
  if (responseData?.data?.data !== undefined) {
    return responseData.data.data;
  }
  
  // Handle single data structure { data: [...] }
  if (responseData?.data !== undefined) {
    return responseData.data;
  }
  
  return responseData;
}

/**
 * Extract paginated data from API response
 */
export function extractPaginatedData<T>(response: AxiosResponse): {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
} {
  const responseData = response.data;
  
  // Handle { data: { data: [...], pagination: {...} } }
  if (responseData?.data?.data && responseData?.data?.pagination) {
    return {
      data: responseData.data.data,
      pagination: responseData.data.pagination,
    };
  }
  
  // Handle { data: [...] } - no pagination
  if (Array.isArray(responseData?.data)) {
    return {
      data: responseData.data,
      pagination: { page: 1, limit: 100, total: responseData.data.length, pages: 1 },
    };
  }
  
  return {
    data: [],
    pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  };
}

export default apiClient;
