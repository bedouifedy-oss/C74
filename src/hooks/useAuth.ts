'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { User, UserRole, AuthState, AuthResponse } from '@/types';
import type { Locale } from '@/i18n-routing';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

interface UseAuthOptions {
  locale?: Locale;
  redirectTo?: string;
  requireAuth?: boolean;
  requireRole?: UserRole | UserRole[];
}

interface UseAuthReturn extends AuthState {
  login: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, otp: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const { 
    locale = 'en', 
    redirectTo, 
    requireAuth = false, 
    requireRole 
  } = options;
  
  const router = useRouter();
  
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const userData = localStorage.getItem(USER_DATA_KEY);
        
        if (token && userData) {
          const user = JSON.parse(userData) as User;
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  // Handle auth requirements and redirects
  useEffect(() => {
    if (state.isLoading) return;

    if (requireAuth && !state.isAuthenticated) {
      router.push(redirectTo || `/${locale}/signup`);
      return;
    }

    if (requireRole && state.user) {
      const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
      if (!roles.includes(state.user.role)) {
        // Redirect to appropriate dashboard based on actual role
        const dashboardPath = getDashboardPath(state.user.role, locale);
        router.push(dashboardPath);
      }
    }
  }, [state.isLoading, state.isAuthenticated, state.user, requireAuth, requireRole, redirectTo, locale, router]);

  // Login - sends OTP to phone
  const login = useCallback(async (phone: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        const errorMsg = data?.error?.message || data?.error || 'Failed to send OTP';
        return { success: false, error: typeof errorMsg === 'string' ? errorMsg : 'Failed to send OTP' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  // Verify OTP and complete authentication
  const verifyOtp = useCallback(async (
    phone: string, 
    otp: string, 
    role?: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, role }),
      });

      const data = await response.json();

      const payload = data?.data;
      if (response.ok && payload?.token) {
        const user: User = {
          id: payload.user?.id || `user_${Date.now()}`,
          phone,
          role: payload.user?.role || role || 'customer',
          name: payload.user?.name,
          created_at: payload.user?.created_at || new Date().toISOString(),
          is_verified: true,
          is_active: true,
        };

        // Store in localStorage
        localStorage.setItem(AUTH_TOKEN_KEY, payload.token);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

        // Update state
        setState({
          user,
          token: payload.token,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      } else {
        const errorMsg = data?.error?.message || data?.error || 'Invalid OTP';
        return { success: false, error: typeof errorMsg === 'string' ? errorMsg : 'Invalid OTP' };
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });

    router.push(`/${locale}/signup`);
  }, [locale, router]);

  // Update user data
  const updateUser = useCallback((updates: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;
      
      const updatedUser = { ...prev.user, ...updates };
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      
      return { ...prev, user: updatedUser };
    });
  }, []);

  // Check if user has a specific role
  const isRole = useCallback((role: UserRole | UserRole[]): boolean => {
    if (!state.user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(state.user.role);
  }, [state.user]);

  // Check if user has a specific permission (for admins)
  const hasPermission = useCallback((permission: string): boolean => {
    if (!state.user || state.user.role !== 'admin') return false;
    // In a real app, check against user's permissions
    return true;
  }, [state.user]);

  return {
    ...state,
    login,
    verifyOtp,
    logout,
    updateUser,
    isRole,
    hasPermission,
  };
}

// Helper to get dashboard path based on role
function getDashboardPath(role: UserRole, locale: Locale): string {
  switch (role) {
    case 'worker':
      return `/${locale}/worker/dashboard`;
    case 'admin':
      return `/${locale}/admin/dashboard`;
    case 'customer':
    default:
      return `/${locale}/customer/dashboard`;
  }
}

// ============================================
// SPECIALIZED AUTH HOOKS
// ============================================

/**
 * Hook for pages that require authentication
 */
export function useRequireAuth(locale: Locale = 'en') {
  return useAuth({
    locale,
    requireAuth: true,
  });
}

/**
 * Hook for customer-only pages
 */
export function useCustomerAuth(locale: Locale = 'en') {
  return useAuth({
    locale,
    requireAuth: true,
    requireRole: 'customer',
  });
}

/**
 * Hook for worker-only pages
 */
export function useWorkerAuth(locale: Locale = 'en') {
  return useAuth({
    locale,
    requireAuth: true,
    requireRole: 'worker',
  });
}

/**
 * Hook for admin-only pages
 */
export function useAdminAuth(locale: Locale = 'en') {
  return useAuth({
    locale,
    requireAuth: true,
    requireRole: 'admin',
  });
}

export default useAuth;
