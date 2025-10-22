'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Eye, EyeOff, Image as ImageIcon, Mic, FileUp, Globe, Calendar, Download } from 'lucide-react';

export interface Bot {
  id: string;
  name: string;
  openaiAssistantId: string;
  imageRecognition: boolean;
  voiceResponse: boolean;
  fileUpload: boolean;
  webSearch: boolean;
  scheduling: boolean;
  dataExport: boolean;
}

export interface BotEditFormProps {
  bot: Bot;
}

export function BotEditForm({ bot }: BotEditFormProps) {
  const [assistantId, setAssistantId] = useState(bot.openaiAssistantId);
  const [imageRecognition, setImageRecognition] = useState(bot.imageRecognition);
  const [voiceResponse, setVoiceResponse] = useState(bot.voiceResponse);
  const [fileUpload, setFileUpload] = useState(bot.fileUpload);
  const [webSearch, setWebSearch] = useState(bot.webSearch);
  const [scheduling, setScheduling] = useState(bot.scheduling);
  const [dataExport, setDataExport] = useState(bot.dataExport);
  const [showId, setShowId] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/bots', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId: bot.id,
          openaiAssistantId: assistantId,
          imageRecognition,
          voiceResponse,
          fileUpload,
          webSearch,
          scheduling,
          dataExport,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bot');
      }

      setMessage({ type: 'success', text: 'Bot updated successfully!' });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Failed to update bot:', error);
      setMessage({ type: 'error', text: 'Failed to update bot. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const maskId = (id: string) => {
    if (id.length <= 8) return id;
    return `${id.substring(0, 4)}${'*'.repeat(id.length - 8)}${id.substring(id.length - 4)}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          OpenAI Assistant ID
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showId ? 'text' : 'password'}
              value={assistantId}
              onChange={(e) => setAssistantId(e.target.value)}
              placeholder="asst_..."
              className="bg-gray-800/80 border-gray-700 text-white font-mono pr-12"
            />
            <button
              type="button"
              onClick={() => setShowId(!showId)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {!showId && assistantId && (
          <p className="text-xs text-gray-500 mt-1 font-mono">
            {maskId(assistantId)}
          </p>
        )}
      </div>

      {/* Power-Ups Section */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <h3 className="text-lg font-orbitron font-bold text-purple-300 mb-3 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Power-Ups
        </h3>
        
        <div className="space-y-3">
          {/* Image Recognition Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-white">Image Recognition</span>
                <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-0.5 rounded-full">
                  📷 Vision
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Analyze uploaded images
              </p>
            </div>
            <button
              type="button"
              onClick={() => setImageRecognition(!imageRecognition)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                imageRecognition ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  imageRecognition ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Voice Response Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Mic className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-white">Voice Response</span>
                <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full">
                  🎤 Audio
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Respond with voice/audio
              </p>
            </div>
            <button
              type="button"
              onClick={() => setVoiceResponse(!voiceResponse)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                voiceResponse ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  voiceResponse ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* File Upload Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileUp className="w-4 h-4 text-green-400" />
                <span className="font-semibold text-white">File Upload</span>
                <span className="text-xs bg-green-600/20 text-green-300 px-2 py-0.5 rounded-full">
                  📁 Files
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Accept file uploads for analysis
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFileUpload(!fileUpload)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                fileUpload ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  fileUpload ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Web Search Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white">Web Search</span>
                <span className="text-xs bg-cyan-600/20 text-cyan-300 px-2 py-0.5 rounded-full">
                  🌐 Live
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Search web for current info
              </p>
            </div>
            <button
              type="button"
              onClick={() => setWebSearch(!webSearch)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                webSearch ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  webSearch ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Scheduling Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-orange-400" />
                <span className="font-semibold text-white">Scheduling</span>
                <span className="text-xs bg-orange-600/20 text-orange-300 px-2 py-0.5 rounded-full">
                  📅 Tasks
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Set reminders and schedule tasks
              </p>
            </div>
            <button
              type="button"
              onClick={() => setScheduling(!scheduling)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                scheduling ? 'bg-orange-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  scheduling ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Data Export Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Download className="w-4 h-4 text-pink-400" />
                <span className="font-semibold text-white">Data Export</span>
                <span className="text-xs bg-pink-600/20 text-pink-300 px-2 py-0.5 rounded-full">
                  💾 Export
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Export conversation data/reports
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDataExport(!dataExport)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                dataExport ? 'bg-pink-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  dataExport ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSaving || (
          assistantId === bot.openaiAssistantId && 
          imageRecognition === bot.imageRecognition &&
          voiceResponse === bot.voiceResponse &&
          fileUpload === bot.fileUpload &&
          webSearch === bot.webSearch &&
          scheduling === bot.scheduling &&
          dataExport === bot.dataExport
        )}
        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 w-full"
      >
        {isSaving ? (
          <>Saving...</>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </>
        )}
      </Button>

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
    </form>
  );
}

