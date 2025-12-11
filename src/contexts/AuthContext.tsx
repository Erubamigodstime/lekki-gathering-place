import React, { createContext, useContext, useState, useCallback } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<string, User & { password: string }> = {
  'admin@church.org': {
    id: '1',
    firstName: 'John',
    lastName: 'Administrator',
    email: 'admin@church.org',
    password: 'admin123',
    phone: '+1234567890',
    role: 'admin',
    wardId: '1',
    profilePicture: '',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'instructor@church.org': {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Teacher',
    email: 'instructor@church.org',
    password: 'instructor123',
    phone: '+1234567891',
    role: 'instructor',
    wardId: '1',
    profilePicture: '',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'student@church.org': {
    id: '3',
    firstName: 'Michael',
    lastName: 'Learner',
    email: 'student@church.org',
    password: 'student123',
    phone: '+1234567892',
    role: 'student',
    wardId: '1',
    profilePicture: '',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    const mockUser = mockUsers[email];
    if (mockUser && mockUser.password === password) {
      const { password: _, ...userWithoutPassword } = mockUser;
      setUser(userWithoutPassword);
    } else {
      throw new Error('Invalid email or password');
    }
    setLoading(false);
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    const newUser: User = {
      id: Date.now().toString(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      wardId: data.wardId,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setUser(newUser);
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
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
