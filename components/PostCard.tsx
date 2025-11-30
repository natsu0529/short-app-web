'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Post } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { likeService } from '@/lib/services';

interface PostCardProps {
  post: Post;
  onLikeChange?: (postId: number, isLiked: boolean, likeCount: number) => void;
}

export function PostCard({ post, onLikeChange }: PostCardProps) {
  const { user: currentUser, token } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [isLiking, setIsLiking] = useState(false);

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const handleLike = async () => {
    if (!token || isLiking) return;

    setIsLiking(true);
    try {
      if (isLiked) {
        const likes = await likeService.getLikes({ user_id: currentUser?.user_id, post_id: post.post_id });
        if (likes.results.length > 0) {
          await likeService.deleteLike(likes.results[0].id, token);
          setIsLiked(false);
          setLikeCount((prev) => prev - 1);
          onLikeChange?.(post.post_id, false, likeCount - 1);
        }
      } else {
        await likeService.createLike({ post_id: post.post_id }, token);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
        onLikeChange?.(post.post_id, true, likeCount + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <article className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/users/${post.user.user_id}`} className="font-bold text-gray-900 hover:underline truncate">
              {post.user.user_name}
            </Link>
            <span className="text-gray-400 text-sm">·</span>
            <span className="text-gray-500 text-sm">{formatTime(post.time)}</span>
            {post.user.user_level > 0 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                Lv.{post.user.user_level}
              </span>
            )}
          </div>
          <p className="mt-1 text-gray-900 whitespace-pre-wrap break-words">{post.context}</p>
          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={!token || isLiking}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                isLiked
                  ? 'text-red-500'
                  : 'text-gray-500 hover:text-red-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <svg
                className="w-5 h-5"
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{likeCount}</span>
            </button>
          </div>
      </div>
    </article>
  );
}
