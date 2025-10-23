'use client';

import { useState } from 'react';
import { Upload, X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { SHOWCASE_CATEGORIES, ShowcaseCategory } from '@/lib/showcase-categories';

interface ShowcaseUploadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  availableBots?: Array<{ id: string; name: string; slug: string }>;
}

export default function ShowcaseUploadForm({ onSuccess, onCancel, availableBots = [] }: ShowcaseUploadFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ShowcaseCategory>('other');
  const [relatedBotId, setRelatedBotId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setImageFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !imageFile || !category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(10);

      // Upload image to imgbb
      const formData = new FormData();
      formData.append('file', imageFile);

      setUploadProgress(30);

      const imgbbResponse = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!imgbbResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const imgbbData = await imgbbResponse.json();
      setUploadProgress(60);

      // Create showcase
      const response = await fetch('/api/showcases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl: imgbbData.url,
          category,
          relatedBotId: relatedBotId || null,
        }),
      });

      setUploadProgress(90);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create showcase');
      }

      setUploadProgress(100);

      // Success!
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 500);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload showcase');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-cyan-400 mb-2">
          Achievement Photo *
        </label>
        
        {!imagePreview ? (
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-cyan-500/30 rounded-lg cursor-pointer hover:border-cyan-500/60 transition-all bg-gray-900/50 backdrop-blur-sm group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-12 h-12 mb-3 text-cyan-500/50 group-hover:text-cyan-400 transition-colors" />
              <p className="mb-2 text-sm text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 5MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={uploading}
            />
          </label>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg border border-cyan-500/30"
            />
            <button
              type="button"
              onClick={clearImage}
              disabled={uploading}
              className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-cyan-400 mb-2">
          Title * <span className="text-gray-500 text-xs">(Max 100 characters)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="e.g., My First Beehive Harvest!"
          disabled={uploading}
          className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
        />
        <div className="text-xs text-gray-500 mt-1">{title.length}/100</div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-cyan-400 mb-2">
          Your Story * <span className="text-gray-500 text-xs">(Max 1000 characters)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={5}
          placeholder="Share the story behind this achievement! How did your bot help you? What challenges did you overcome?"
          disabled={uploading}
          className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all resize-none"
        />
        <div className="text-xs text-gray-500 mt-1">{description.length}/1000</div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-cyan-400 mb-2">
          Category *
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
          {Object.entries(SHOWCASE_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key as ShowcaseCategory)}
              disabled={uploading}
              className={`p-3 rounded-lg border transition-all text-center ${
                category === key
                  ? 'border-cyan-500 bg-cyan-500/20 scale-105'
                  : 'border-gray-700 bg-gray-900/50 hover:border-cyan-500/50'
              }`}
            >
              <div className="text-2xl mb-1">{cat.icon}</div>
              <div className="text-xs text-gray-400">{cat.label.split(' ')[0]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Related Bot */}
      {availableBots.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">
            Related Bot <span className="text-gray-500 text-xs">(Optional - Which bot helped you?)</span>
          </label>
          <select
            value={relatedBotId}
            onChange={(e) => setRelatedBotId(e.target.value)}
            disabled={uploading}
            className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-all"
          >
            <option value="">None</option>
            {availableBots.map((bot) => (
              <option key={bot.id} value={bot.id}>
                {bot.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={uploading || !title || !description || !imageFile}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {uploading ? (
            <>Uploading...</>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Share Achievement
            </>
          )}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={uploading}
            className="px-6 py-3 bg-gray-800 text-gray-400 rounded-lg font-semibold hover:bg-gray-700 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

