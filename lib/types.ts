/**
 * ShortSNS API Types
 * Based on API documentation in /docs
 */

/**
 * ページネーションレスポンス
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * ユーザー統計
 */
export interface UserStats {
  experience_points: number;
  total_likes_received: number;
  total_likes_given: number;
  follower_count: number;
  following_count: number;
  post_count: number;
  last_level_up: string | null;
  updated_at: string;
}

/**
 * ユーザー
 */
export interface User {
  user_id: number;
  username: string;
  user_name: string;
  user_level: number;
  user_rank: string;
  user_mail: string;
  user_URL: string;
  user_bio: string;
  stats: UserStats;
  rank: number | null;
}

/**
 * ユーザー登録リクエスト
 */
export interface CreateUserRequest {
  username: string;
  user_name: string;
  user_mail: string;
  password: string;
  user_URL?: string;
  user_bio?: string;
}

/**
 * ユーザー更新リクエスト
 */
export interface UpdateUserRequest {
  user_name?: string;
  user_URL?: string;
  user_bio?: string;
}

/**
 * 投稿
 */
export interface Post {
  post_id: number;
  user: User;
  context: string;
  like_count: number;
  time: string;
  is_liked: boolean;
}

/**
 * 投稿作成リクエスト
 */
export interface CreatePostRequest {
  context: string;
}

/**
 * フォロー
 */
export interface Follow {
  id: number;
  user: User;
  aim_user: User;
  time: string;
}

/**
 * フォロー作成リクエスト
 */
export interface CreateFollowRequest {
  aim_user_id: number;
}

/**
 * いいね
 */
export interface Like {
  id: number;
  user: User;
  post: Post;
  created_at: string;
}

/**
 * いいね作成リクエスト
 */
export interface CreateLikeRequest {
  post_id: number;
}

/**
 * いいね状態レスポンス
 */
export interface LikedStatusResponse {
  liked_post_ids: number[];
}

/**
 * タイムラインタブ
 */
export type TimelineTab = 'latest' | 'popular' | 'following';

/**
 * ランキング範囲
 */
export type RankingRange = '24h' | 'all';

/**
 * エラーレスポンス
 */
export interface ErrorResponse {
  detail?: string;
  non_field_errors?: string[];
  [key: string]: string | string[] | undefined;
}
