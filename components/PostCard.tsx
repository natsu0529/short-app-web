'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar } from './ui';
import type { Post } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { likeService, postService } from '@/lib/services';

interface PostCardProps {
  post: Post;
  onLikeChange?: (postId: number, isLiked: boolean, likeCount: number) => void;
  onDelete?: (postId: number) => void;
}

export function PostCard({ post, onLikeChange, onDelete }: PostCardProps) {
  const { user: currentUser, token } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnPost = currentUser?.user_id === post.user.user_id;

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

  const handleDelete = async () => {
    if (!token || isDeleting) return;

    if (!confirm('この投稿を削除しますか？')) {
      setShowMenu(false);
      return;
    }

    setIsDeleting(true);
    try {
      await postService.deletePost(post.post_id, token);
      onDelete?.(post.post_id);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('投稿の削除に失敗しました');
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  return (
    <article className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex gap-3">
        <Link href={`/users/${post.user.user_id}`}>
          <Avatar name={post.user.user_name} size="md" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/users/${post.user.user_id}`} className="font-bold text-gray-900 hover:underline truncate">
              {post.user.user_name}
            </Link>
            <Link href={`/users/${post.user.user_id}`} className="text-gray-500 text-sm truncate">
              @{post.user.username}
            </Link>
            <span className="text-gray-400 text-sm">·</span>
            <span className="text-gray-500 text-sm">{formatTime(post.time)}</span>
            {post.user.user_level > 0 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                Lv.{post.user.user_level}
              </span>
            )}
            {isOwnPost && (
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="6" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="18" r="1.5" />
                  </svg>
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
                      >
                        {isDeleting ? '削除中...' : '削除'}
                      </button>
                    </div>
                  </>
                )}
              </div>
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
      </div>
    </article>
  );
}
