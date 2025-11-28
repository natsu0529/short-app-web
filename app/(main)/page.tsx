'use client';

import { useState, useEffect, useCallback } from 'react';
import { PostCard, PostComposer, Loading, EmptyState, Tabs, TabPanel } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { timelineService } from '@/lib/services';
import type { Post, TimelineTab } from '@/lib/types';

const tabs = [
  { id: 'latest', label: 'Latest' },
  { id: 'popular', label: 'Popular' },
  { id: 'following', label: 'Following' },
];

export default function HomePage() {
  const { token, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TimelineTab>('latest');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadPosts = useCallback(async (tab: TimelineTab, pageNum: number, append = false) => {
    try {
      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      const response = await timelineService.getTimeline(
        { tab, page: pageNum, page_size: 20 },
        token || undefined
      );

      if (append) {
        setPosts((prev) => [...prev, ...response.results]);
      } else {
        setPosts(response.results);
      }
      setHasMore(!!response.next);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [token]);

  useEffect(() => {
    setPage(1);
    loadPosts(activeTab, 1);
  }, [activeTab, loadPosts]);

  const handleTabChange = (tabId: string) => {
    if (tabId === 'following' && !isAuthenticated) {
      return;
    }
    setActiveTab(tabId as TimelineTab);
  };

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(activeTab, nextPage, true);
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleLikeChange = (postId: number, isLiked: boolean, likeCount: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.post_id === postId ? { ...post, is_liked: isLiked, like_count: likeCount } : post
      )
    );
  };

  const filteredTabs = isAuthenticated ? tabs : tabs.filter((tab) => tab.id !== 'following');

  return (
    <div>
      <Tabs tabs={filteredTabs} activeTab={activeTab} onChange={handleTabChange} />

      {isAuthenticated && <PostComposer onPostCreated={handlePostCreated} />}

      {isLoading ? (
        <Loading className="py-12" />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description={activeTab === 'following' ? "Follow some users to see their posts here" : "Be the first to post something!"}
        />
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.post_id} post={post} onLikeChange={handleLikeChange} />
          ))}
          {hasMore && (
            <div className="py-4 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                {isLoadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
