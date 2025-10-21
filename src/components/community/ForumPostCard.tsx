'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { MessageSquare, Eye, Pin, Lock } from 'lucide-react';

interface ForumPostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    isPinned: boolean;
    isLocked: boolean;
    views: number;
    createdAt: Date;
    author: {
      email: string;
    };
    category: {
      slug: string;
    };
    _count?: {
      replies: number;
    };
  };
}

export function ForumPostCard({ post }: ForumPostCardProps) {
  const replyCount = post._count?.replies || 0;
  const preview = post.content.slice(0, 150) + (post.content.length > 150 ? '...' : '');

  return (
    <Link href={`/community/${post.category.slug}/${post.id}`}>
      <Card className="group bg-gray-900/50 border-gray-700/30 hover:border-cyan-500/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {post.isPinned && (
                  <Pin className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                )}
                {post.isLocked && (
                  <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
                <CardTitle className="text-white text-lg group-hover:text-cyan-300 transition-colors truncate">
                  {post.title}
                </CardTitle>
              </div>
              <p className="text-gray-400 text-sm line-clamp-2">{preview}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{replyCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.views}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              by {post.author.email.split('@')[0]}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

