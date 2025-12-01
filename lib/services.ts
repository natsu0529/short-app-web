/**
 * ShortSNS API Services
 * APIエンドポイントへのアクセスを簡単にするサービス関数
 */

import { api } from './api';
import type {
  PaginatedResponse,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  Post,
  CreatePostRequest,
  Follow,
  CreateFollowRequest,
  Like,
  CreateLikeRequest,
  LikedStatusResponse,
  TimelineTab,
  RankingRange,
} from './types';

/**
 * ユーザーAPI
 */
export const userService = {
  /**
   * ユーザー一覧を取得
   */
  getUsers: (params?: { page?: number; page_size?: number }) =>
    api.get<PaginatedResponse<User>>(`/users/?${new URLSearchParams(params as Record<string, string>).toString()}`),

  /**
   * ユーザー詳細を取得
   */
  getUser: (id: number) => api.get<User>(`/users/${id}/`),

  /**
   * ユーザー登録
   */
  createUser: (data: CreateUserRequest) => api.post<User>('/users/', data),

  /**
   * ユーザー更新
   */
  updateUser: (id: number, data: UpdateUserRequest, token: string) =>
    api.patch<User>(`/users/${id}/`, data, { token }),

  /**
   * ユーザー削除
   */
  deleteUser: (id: number, token: string) => api.delete(`/users/${id}/`, { token }),

  /**
   * 自分の情報を取得
   */
  getMe: (token: string) => api.get<User>('/users/me/', { token }),
};

/**
 * 投稿API
 */
export const postService = {
  /**
   * 投稿一覧を取得
   */
  getPosts: (params?: { user_id?: number; page?: number; page_size?: number }, token?: string) =>
    api.get<PaginatedResponse<Post>>(
      `/posts/?${new URLSearchParams(params as Record<string, string>).toString()}`,
      token ? { token } : undefined
    ),

  /**
   * 投稿詳細を取得
   */
  getPost: (id: number) => api.get<Post>(`/posts/${id}/`),

  /**
   * 投稿作成
   */
  createPost: (data: CreatePostRequest, token: string) =>
    api.post<Post>('/posts/', data, { token }),

  /**
   * 投稿更新
   */
  updatePost: (id: number, data: CreatePostRequest, token: string) =>
    api.patch<Post>(`/posts/${id}/`, data, { token }),

  /**
   * 投稿削除
   */
  deletePost: (id: number, token: string) => api.delete(`/posts/${id}/`, { token }),
};

/**
 * フォローAPI
 */
export const followService = {
  /**
   * フォロー一覧を取得
   */
  getFollows: (params?: { user_id?: number; aim_user_id?: number; page?: number; page_size?: number }) =>
    api.get<PaginatedResponse<Follow>>(`/follows/?${new URLSearchParams(params as Record<string, string>).toString()}`),

  /**
   * フォロー詳細を取得
   */
  getFollow: (id: number) => api.get<Follow>(`/follows/${id}/`),

  /**
   * フォロー作成
   */
  createFollow: (data: CreateFollowRequest, token: string) =>
    api.post<Follow>('/follows/', data, { token }),

  /**
   * フォロー解除
   */
  deleteFollow: (id: number, token: string) => api.delete(`/follows/${id}/`, { token }),
};

/**
 * いいねAPI
 */
export const likeService = {
  /**
   * いいね一覧を取得
   */
  getLikes: (params?: { user_id?: number; post_id?: number; page?: number; page_size?: number }) =>
    api.get<PaginatedResponse<Like>>(`/likes/?${new URLSearchParams(params as Record<string, string>).toString()}`),

  /**
   * いいね作成
   */
  createLike: (data: CreateLikeRequest, token: string) =>
    api.post<Like>('/likes/', data, { token }),

  /**
   * いいね解除
   */
  deleteLike: (id: number, token: string) => api.delete(`/likes/${id}/`, { token }),

  /**
   * いいね状態を確認
   */
  getLikedStatus: (ids: number[], token: string) =>
    api.get<LikedStatusResponse>(`/posts/liked-status/?ids=${ids.join(',')}`, { token }),

  /**
   * ユーザーがいいねした投稿一覧
   */
  getUserLikedPosts: (userId: number, params?: { page?: number; page_size?: number }, token?: string) =>
    api.get<PaginatedResponse<Post>>(
      `/users/${userId}/liked-posts/?${new URLSearchParams(params as Record<string, string>).toString()}`,
      token ? { token } : undefined
    ),
};

/**
 * タイムラインAPI
 */
export const timelineService = {
  /**
   * タイムラインを取得
   */
  getTimeline: (params?: { tab?: TimelineTab; page?: number; page_size?: number }, token?: string) =>
    api.get<PaginatedResponse<Post>>(
      `/timeline/?${new URLSearchParams(params as Record<string, string>).toString()}`,
      token ? { token } : undefined
    ),
};

/**
 * 検索API
 */
export const searchService = {
  /**
   * ユーザーを検索
   */
  searchUsers: (query: string, params?: { page?: number; page_size?: number }) =>
    api.get<PaginatedResponse<User>>(
      `/search/users/?q=${encodeURIComponent(query)}&${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  /**
   * 投稿を検索
   */
  searchPosts: (query: string, params?: { page?: number; page_size?: number }, token?: string) =>
    api.get<PaginatedResponse<Post>>(
      `/search/posts/?q=${encodeURIComponent(query)}&${new URLSearchParams(params as Record<string, string>).toString()}`,
      token ? { token } : undefined
    ),
};

/**
 * ランキングAPI
 */
export const rankingService = {
  /**
   * 投稿いいねランキング
   */
  getPostLikesRanking: (params?: { range?: RankingRange; page?: number; page_size?: number }, token?: string) =>
    api.get<PaginatedResponse<Post>>(
      `/rankings/posts/likes/?${new URLSearchParams(params as Record<string, string>).toString()}`,
      token ? { token } : undefined
    ),

  /**
   * ユーザー総いいねランキング
   */
  getUserTotalLikesRanking: (params?: { page?: number; page_size?: number }) =>
    api.get<PaginatedResponse<User>>(
      `/rankings/users/total-likes/?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  /**
   * ユーザーレベルランキング
   */
  getUserLevelRanking: (params?: { page?: number; page_size?: number }) =>
    api.get<PaginatedResponse<User>>(
      `/rankings/users/level/?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  /**
   * ユーザーフォロワーランキング
   */
  getUserFollowersRanking: (params?: { page?: number; page_size?: number }) =>
    api.get<PaginatedResponse<User>>(
      `/rankings/users/followers/?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),
};
