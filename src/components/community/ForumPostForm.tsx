'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface ForumPostFormProps {
  categorySlug: string;
  onSuccess?: () => void;
}

export function ForumPostForm({ categorySlug, onSuccess }: ForumPostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          categorySlug,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const post = await response.json();
      setMessage({ type: 'success', text: 'Post created successfully!' });
      
      // Reset form
      setTitle('');
      setContent('');
      
      // Redirect to the new post after a brief delay
      setTimeout(() => {
        router.push(`/community/${categorySlug}/${post.id}`);
        router.refresh();
        onSuccess?.();
      }, 500);
    } catch (error: any) {
      console.error('Failed to create post:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to create post. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title" className="text-gray-300 mb-2 block">
          Title
        </Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's on your mind?"
          maxLength={200}
          required
          disabled={isSubmitting}
          className="bg-gray-800/80 border-gray-700 text-white"
        />
      </div>

      <div>
        <Label htmlFor="content" className="text-gray-300 mb-2 block">
          Content
        </Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts, questions, or tips..."
          rows={8}
          maxLength={5000}
          required
          disabled={isSubmitting}
          className="bg-gray-800/80 border-gray-700 text-white resize-none"
        />
        <div className="text-xs text-gray-500 mt-1 text-right">
          {content.length} / 5000 characters
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {message.text}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-6"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Creating Post...
          </>
        ) : (
          '📝 Create Post'
        )}
      </Button>
    </form>
  );
}

