'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pin, Lock, Eye, Trash2, Edit, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ForumPostDetailProps {
  post: {
    id: string;
    title: string;
    content: string;
    isPinned: boolean;
    isLocked: boolean;
    views: number;
    createdAt: Date;
    authorId: string;
    author: {
      email: string;
      tier: number;
    };
    category: {
      name: string;
      slug: string;
    };
    replies: Array<{
      id: string;
      content: string;
      createdAt: Date;
      author: {
        email: string;
        tier: number;
      };
      authorId: string;
    }>;
  };
  currentUserId: string;
}

export function ForumPostDetail({ post, currentUserId }: ForumPostDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const isAuthor = post.authorId === currentUserId;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/forum/posts/${post.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push(`/community/${post.category.slug}`);
        router.refresh();
      } else {
        alert('Failed to delete post. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getTierBadge = (tier: number) => {
    const badges = {
      1: { label: 'Free', color: 'bg-gray-600/50 text-gray-300' },
      2: { label: 'Pro', color: 'bg-blue-600/50 text-blue-300' },
      3: { label: 'Premium', color: 'bg-purple-600/50 text-purple-300' },
    };
    return badges[tier as keyof typeof badges] || badges[1];
  };

  return (
    <div className="space-y-6">
      {/* Main Post */}
      <Card className="bg-gray-900/90 border-gray-700/30 backdrop-blur-xl overflow-hidden">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                {post.isPinned && (
                  <Pin className="w-5 h-5 text-yellow-400" />
                )}
                {post.isLocked && (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                <CardTitle className="text-white text-2xl">
                  {post.title}
                </CardTitle>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span>{post.author.email.split('@')[0]}</span>
                  <Badge className={getTierBadge(post.author.tier).color}>
                    {getTierBadge(post.author.tier).label}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.views} views</span>
                </div>
                <span>
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {isAuthor && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Replies Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-orbitron font-bold text-white">
          💬 Replies ({post.replies.length})
        </h3>

        {post.replies.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-700/30 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400">
                No replies yet. Be the first to respond!
              </p>
            </CardContent>
          </Card>
        ) : (
          post.replies.map((reply) => {
            const isReplyAuthor = reply.authorId === currentUserId;

            return (
              <Card
                key={reply.id}
                className="bg-gray-900/50 border-gray-700/30 backdrop-blur-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-300 font-medium">
                        {reply.author.email.split('@')[0]}
                      </span>
                      <Badge className={getTierBadge(reply.author.tier).color}>
                        {getTierBadge(reply.author.tier).label}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {reply.content}
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

