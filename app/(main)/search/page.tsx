'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input, Tabs, TabPanel } from '@/components/ui';
import { PostCard, UserCard, Loading, EmptyState } from '@/components';
import { searchService } from '@/lib/services';
import type { Post, User } from '@/lib/types';

const tabs = [
  { id: 'users', label: 'Users' },
  { id: 'posts', label: 'Posts' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) {
      setUsers([]);
      setPosts([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const [usersData, postsData] = await Promise.all([
        searchService.searchUsers(query),
        searchService.searchPosts(query),
      ]);
      setUsers(usersData.results);
      setPosts(postsData.results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      search();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, search]);

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
        <Input
          type="search"
          placeholder="Search users or posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-lg"
        />
      </div>

      {query.trim() && (
        <Tabs
          tabs={tabs.map((tab) => ({
            ...tab,
            label: `${tab.label} (${tab.id === 'users' ? users.length : posts.length})`,
          }))}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      )}

      {isLoading ? (
        <Loading className="py-12" />
      ) : !hasSearched ? (
        <EmptyState
          title="Search ShortSNS"
          description="Search for users or posts by typing above"
          icon={
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      ) : (
        <>
          <TabPanel value="users" activeValue={activeTab}>
            {users.length === 0 ? (
              <EmptyState title="No users found" description={`No users matching "${query}"`} />
            ) : (
              users.map((user) => (
                <UserCard key={user.user_id} user={user} />
              ))
            )}
          </TabPanel>

          <TabPanel value="posts" activeValue={activeTab}>
            {posts.length === 0 ? (
              <EmptyState title="No posts found" description={`No posts matching "${query}"`} />
            ) : (
              posts.map((post) => (
                <PostCard key={post.post_id} post={post} onLikeChange={handleLikeChange} />
              ))
            )}
          </TabPanel>
        </>
      )}
    </div>
  );
}
