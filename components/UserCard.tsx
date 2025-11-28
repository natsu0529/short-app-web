'use client';

import Link from 'next/link';
import { Button } from './ui';
import type { User } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { followService } from '@/lib/services';

interface UserCardProps {
  user: User;
  showStats?: boolean;
  showFollowButton?: boolean;
  rank?: number;
}

export function UserCard({ user, showStats = true, showFollowButton = true, rank }: UserCardProps) {
  const { user: currentUser, token } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [followId, setFollowId] = useState<number | null>(null);

  const isOwnProfile = currentUser?.user_id === user.user_id;

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser || !token || isOwnProfile) return;
      try {
        const follows = await followService.getFollows({ user_id: currentUser.user_id, aim_user_id: user.user_id });
        if (follows.results.length > 0) {
          setIsFollowing(true);
          setFollowId(follows.results[0].id);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };
    checkFollowStatus();
  }, [currentUser, token, user.user_id, isOwnProfile]);

  const handleFollow = async () => {
    if (!token || isLoading) return;
    setIsLoading(true);
    try {
      if (isFollowing && followId) {
        await followService.deleteFollow(followId, token);
        setIsFollowing(false);
        setFollowId(null);
      } else {
        const result = await followService.createFollow({ aim_user_id: user.user_id }, token);
        setIsFollowing(true);
        setFollowId(result.id);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex gap-3">
        {rank && (
          <div className="flex items-center justify-center w-8 text-lg font-bold text-gray-400">
            {rank}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <Link href={`/users/${user.user_id}`} className="font-bold text-gray-900 hover:underline truncate block">
                {user.user_name}
              </Link>
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/users/${user.user_id}`} className="text-gray-500 text-sm truncate">
                  @{user.username}
                </Link>
                {user.user_level > 0 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    Lv.{user.user_level}
                  </span>
                )}
              </div>
            </div>
            {showFollowButton && token && !isOwnProfile && (
              <Button
                variant={isFollowing ? 'outline' : 'primary'}
                size="sm"
                onClick={handleFollow}
                isLoading={isLoading}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>
          {user.user_bio && (
            <p className="mt-1 text-gray-600 text-sm line-clamp-2">{user.user_bio}</p>
          )}
          {showStats && (
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
              <span>
                <strong className="text-gray-900">{user.stats.follower_count}</strong> followers
              </span>
              <span>
                <strong className="text-gray-900">{user.stats.following_count}</strong> following
              </span>
              <span>
                <strong className="text-gray-900">{user.stats.total_likes_received}</strong> likes
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
