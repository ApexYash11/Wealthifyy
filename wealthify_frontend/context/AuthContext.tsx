'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, LoginRequest, RegisterRequest } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if token is expired
  const isTokenExpired = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('jwt');
    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('Token expired, logging out...');
        logout();
        router.push('/login');
        return;
      }
      
      const userData = localStorage.getItem('user');
      if (userData && userData !== 'undefined') {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, [router]);

  const login = async (data: LoginRequest) => {
    try {
      // Use real backend API
      const response = await authAPI.login(data);
      const { token, user: userData } = response.data;
      localStorage.setItem('jwt', token);
      localStorage.setItem('user', JSON.stringify(userData));
      document.cookie = `token=${token}; path=/;`;
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      // Use real backend API
      const response = await authAPI.register(data);
      const { token, user: userData } = response.data;
      localStorage.setItem('jwt', token);
      localStorage.setItem('user', JSON.stringify(userData));
      document.cookie = `token=${token}; path=/;`;
      setUser(userData);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 