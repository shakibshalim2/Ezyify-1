import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from 'zustand';
import { isMfaChallenge, useRuntime, type Role } from '@ezyify/core';
import type { WebRuntime } from '../runtime';

export type UserRole = 'guest' | Role;

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: Role;
  avatar: string | null;
  isVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True until the cookie-based silent refresh has settled on cold start. */
  isLoading: boolean;
  userRole: UserRole;
  /** Resolves `{ mfaRequired: true, challengeToken }` when the account has two-factor enabled; the caller routes to `/two-factor`. */
  login: (identifier: string, password: string) => Promise<{ mfaRequired: false } | { mfaRequired: true; challengeToken: string }>;
  /** Completes an MFA login challenge with a TOTP or recovery code. */
  verifyMfa: (challengeToken: string, code: string) => Promise<void>;
  /** Creates the account; the caller sends the user to OTP verification with the returned id. */
  signup: (email: string, password: string, name: string) => Promise<{ userId: string }>;
  verifyOtp: (userId: string, otp: string, type?: 'email' | 'phone') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Thin adapter over the shared core auth store so legacy `useAuth()` callers keep working on the real API. */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const runtime = useRuntime() as WebRuntime;
  const navigate = useNavigate();
  const status = useStore(runtime.auth, s => s.status);
  const summary = useStore(runtime.auth, s => s.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    runtime.restoreSession().finally(() => alive && setIsLoading(false));
    return () => {
      alive = false;
    };
  }, [runtime]);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const result = await runtime.api.auth.login({ identifier: identifier.trim(), password });
      if (isMfaChallenge(result)) return { mfaRequired: true as const, challengeToken: result.challengeToken };
      await runtime.commitSession(result);
      return { mfaRequired: false as const };
    },
    [runtime],
  );

  const verifyMfa = useCallback(
    async (challengeToken: string, code: string) => {
      const session = await runtime.api.auth.mfa.verify({ challengeToken, code: code.trim() });
      await runtime.commitSession(session);
    },
    [runtime],
  );

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      const res = await runtime.api.auth.signup({ name: name.trim(), email: email.trim(), password, acceptTerms: true });
      return { userId: res.userId };
    },
    [runtime],
  );

  const verifyOtp = useCallback(
    async (userId: string, otp: string, type: 'email' | 'phone' = 'email') => {
      const session = await runtime.api.auth.verifyOtp({ userId, otp, type });
      await runtime.commitSession(session);
    },
    [runtime],
  );

  const logout = useCallback(async () => {
    await runtime.signOut();
    navigate('/login');
  }, [runtime, navigate]);

  const value = useMemo<AuthContextType>(() => {
    const user: AuthUser | null =
      status === 'authenticated' && summary
        ? { id: summary.id, username: summary.username, name: summary.name, role: summary.role, avatar: summary.avatarUrl, isVerified: summary.verified }
        : null;
    return { user, isAuthenticated: !!user, isLoading, userRole: user?.role ?? 'guest', login, verifyMfa, signup, verifyOtp, logout };
  }, [status, summary, isLoading, login, verifyMfa, signup, verifyOtp, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
