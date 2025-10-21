'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

interface ForumCategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    _count?: {
      posts: number;
    };
  };
}

export function ForumCategoryCard({ category }: ForumCategoryCardProps) {
  const postCount = category._count?.posts || 0;

  return (
    <Link href={`/community/${category.slug}`}>
      <Card className="group relative bg-gray-900/90 border-gray-700/30 hover:border-cyan-500/50 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer h-full">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity"></div>
        
        <CardHeader className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-4xl">{category.icon}</div>
              <div className="flex-1">
                <CardTitle className="text-white text-xl group-hover:text-cyan-300 transition-colors">
                  {category.name}
                </CardTitle>
                <CardDescription className="text-gray-400 text-sm mt-1">
                  {category.description}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative pt-0">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MessageSquare className="w-4 h-4" />
            <span>
              {postCount} {postCount === 1 ? 'post' : 'posts'}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

