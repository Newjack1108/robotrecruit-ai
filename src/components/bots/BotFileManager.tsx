'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, File, Trash2, FileText, Image as ImageIcon, Zap, Sparkles } from 'lucide-react';

interface BotFile {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: Date;
}

interface Bot {
  id: string;
  name: string;
}

interface BotFileManagerProps {
  bot: Bot;
  initialFiles: BotFile[];
}

export function BotFileManager({ bot, initialFiles }: BotFileManagerProps) {
  const [files, setFiles] = useState<BotFile[]>(initialFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccessBang, setShowSuccessBang] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);
    setUploadProgress(0);
    setShowSuccessBang(false);

    // Simulate upload progress animation
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/bots/${bot.id}/files`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const newFile = await response.json();
      
      // BANG! Show success explosion animation
      setShowSuccessBang(true);
      
      // Wait for animation then update UI
      setTimeout(() => {
        setFiles([newFile, ...files]);
        setMessage({ type: 'success', text: '🚀 File uploaded and knowledge enhanced!' });
        setShowSuccessBang(false);
        setUploadProgress(0);
      }, 1500);
      
      // Clear the input
      e.target.value = '';
    } catch (error: any) {
      clearInterval(progressInterval);
      console.error('Failed to upload file:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to upload file. Please try again.' });
      setUploadProgress(0);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
      }, 1500);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file? This will remove it from the bot\'s knowledge base.')) {
      return;
    }

    try {
      const response = await fetch(`/api/bots/${bot.id}/files?fileId=${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      setFiles(files.filter(f => f.id !== fileId));
      setMessage({ type: 'success', text: 'File deleted successfully!' });
    } catch (error) {
      console.error('Failed to delete file:', error);
      setMessage({ type: 'error', text: 'Failed to delete file. Please try again.' });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-purple-400" />;
    }
    return <FileText className="w-5 h-5 text-blue-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="relative bg-white/5 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 overflow-hidden">
        {/* Success Bang Animation */}
        {showSuccessBang && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            {/* Explosion rings */}
            <div className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-ping opacity-75"></div>
            <div className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 animate-ping opacity-50" style={{animationDelay: '0.1s'}}></div>
            <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 animate-ping opacity-25" style={{animationDelay: '0.2s'}}></div>
            
            {/* Sparkles */}
            <Sparkles className="absolute w-16 h-16 text-yellow-400 animate-spin" />
            <Zap className="absolute w-20 h-20 text-cyan-400 animate-pulse" />
            
            {/* Success text */}
            <div className="absolute text-center animate-bounce">
              <p className="text-4xl font-orbitron font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]">
                💥 UPLOADED! 💥
              </p>
            </div>
          </div>
        )}

        <h3 className="text-xl font-orbitron font-bold text-white mb-4">Upload Knowledge Files</h3>
        
        <div className="space-y-4">
          <div className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            isUploading 
              ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.3)]' 
              : 'border-gray-700 hover:border-cyan-500/50'
          }`}>
            {/* Animated background during upload */}
            {isUploading && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 animate-pulse"></div>
            )}
            
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
              accept=".pdf,.txt,.md,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif"
            />
            <label
              htmlFor="file-upload"
              className={`relative z-10 ${isUploading ? 'cursor-wait' : 'cursor-pointer'}`}
            >
              {isUploading ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Upload className="w-12 h-12 text-cyan-400 mx-auto animate-bounce" />
                    <Zap className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 text-yellow-400 animate-ping" />
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-300 relative overflow-hidden"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1s_infinite]"></div>
                    </div>
                  </div>
                  
                  <p className="text-cyan-400 font-bold font-orbitron animate-pulse">
                    ⚡ UPLOADING... {Math.round(uploadProgress)}% ⚡
                  </p>
                  <p className="text-sm text-cyan-300/70">
                    Enhancing bot's neural network...
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative inline-block">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4 transition-all group-hover:text-cyan-400" />
                  </div>
                  <p className="text-white font-medium mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, TXT, MD, DOC, DOCX, or Images (max 20MB)
                  </p>
                </>
              )}
            </label>
          </div>

          {message && !showSuccessBang && (
            <div
              className={`p-4 rounded-lg text-sm font-medium animate-[slideIn_0.3s_ease-out] ${
                message.type === 'success'
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                  : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Files List */}
      <div className="bg-white/5 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
        <h3 className="text-xl font-orbitron font-bold text-white mb-4">
          Knowledge Base Files ({files.length})
        </h3>
        
        {files.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No files uploaded yet</p>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getFileIcon(file.fileType)}
                  <div className="flex-1">
                    <p className="text-white font-medium">{file.fileName}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.fileSize)} • Uploaded {new Date(file.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleDelete(file.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <h4 className="text-lg font-orbitron font-bold text-blue-300 mb-2">💡 How It Works</h4>
        <ul className="space-y-2 text-sm text-blue-200">
          <li>• Upload documents, PDFs, or images to enhance your bot's knowledge</li>
          <li>• The bot will use these files to provide more accurate and detailed answers</li>
          <li>• Images can be analyzed and described by the bot</li>
          <li>• Documents are searchable - the bot finds relevant information automatically</li>
          <li>• You can upload up to 20MB per file</li>
        </ul>
      </div>
    </div>
  );
}



