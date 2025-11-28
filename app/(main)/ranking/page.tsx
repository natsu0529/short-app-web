'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabPanel } from '@/components/ui';
import { PostCard, UserCard, Loading, EmptyState } from '@/components';
import { rankingService } from '@/lib/services';
import type { Post, User, RankingRange } from '@/lib/types';

const tabs = [
  { id: 'posts', label: 'Popular Posts' },
  { id: 'likes', label: 'Total Likes' },
  { id: 'level', label: 'Level' },
  { id: 'followers', label: 'Followers' },
];

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState('posts');
  const [range, setRange] = useState<RankingRange>('24h');
  const [posts, setPosts] = useState<Post[]>([]);
  const [likesRanking, setLikesRanking] = useState<User[]>([]);
  const [levelRanking, setLevelRanking] = useState<User[]>([]);
  const [followersRanking, setFollowersRanking] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRanking = useCallback(async (tab: string) => {
    setIsLoading(true);
    try {
      switch (tab) {
        case 'posts': {
          const data = await rankingService.getPostLikesRanking({ range });
          setPosts(data.results);
          break;
        }
        case 'likes': {
          const data = await rankingService.getUserTotalLikesRanking();
          setLikesRanking(data.results);
          break;
        }
        case 'level': {
          const data = await rankingService.getUserLevelRanking();
          setLevelRanking(data.results);
          break;
        }
        case 'followers': {
          const data = await rankingService.getUserFollowersRanking();
          setFollowersRanking(data.results);
          break;
        }
      }
    } catch (error) {
      console.error('Error loading ranking:', error);
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    loadRanking(activeTab);
  }, [activeTab, loadRanking]);

  const handleLikeChange = (postId: number, isLiked: boolean, likeCount: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.post_id === postId ? { ...post, is_liked: isLiked, like_count: likeCount } : post
      )
    );
  };

  return (
    <div>
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">Ranking</h1>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'posts' && (
        <div className="flex gap-2 p-4 border-b border-gray-100">
          <button
            onClick={() => setRange('24h')}
            className={`px-3 py-1 text-sm rounded-full ${
              range === '24h' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            24 hours
          </button>
          <button
            onClick={() => setRange('all')}
            className={`px-3 py-1 text-sm rounded-full ${
              range === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            All time
          </button>
        </div>
      )}

      {isLoading ? (
        <Loading className="py-12" />
      ) : (
        <>
          <TabPanel value="posts" activeValue={activeTab}>
            {posts.length === 0 ? (
              <EmptyState title="No posts yet" description="Be the first to create a popular post!" />
            ) : (
              posts.map((post, index) => (
                <div key={post.post_id} className="relative">
                  <div className="absolute left-4 top-4 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
                    {index + 1}
                  </div>
                  <div className="pl-8">
                    <PostCard post={post} onLikeChange={handleLikeChange} />
                  </div>
                </div>
              ))
            )}
          </TabPanel>

          <TabPanel value="likes" activeValue={activeTab}>
            {likesRanking.length === 0 ? (
              <EmptyState title="No users yet" description="Be the first to get likes!" />
            ) : (
              likesRanking.map((user, index) => (
                <UserCard key={user.user_id} user={user} rank={index + 1} />
              ))
            )}
          </TabPanel>

          <TabPanel value="level" activeValue={activeTab}>
            {levelRanking.length === 0 ? (
              <EmptyState title="No users yet" description="Start posting to level up!" />
            ) : (
              levelRanking.map((user, index) => (
                <UserCard key={user.user_id} user={user} rank={index + 1} />
              ))
            )}
          </TabPanel>

          <TabPanel value="followers" activeValue={activeTab}>
            {followersRanking.length === 0 ? (
              <EmptyState title="No users yet" description="Be the first to gain followers!" />
            ) : (
              followersRanking.map((user, index) => (
                <UserCard key={user.user_id} user={user} rank={index + 1} />
              ))
            )}
          </TabPanel>
        </>
      )}
    </div>
  );
}
