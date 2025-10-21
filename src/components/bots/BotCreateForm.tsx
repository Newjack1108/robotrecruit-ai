'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, X, ImageIcon } from 'lucide-react';

interface BotCreateFormProps {
  userId: string;
}

export function BotCreateForm({ userId }: BotCreateFormProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    knowledgeArea: '',
    instructions: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file (PNG, JPG, or WebP)' });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 2MB' });
      return;
    }

    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setMessage(null);
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setMessage(null);

    try {
      let avatarUrl = '/bots/boss-bot.png'; // Default avatar

      // Upload avatar if provided
      if (avatarFile) {
        setIsUploadingAvatar(true);
        const avatarFormData = new FormData();
        avatarFormData.append('file', avatarFile);

        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: avatarFormData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          avatarUrl = uploadData.url;
        } else {
          console.warn('Avatar upload failed, using default');
        }
        setIsUploadingAvatar(false);
      }

      // Create bot with avatar URL
      const response = await fetch('/api/bots/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imageUrl: avatarUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const bot = await response.json();
      setMessage({ type: 'success', text: 'Bot created and recruited! Redirecting to upload files...' });
      
      // Redirect to file upload page after 1 second
      setTimeout(() => {
        router.push(`/bots/${bot.slug}/files`);
      }, 1000);
    } catch (error: any) {
      console.error('Failed to create bot:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to create bot. Please try again.' });
      setIsCreating(false);
      setIsUploadingAvatar(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 space-y-6">
        {/* Avatar Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bot Avatar
          </label>
          <div className="flex items-start gap-4">
            {/* Preview or Placeholder */}
            <div className="relative">
              <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-700 bg-gray-800/50 flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-600" />
                )}
              </div>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Upload Instructions */}
            <div className="flex-1">
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleAvatarChange}
              />
              <label
                htmlFor="avatar-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4" />
                Choose Image
              </label>
              
              <div className="mt-3 space-y-1 text-xs text-gray-400">
                <p className="font-semibold text-cyan-400">📐 Recommended Size:</p>
                <p>• <span className="text-white font-medium">512x512 pixels</span> (square)</p>
                <p>• PNG or WebP format for best quality</p>
                <p>• Max file size: 2MB</p>
                <p className="text-gray-500 mt-2">
                  💡 Tip: Use a square image with your bot&apos;s face or icon centered
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bot Name *
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Marketing Expert"
            required
            className="bg-gray-800/80 border-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description *
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of what your bot does"
            required
            rows={3}
            className="bg-gray-800/80 border-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Knowledge Area *
          </label>
          <Input
            type="text"
            value={formData.knowledgeArea}
            onChange={(e) => setFormData({ ...formData, knowledgeArea: e.target.value })}
            placeholder="e.g., Digital Marketing, SEO, Content Strategy"
            required
            className="bg-gray-800/80 border-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Instructions *
          </label>
          <Textarea
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            placeholder="Describe how your bot should behave and what it knows about. Be specific!"
            required
            rows={6}
            className="bg-gray-800/80 border-gray-700 text-white"
          />
          <p className="text-xs text-gray-500 mt-2">
            These instructions guide how your bot responds. Be detailed and specific.
          </p>
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
          disabled={isCreating}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-6"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {isUploadingAvatar ? 'Uploading Avatar...' : 'Creating Bot...'}
            </>
          ) : (
            '🤖 Create Bot'
          )}
        </Button>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <h4 className="text-lg font-orbitron font-bold text-blue-300 mb-2">📚 Next Steps</h4>
        <ul className="space-y-2 text-sm text-blue-200">
          <li>1. Create your bot with a name and instructions</li>
          <li>2. Upload knowledge files (PDFs, documents, images)</li>
          <li>3. Start chatting with your custom AI assistant!</li>
        </ul>
      </div>
    </form>
  );
}



