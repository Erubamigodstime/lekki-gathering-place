import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  wardId: string;
  phone: string;
  classId?: string; // Optional for instructor class assignment
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Backend API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (token) {
        try {
          // Ensure token is set for API calls
          if (!localStorage.getItem('token')) {
            localStorage.setItem('token', token);
          }
          
          const response = await apiCall('/auth/profile');
          setUser(response.data);
          
          // Ensure userId is stored
          if (response.data?.id && !localStorage.getItem('userId')) {
            localStorage.setItem('userId', response.data.id);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // Clear all auth tokens on error
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setUser(null);
        }
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting login with:', { email, apiUrl: `${API_BASE_URL}/auth/login` });
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response:', response);

      // Store tokens
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      // Store userId for API calls
      if (response.data.user?.id) {
        localStorage.setItem('userId', response.data.user.id);
      }
      
      // Store token in axios-style for canvas-api
      localStorage.setItem('token', response.data.accessToken);

      // Set user
      setUser(response.data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    setLoading(true);
    try {
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Store tokens
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      // Store userId for API calls
      if (response.data.user?.id) {
        localStorage.setItem('userId', response.data.user.id);
      }
      
      // Store token in axios-style for canvas-api
      localStorage.setItem('token', response.data.accessToken);

      // Set user
      setUser(response.data.user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      signup, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
