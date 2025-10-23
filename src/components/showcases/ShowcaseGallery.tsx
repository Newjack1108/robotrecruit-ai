'use client';

import { useEffect, useState } from 'react';
import ShowcaseCard from './ShowcaseCard';
import ShowcaseUploadForm from './ShowcaseUploadForm';
import { Plus, Trophy, Filter } from 'lucide-react';
import { SHOWCASE_CATEGORIES } from '@/lib/showcase-categories';

interface ShowcaseGalleryProps {
  userId?: string; // If provided, show only this user's showcases
  botId?: string; // If provided, show only showcases for this bot
  currentUserId?: string; // The logged-in user's ID (for kudos/delete permissions)
  allowUpload?: boolean; // Show upload button
  limit?: number; // Max showcases to display
  compact?: boolean; // Compact view for embedding in bot CVs
  availableBots?: Array<{ id: string; name: string; slug: string }>;
}

export default function ShowcaseGallery({
  userId,
  botId,
  currentUserId,
  allowUpload = false,
  limit,
  compact = false,
  availableBots = [],
}: ShowcaseGalleryProps) {
  const [showcases, setShowcases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const fetchShowcases = async () => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (botId) params.append('botId', botId);
      if (limit) params.append('limit', limit.toString());
      if (filterCategory !== 'all') params.append('category', filterCategory);

      const response = await fetch(`/api/showcases?${params}`);
      if (!response.ok) throw new Error('Failed to fetch showcases');

      const data = await response.json();
      setShowcases(data.showcases || []);
    } catch (error) {
      console.error('Failed to fetch showcases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowcases();
  }, [userId, botId, limit, filterCategory]);

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    fetchShowcases(); // Refresh the list
  };

  const handleDelete = () => {
    fetchShowcases(); // Refresh after delete
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading showcases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Achievement Showcases
          </h2>
        </div>

        {allowUpload && !showUploadForm && (
          <button
            onClick={() => setShowUploadForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Achievement
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-500/30">
          <h3 className="text-xl font-bold text-white mb-4">Share Your Achievement</h3>
          <ShowcaseUploadForm
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUploadForm(false)}
            availableBots={availableBots}
          />
        </div>
      )}

      {/* Category Filter */}
      {!userId && showcases.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-500" />
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
              filterCategory === 'all'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {Object.entries(SHOWCASE_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setFilterCategory(key)}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                filterCategory === key
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Showcases Grid */}
      {showcases.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">
            {userId ? 'No showcases yet' : 'No showcases found'}
          </p>
          {allowUpload && userId && (
            <p className="text-gray-500 text-sm mb-4">
              Share your achievements with the community!
            </p>
          )}
          {allowUpload && userId && !showUploadForm && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Your First Achievement
            </button>
          )}
        </div>
      ) : (
        <div className={`grid gap-6 ${
          compact 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}>
          {showcases.map((showcase) => (
            <ShowcaseCard
              key={showcase.id}
              showcase={showcase}
              currentUserId={currentUserId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

