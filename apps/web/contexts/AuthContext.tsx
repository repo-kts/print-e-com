"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, getProfile, User } from '../lib/api/auth';
import { setAuthToken, getAuthToken } from '../lib/api-client';
import { ApiError } from '../lib/api-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, phone?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getAuthToken();
    console.log('[AuthContext] Checking auth, token exists:', !!token);
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await getProfile();
      console.log('[AuthContext] Profile response:', response);
      
      if (response.success && response.data) {
        console.log('[AuthContext] Setting user:', response.data);
        setUser(response.data);
      } else {
        console.log('[AuthContext] Invalid response, clearing token');
        // Invalid token, remove it
        setAuthToken(null);
      }
    } catch (error) {
      console.error('[AuthContext] Error fetching profile:', error);
      // Error fetching profile, user might not be authenticated
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiLogin({ email, password });
    console.log('[AuthContext] Login response:', response);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || response.message || 'Login failed');
    }

    const { user: userData, token } = response.data;
    console.log('[AuthContext] Setting token and user after login:', { userData, hasToken: !!token });
    setAuthToken(token);
    setUser(userData);
  };

  const register = async (
    email: string,
    password: string,
    name?: string,
    phone?: string
  ) => {
    const response = await apiRegister({ email, password, name, phone });
    if (!response.success || !response.data) {
      throw new Error(response.error || response.message || 'Registration failed');
    }

    const { user: userData, token } = response.data;
    setAuthToken(token);
    setUser(userData);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      // If refresh fails, user might not be authenticated
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
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

