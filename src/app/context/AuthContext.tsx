import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { authApi, type UserProfile } from '../api/authApi';
import { AUTH_LOST_EVENT } from '../api/client';

type AuthContextValue = {
  isLoggedIn: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!window.localStorage.getItem('auth:token');
  });
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = window.localStorage.getItem('auth:user');
    return saved ? JSON.parse(saved) : null;
  });

  const refreshInFlight = useRef<Promise<void> | null>(null);

  const refreshUser = useCallback(async () => {
    if (refreshInFlight.current) return refreshInFlight.current;
    refreshInFlight.current = (async () => {
      try {
        const resp = await authApi.getMe();
        setUser(resp.data);
        localStorage.setItem('auth:user', JSON.stringify(resp.data));
      } catch {
        // Token invalid
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('auth:token');
        localStorage.removeItem('auth:user');
      } finally {
        refreshInFlight.current = null;
      }
    })();

    return refreshInFlight.current;
  }, []);

  useEffect(() => {
    if (isLoggedIn && !user) {
      refreshUser();
    }
  }, [isLoggedIn, user, refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const resp = await authApi.login({ email, password });
    localStorage.setItem('auth:token', resp.data.access_token);
    setIsLoggedIn(true);
    // Fetch user profile
    const meResp = await authApi.getMe();
    setUser(meResp.data);
    localStorage.setItem('auth:user', JSON.stringify(meResp.data));
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const resp = await authApi.register({ username, email, password });
    localStorage.setItem('auth:token', resp.data.access_token);
    setIsLoggedIn(true);
    const meResp = await authApi.getMe();
    setUser(meResp.data);
    localStorage.setItem('auth:user', JSON.stringify(meResp.data));
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('auth:token');
    localStorage.removeItem('auth:user');
  }, []);

  useEffect(() => {
    const onAuthLost = () => logout();
    window.addEventListener(AUTH_LOST_EVENT, onAuthLost);
    return () => window.removeEventListener(AUTH_LOST_EVENT, onAuthLost);
  }, [logout]);

  const value = useMemo(
    () => ({ isLoggedIn, user, login, register, logout, refreshUser }),
    [isLoggedIn, user, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
