'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { ForumPostForm } from './ForumPostForm';
import { ForumPostCard } from './ForumPostCard';

interface Post {
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
  _count: {
    replies: number;
  };
}

interface CategoryPageClientProps {
  categorySlug: string;
  posts: Post[];
}

export function CategoryPageClient({ categorySlug, posts }: CategoryPageClientProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {/* New Post Form Toggle */}
      <div>
        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-6 transform hover:scale-[1.02] transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            CREATE NEW POST
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-orbitron font-bold text-white">
                ✍️ Create New Post
              </h3>
              <Button
                onClick={() => setShowForm(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="bg-gray-900/50 border border-gray-700/30 rounded-xl p-6 backdrop-blur-sm animate-scale-in">
              <ForumPostForm
                categorySlug={categorySlug}
                onSuccess={() => setShowForm(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Posts List */}
      <div>
        <h2 className="text-2xl font-orbitron font-bold text-white mb-6">
          📝 Posts
        </h2>

        {posts.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-700/30 rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg">
              No posts in this category yet. Be the first to post!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <ForumPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

