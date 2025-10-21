'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface ForumReplyFormProps {
  postId: string;
  onSuccess?: () => void;
}

export function ForumReplyForm({ postId, onSuccess }: ForumReplyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setMessage({ type: 'error', text: 'Please enter a reply' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/forum/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      setMessage({ type: 'success', text: 'Reply posted!' });
      setContent('');
      
      // Refresh the page to show the new reply
      setTimeout(() => {
        router.refresh();
        onSuccess?.();
      }, 500);
    } catch (error: any) {
      console.error('Failed to post reply:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to post reply. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="reply-content" className="text-gray-300 mb-2 block">
          Your Reply
        </Label>
        <Textarea
          id="reply-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          rows={4}
          maxLength={2000}
          required
          disabled={isSubmitting}
          className="bg-gray-800/80 border-gray-700 text-white resize-none"
        />
        <div className="text-xs text-gray-500 mt-1 text-right">
          {content.length} / 2000 characters
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
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Posting Reply...
          </>
        ) : (
          '💬 Post Reply'
        )}
      </Button>
    </form>
  );
}

