'use client';

import { useState } from 'react';
import { Heart, Trash2, Star, ExternalLink } from 'lucide-react';
import { SHOWCASE_CATEGORIES } from '@/lib/showcase-categories';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface ShowcaseCardProps {
  showcase: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    kudosCount: number;
    featured: boolean;
    createdAt: string;
    user: {
      id: string;
      email: string;
      tier: number;
    };
    relatedBot?: {
      id: string;
      name: string;
      slug: string;
      avatarUrl: string | null;
    } | null;
    kudos?: Array<{ userId: string }>;
  };
  currentUserId?: string;
  onDelete?: () => void;
  onKudosToggle?: (hasKudos: boolean) => void;
}

export default function ShowcaseCard({ showcase, currentUserId, onDelete, onKudosToggle }: ShowcaseCardProps) {
  const [kudosCount, setKudosCount] = useState(showcase.kudosCount);
  const [hasGivenKudos, setHasGivenKudos] = useState(
    showcase.kudos?.some((k) => k.userId === currentUserId) || false
  );
  const [isTogglingKudos, setIsTogglingKudos] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUserId === showcase.user.id;
  const category = SHOWCASE_CATEGORIES[showcase.category as keyof typeof SHOWCASE_CATEGORIES] || SHOWCASE_CATEGORIES.other;

  const tierBadges = {
    1: { name: 'Intern', color: 'bg-gray-600', icon: '🌟' },
    2: { name: 'Professional', color: 'bg-blue-600', icon: '💼' },
    3: { name: 'Executive', color: 'bg-purple-600', icon: '👔' },
  };

  const userTier = tierBadges[showcase.user.tier as 1 | 2 | 3] || tierBadges[1];

  const handleKudosToggle = async () => {
    if (isTogglingKudos || isOwner) return; // Can't kudos own showcases

    setIsTogglingKudos(true);
    try {
      const method = hasGivenKudos ? 'DELETE' : 'POST';
      const response = await fetch(`/api/showcases/${showcase.id}/kudos`, {
        method,
      });

      if (!response.ok) {
        throw new Error('Failed to toggle kudos');
      }

      const data = await response.json();
      setKudosCount(data.kudosCount);
      setHasGivenKudos(!hasGivenKudos);
      
      if (onKudosToggle) {
        onKudosToggle(!hasGivenKudos);
      }
    } catch (error) {
      console.error('Kudos toggle error:', error);
    } finally {
      setIsTogglingKudos(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this showcase? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/showcases/${showcase.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete showcase');
      }

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete showcase');
      setIsDeleting(false);
    }
  };

  return (
    <div className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-cyan-500/50 transition-all duration-300">
      {/* Featured Badge */}
      {showcase.featured && (
        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-gradient-to-r from-yellow-500/90 to-amber-500/90 backdrop-blur-sm rounded-full flex items-center gap-1 text-xs font-bold text-black">
          <Star className="w-3 h-3 fill-black" />
          FEATURED
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-950">
        <img
          src={showcase.imageUrl}
          alt={showcase.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Category Badge */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1 text-xs font-semibold">
          <span className="text-lg">{category.icon}</span>
          <span className="text-white">{category.label}</span>
        </div>

        {/* Kudos Button Overlay */}
        <button
          onClick={handleKudosToggle}
          disabled={isTogglingKudos || isOwner}
          className={`absolute bottom-4 right-4 p-3 rounded-full backdrop-blur-md transition-all duration-300 ${
            hasGivenKudos
              ? 'bg-red-500/90 text-white scale-110'
              : 'bg-black/50 text-white hover:bg-red-500/70 hover:scale-110'
          } ${isOwner ? 'opacity-50 cursor-not-allowed' : ''} ${
            isTogglingKudos ? 'animate-pulse' : ''
          }`}
        >
          <Heart className={`w-5 h-5 ${hasGivenKudos ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Title & User */}
        <div>
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{showcase.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className={`px-2 py-0.5 ${userTier.color} rounded text-xs font-semibold text-white`}>
              {userTier.icon} {userTier.name}
            </div>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(showcase.createdAt), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm line-clamp-3">{showcase.description}</p>

        {/* Related Bot */}
        {showcase.relatedBot && (
          <Link
            href={`/bots/${showcase.relatedBot.slug}`}
            className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all group/bot"
          >
            {showcase.relatedBot.avatarUrl ? (
              <img
                src={showcase.relatedBot.avatarUrl}
                alt={showcase.relatedBot.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xs">
                🤖
              </div>
            )}
            <div className="flex-1 text-sm">
              <div className="text-cyan-400 font-semibold">Helped by {showcase.relatedBot.name}</div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-500 group-hover/bot:text-cyan-400 transition-colors" />
          </Link>
        )}

        {/* Stats & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
          <div className="flex items-center gap-1 text-red-400">
            <Heart className={`w-4 h-4 ${kudosCount > 0 ? 'fill-red-400' : ''}`} />
            <span className="font-semibold">{kudosCount}</span>
            <span className="text-gray-500 text-sm">kudos</span>
          </div>

          {isOwner && onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all disabled:opacity-50"
              title="Delete showcase"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

