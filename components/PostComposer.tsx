'use client';

import { useState } from 'react';
import { Avatar, Button, Textarea } from './ui';
import { useAuth } from '@/contexts/AuthContext';
import { postService } from '@/lib/services';
import type { Post } from '@/lib/types';

interface PostComposerProps {
  onPostCreated?: (post: Post) => void;
}

export function PostComposer({ onPostCreated }: PostComposerProps) {
  const { user, token } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxLength = 280;
  const remainingChars = maxLength - content.length;

  const handleSubmit = async () => {
    if (!token || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const newPost = await postService.createPost({ context: content.trim() }, token);
      setContent('');
      onPostCreated?.(newPost);
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error('Error creating post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex gap-3">
        <Avatar name={user.user_name} size="md" />
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            maxLength={maxLength}
            rows={3}
            className="border-0 resize-none focus:ring-0 p-0 text-lg"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <span className={`text-sm ${remainingChars < 20 ? 'text-red-500' : 'text-gray-500'}`}>
              {remainingChars}
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || remainingChars < 0}
              isLoading={isSubmitting}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
