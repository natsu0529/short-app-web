/**
 * 認証関連のサービス
 */

import { api } from './api';
import type { User, AuthResponse, CreateUserRequest } from './types';

const TOKEN_KEY = 'shortSNS_token';

/**
 * トークンを保存
 */
export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * トークンを取得
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * トークンを削除
 */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * 認証サービス
 */
export const authService = {
  /**
   * メール/パスワードでログイン
   */
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await api.post<AuthResponse>('/auth/login/', { email, password });
    saveToken(response.token);
    const user = await api.get<User>('/users/me/', { token: response.token });
    return { token: response.token, user };
  },

  /**
   * Google認証
   */
  googleAuth: async (idToken: string, email: string, displayName: string): Promise<{ token: string; user: User }> => {
    const response = await api.post<AuthResponse>('/auth/google/', {
      id_token: idToken,
      email,
      display_name: displayName,
    });
    saveToken(response.token);
    const user = await api.get<User>('/users/me/', { token: response.token });
    return { token: response.token, user };
  },

  /**
   * ユーザー登録
   */
  register: async (data: CreateUserRequest): Promise<{ token: string; user: User }> => {
    await api.post<User>('/users/', data);
    return authService.login(data.user_mail, data.password);
  },

  /**
   * ログアウト
   */
  logout: (): void => {
    removeToken();
  },

  /**
   * 現在のユーザーを取得
   */
  getCurrentUser: async (): Promise<User | null> => {
    const token = getToken();
    if (!token) return null;
    try {
      return await api.get<User>('/users/me/', { token });
    } catch {
      removeToken();
      return null;
    }
  },

  /**
   * ログイン状態を確認
   */
  isLoggedIn: (): boolean => {
    return !!getToken();
  },
};
