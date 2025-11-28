'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Avatar, Button, Tabs, TabPanel, Modal, Input, Textarea } from '@/components/ui';
import { PostCard, Loading, EmptyState } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { userService, postService, followService, likeService } from '@/lib/services';
import type { User, Post } from '@/lib/types';

export default function UserProfilePage() {
  const params = useParams();
  const userId = Number(params.id);
  const { user: currentUser, token, updateUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followId, setFollowId] = useState<number | null>(null);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ user_name: '', user_bio: '', user_URL: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const isOwnProfile = currentUser?.user_id === userId;

  const loadUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [userData, userPosts] = await Promise.all([
        userService.getUser(userId),
        postService.getPosts({ user_id: userId }),
      ]);
      setUser(userData);
      setPosts(userPosts.results);
      setFollowerCount(userData.stats.follower_count);
      setFollowingCount(userData.stats.following_count);

      if (currentUser && token && !isOwnProfile) {
        const follows = await followService.getFollows({ user_id: currentUser.user_id, aim_user_id: userId });
        if (follows.results.length > 0) {
          setIsFollowing(true);
          setFollowId(follows.results[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentUser, token, isOwnProfile]);

  const loadLikedPosts = useCallback(async () => {
    try {
      const liked = await likeService.getUserLikedPosts(userId);
      setLikedPosts(liked.results);
    } catch (error) {
      console.error('Error loading liked posts:', error);
    }
  }, [userId]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    if (activeTab === 'likes' && likedPosts.length === 0) {
      loadLikedPosts();
    }
  }, [activeTab, likedPosts.length, loadLikedPosts]);

  const handleFollow = async () => {
    if (!token || isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      if (isFollowing && followId) {
        await followService.deleteFollow(followId, token);
        setIsFollowing(false);
        setFollowId(null);
        setFollowerCount((prev) => prev - 1);
      } else {
        const result = await followService.createFollow({ aim_user_id: userId }, token);
        setIsFollowing(true);
        setFollowId(result.id);
        setFollowerCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (!user) return;
    setEditForm({
      user_name: user.user_name,
      user_bio: user.user_bio || '',
      user_URL: user.user_URL || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!user || isUpdating) return;
    setIsUpdating(true);
    try {
      await updateUser(editForm);
      setUser((prev) => prev ? { ...prev, ...editForm } : prev);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLikeChange = (postId: number, isLiked: boolean, likeCount: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.post_id === postId ? { ...post, is_liked: isLiked, like_count: likeCount } : post
      )
    );
  };

  if (isLoading) {
    return <Loading className="py-12" />;
  }

  if (!user) {
    return <EmptyState title="User not found" description="This user doesn't exist or has been deleted." />;
  }

  const tabs = [
    { id: 'posts', label: `Posts (${user.stats.post_count})` },
    { id: 'likes', label: `Likes (${user.stats.total_likes_given})` },
  ];

  return (
    <div>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start gap-4">
          <Avatar name={user.user_name} size="xl" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{user.user_name}</h1>
                <p className="text-gray-500">@{user.username}</p>
              </div>
              {token && !isOwnProfile && (
                <Button
                  variant={isFollowing ? 'outline' : 'primary'}
                  onClick={handleFollow}
                  isLoading={isFollowLoading}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}
              {isOwnProfile && (
                <Button variant="outline" onClick={handleEditProfile}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
            Lv.{user.user_level}
          </span>
          <span className="text-sm text-gray-500">
            {user.stats.experience_points} EXP
          </span>
        </div>

        {user.user_bio && (
          <p className="mt-3 text-gray-700">{user.user_bio}</p>
        )}

        {user.user_URL && (
          <a
            href={user.user_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-blue-600 hover:underline text-sm block"
          >
            {user.user_URL}
          </a>
        )}

        <div className="mt-4 flex items-center gap-4 text-sm">
          <Link href={`/users/${userId}/following`} className="hover:underline">
            <strong className="text-gray-900">{followingCount}</strong>
            <span className="text-gray-500"> Following</span>
          </Link>
          <Link href={`/users/${userId}/followers`} className="hover:underline">
            <strong className="text-gray-900">{followerCount}</strong>
            <span className="text-gray-500"> Followers</span>
          </Link>
          <span>
            <strong className="text-gray-900">{user.stats.total_likes_received}</strong>
            <span className="text-gray-500"> Likes</span>
          </span>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <TabPanel value="posts" activeValue={activeTab}>
        {posts.length === 0 ? (
          <EmptyState title="No posts yet" description={isOwnProfile ? "Share your first post!" : "This user hasn't posted anything yet."} />
        ) : (
          posts.map((post) => (
            <PostCard key={post.post_id} post={post} onLikeChange={handleLikeChange} />
          ))
        )}
      </TabPanel>

      <TabPanel value="likes" activeValue={activeTab}>
        {likedPosts.length === 0 ? (
          <EmptyState title="No liked posts" description={isOwnProfile ? "Like some posts to see them here." : "This user hasn't liked any posts yet."} />
        ) : (
          likedPosts.map((post) => (
            <PostCard key={post.post_id} post={post} onLikeChange={handleLikeChange} />
          ))
        )}
      </TabPanel>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profile">
        <div className="space-y-4">
          <Input
            label="Display Name"
            value={editForm.user_name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, user_name: e.target.value }))}
          />
          <Textarea
            label="Bio"
            value={editForm.user_bio}
            onChange={(e) => setEditForm((prev) => ({ ...prev, user_bio: e.target.value }))}
            rows={3}
          />
          <Input
            label="Website"
            value={editForm.user_URL}
            onChange={(e) => setEditForm((prev) => ({ ...prev, user_URL: e.target.value }))}
            placeholder="https://example.com"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} isLoading={isUpdating}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
