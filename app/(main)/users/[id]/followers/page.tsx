'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { UserCard, Loading, EmptyState } from '@/components';
import { followService, userService } from '@/lib/services';
import type { User } from '@/lib/types';

export default function FollowersPage() {
  const params = useParams();
  const userId = Number(params.id);

  const [user, setUser] = useState<User | null>(null);
  const [followers, setFollowers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFollowers = useCallback(async () => {
    setIsLoading(true);
    try {
      const [userData, followsData] = await Promise.all([
        userService.getUser(userId),
        followService.getFollows({ aim_user_id: userId }),
      ]);
      setUser(userData);
      setFollowers(followsData?.results?.map((f) => f.user) ?? []);
    } catch (error) {
      console.error('Error loading followers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFollowers();
  }, [loadFollowers]);

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
          {user?.user_name}&apos;s Followers
        </h1>
      </div>

      {followers.length === 0 ? (
        <EmptyState title="No followers yet" description="This user doesn't have any followers." />
      ) : (
        followers.map((follower) => (
          <UserCard key={follower.user_id} user={follower} />
        ))
      )}
    </div>
  );
}
