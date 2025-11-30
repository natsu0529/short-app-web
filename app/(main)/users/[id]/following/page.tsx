'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { UserCard, Loading, EmptyState } from '@/components';
import { followService, userService } from '@/lib/services';
import type { User } from '@/lib/types';

export default function FollowingPage() {
  const params = useParams();
  const userId = Number(params.id);

  const [user, setUser] = useState<User | null>(null);
  const [following, setFollowing] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFollowing = useCallback(async () => {
    setIsLoading(true);
    try {
      const [userData, followsData] = await Promise.all([
        userService.getUser(userId),
        followService.getFollows({ user_id: userId }),
      ]);
      setUser(userData);
      // APIが配列を直接返す場合と、PaginatedResponseを返す場合の両方に対応
      const followsList = Array.isArray(followsData) ? followsData : followsData?.results ?? [];
      setFollowing(followsList.map((f: { aim_user: User }) => f.aim_user).filter(Boolean));
    } catch (error) {
      console.error('Error loading following:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFollowing();
  }, [loadFollowing]);

  if (isLoading) {
    return <Loading className="py-12" />;
  }

  return (
    <div>
      <div className="p-4 border-b border-gray-200">
        <Link href={`/users/${userId}`} className="text-gray-500 hover:text-gray-700 text-sm">
          ← Back to profile
        </Link>
        <h1 className="text-xl font-bold mt-2">
          {user?.user_name} is following
        </h1>
      </div>

      {following.length === 0 ? (
        <EmptyState title="Not following anyone" description="This user isn't following anyone yet." />
      ) : (
        following.map((followedUser) => (
          <UserCard key={followedUser.user_id} user={followedUser} />
        ))
      )}
    </div>
  );
}
