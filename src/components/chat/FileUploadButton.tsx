'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  selectedFile?: File | null;
  onRemoveFile?: () => void;
}

export function FileUploadButton({ 
  onFileSelect, 
  disabled,
  selectedFile,
  onRemoveFile 
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File must be under 10MB');
        return;
      }

      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/csv',
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF, DOC, DOCX, TXT, and CSV files are supported');
        return;
      }

      onFileSelect(file);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.csv"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      
      {selectedFile ? (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1.5">
          <FileText className="w-4 h-4 text-green-400" />
          <span className="text-xs text-green-300 font-medium max-w-[150px] truncate">
            {selectedFile.name}
          </span>
          <Button
            onClick={onRemoveFile}
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 hover:bg-red-500/20 text-red-400"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="text-green-400 hover:text-green-300 hover:bg-green-500/20 h-12 w-12 rounded-full flex-shrink-0 border border-green-500/30 animate-pulse"
          title="📁 Files Active - Upload document"
        >
          <FileText className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}

