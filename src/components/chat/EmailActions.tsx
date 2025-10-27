'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Copy, Check, ExternalLink } from 'lucide-react';

interface EmailData {
  to?: string;
  subject?: string;
  body?: string;
  cc?: string;
  bcc?: string;
}

interface EmailActionsProps {
  emailData: EmailData;
  onCopySuccess?: () => void;
}

export function EmailActions({ emailData, onCopySuccess }: EmailActionsProps) {
  const [copied, setCopied] = useState(false);

  /**
   * Open email in default email client using mailto:
   */
  function openEmailClient() {
    const params = new URLSearchParams();
    
    if (emailData.subject) params.append('subject', emailData.subject);
    if (emailData.body) params.append('body', emailData.body);
    if (emailData.cc) params.append('cc', emailData.cc);
    if (emailData.bcc) params.append('bcc', emailData.bcc);
    
    const mailtoLink = `mailto:${emailData.to || ''}?${params.toString()}`;
    
    // Check if the mailto link is too long (most clients support ~2000 chars)
    if (mailtoLink.length > 2000) {
      alert('Email is too long for mailto: link. Please use the Copy button instead.');
      return;
    }
    
    window.location.href = mailtoLink;
  }

  /**
   * Open in Gmail web interface
   */
  function openGmail() {
    const params = new URLSearchParams({
      to: emailData.to || '',
      su: emailData.subject || '',
      body: emailData.body || '',
    });
    
    if (emailData.cc) params.append('cc', emailData.cc);
    if (emailData.bcc) params.append('bcc', emailData.bcc);
    
    window.open(`https://mail.google.com/mail/?view=cm&${params.toString()}`, '_blank');
  }

  /**
   * Copy email to clipboard
   */
  async function copyToClipboard() {
    const emailText = [
      emailData.to && `To: ${emailData.to}`,
      emailData.cc && `CC: ${emailData.cc}`,
      emailData.bcc && `BCC: ${emailData.bcc}`,
      emailData.subject && `Subject: ${emailData.subject}`,
      '',
      emailData.body || '',
    ].filter(Boolean).join('\n');
    
    try {
      await navigator.clipboard.writeText(emailText);
      setCopied(true);
      onCopySuccess?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  }

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {/* Primary Action - Open in Default Email Client */}
      <Button 
        onClick={openEmailClient}
        size="lg"
        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-105"
      >
        <Mail className="w-5 h-5 mr-2" />
        Open in Email Client
      </Button>
      
      {/* Secondary Action - Gmail */}
      <Button 
        onClick={openGmail}
        size="lg"
        variant="outline"
        className="border-2 border-blue-500/50 hover:border-blue-500 hover:bg-blue-500/20 text-white font-medium transition-all duration-200 hover:scale-105"
      >
        <ExternalLink className="w-5 h-5 mr-2" />
        Open in Gmail
      </Button>
      
      {/* Tertiary Action - Copy */}
      <Button 
        onClick={copyToClipboard}
        size="lg"
        variant="outline"
        className={`border-2 font-medium transition-all duration-200 hover:scale-105 ${
          copied 
            ? 'border-green-500/70 bg-green-500/20 text-green-300 hover:border-green-500'
            : 'border-gray-500/50 hover:border-gray-400 hover:bg-gray-500/20 text-white'
        }`}
      >
        {copied ? (
          <>
            <Check className="w-5 h-5 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-5 h-5 mr-2" />
            Copy to Clipboard
          </>
        )}
      </Button>
    </div>
  );
}

/**
 * Email Preview Component
 */
interface EmailPreviewProps {
  emailData: EmailData;
}

export function EmailPreview({ emailData }: EmailPreviewProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900/70 to-gray-800/50 border-2 border-cyan-500/30 rounded-xl p-5 space-y-3 shadow-lg">
      {/* Header Section */}
      <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/20">
        <Mail className="w-5 h-5 text-cyan-400" />
        <span className="text-sm font-semibold text-cyan-400">Email Preview</span>
      </div>

      {/* Email Fields */}
      {emailData.to && (
        <div className="flex gap-3">
          <span className="text-sm font-semibold text-cyan-400/80 min-w-[70px]">To:</span>
          <span className="text-sm text-white font-medium">{emailData.to}</span>
        </div>
      )}
      
      {emailData.cc && (
        <div className="flex gap-3">
          <span className="text-sm font-semibold text-cyan-400/80 min-w-[70px]">CC:</span>
          <span className="text-sm text-white font-medium">{emailData.cc}</span>
        </div>
      )}
      
      {emailData.subject && (
        <div className="flex gap-3">
          <span className="text-sm font-semibold text-cyan-400/80 min-w-[70px]">Subject:</span>
          <span className="text-sm text-white font-semibold">{emailData.subject}</span>
        </div>
      )}
      
      {/* Email Body */}
      {emailData.body && (
        <div className="mt-4 pt-4 border-t border-cyan-500/20">
          <span className="text-xs font-semibold text-cyan-400/70 uppercase tracking-wide mb-2 block">
            Message
          </span>
          <div className="bg-gray-950/30 rounded-lg p-4 border border-gray-700/50">
            <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">
              {emailData.body}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

