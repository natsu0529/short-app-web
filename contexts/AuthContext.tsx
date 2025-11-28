'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { authService, getToken, saveToken, removeToken } from '@/lib/auth';
import { userService } from '@/lib/services';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string, email: string, displayName: string) => Promise<void>;
  register: (data: { username: string; user_name: string; user_mail: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (data: { user_name?: string; user_URL?: string; user_bio?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      return;
    }
    try {
      const currentUser = await userService.getMe(currentToken);
      setUser(currentUser);
      setToken(currentToken);
    } catch {
      removeToken();
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };
    initAuth();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    setToken(result.token);
    setUser(result.user);
  };

  const loginWithGoogle = async (idToken: string, email: string, displayName: string) => {
    const result = await authService.googleAuth(idToken, email, displayName);
    setToken(result.token);
    setUser(result.user);
  };

  const register = async (data: { username: string; user_name: string; user_mail: string; password: string }) => {
    const result = await authService.register(data);
    setToken(result.token);
    setUser(result.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateUser = async (data: { user_name?: string; user_URL?: string; user_bio?: string }) => {
    if (!user || !token) return;
    const updatedUser = await userService.updateUser(user.user_id, data, token);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
        updateUser,
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
