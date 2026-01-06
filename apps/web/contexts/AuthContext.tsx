"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, getProfile, User } from '../lib/api/auth';
import { setAuthToken, getAuthToken } from '../lib/api-client';
import { ApiError } from '../lib/api-client';
import { setUserCookie, getUserCookie, removeUserCookie } from '../lib/cookies';

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

    // Try to get user from cookie first for faster initial load
    const cachedUser = getUserCookie();
    if (cachedUser) {
      setUser(cachedUser as User);
    }

    if (!token) {
      setLoading(false);
      if (!cachedUser) {
        removeUserCookie();
      }
      return;
    }

    try {
      const response = await getProfile();
      console.log('[AuthContext] Profile response:', response);

      if (response.success && response.data) {
        console.log('[AuthContext] Setting user:', response.data);
        setUser(response.data);
        // Store user info in cookie for persistence
        setUserCookie(response.data);
      } else {
        console.log('[AuthContext] Invalid response, clearing token');
        // Invalid token, remove it
        setAuthToken(undefined);
        removeUserCookie();
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthContext] Error fetching profile:', error);

      // Only logout on authentication errors (401), not network errors
      const apiError = error as ApiError;
      if (apiError.statusCode === 401) {
        // Invalid token - clear authentication
        console.log('[AuthContext] 401 error - invalid token, logging out');
        setAuthToken(undefined);
        removeUserCookie();
        setUser(null);
      } else if (apiError.statusCode === 0 || !apiError.statusCode) {
        // Network error - don't logout, keep cached user if available
        console.log('[AuthContext] Network error - keeping cached user');
        if (!cachedUser) {
          // No cached user and network error - clear state
          setUser(null);
        }
      } else {
        // Other errors (500, etc.) - don't logout, might be temporary
        console.log('[AuthContext] API error (non-auth) - keeping user state');
        // Keep user state, error might be temporary
      }
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
    // Store user info in cookie for persistence
    setUserCookie(userData);
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

    // Only set token and user if token is provided (auto-login after registration)
    if (token && userData) {
      setAuthToken(token);
      setUser(userData);
      // Store user info in cookie for persistence
      setUserCookie(userData);
    } else if (userData) {
      // User registered but needs email confirmation
      setUser(userData);
      setUserCookie(userData);
    }
  };

  const logout = () => {
    setAuthToken(undefined);
    setUser(null);
    removeUserCookie();
  };

  const refreshUser = async () => {
    try {
      const response = await getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        // Update user info in cookie
        setUserCookie(response.data);
      } else {
        // Invalid response - check if it's an auth error
        const token = getAuthToken();
        if (!token) {
          // No token means already logged out
          return;
        }
        // Invalid token response - logout
        console.log('[AuthContext] Refresh failed - invalid token response');
        logout();
      }
    } catch (error) {
      const apiError = error as ApiError;

      // Only logout on authentication errors
      if (apiError.statusCode === 401) {
        console.log('[AuthContext] Refresh failed - 401 error, logging out');
        logout();
      } else {
        // Network or other errors - don't logout, might be temporary
        console.log('[AuthContext] Refresh failed - non-auth error, keeping user state:', apiError.message);
        // Keep current user state, don't logout on temporary errors
      }
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

