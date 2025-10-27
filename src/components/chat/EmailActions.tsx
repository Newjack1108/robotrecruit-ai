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
    <div className="flex flex-wrap gap-2 mt-4">
      <Button 
        onClick={openEmailClient}
        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
      >
        <Mail className="w-4 h-4 mr-2" />
        Open in Email Client
      </Button>
      
      <Button 
        onClick={openGmail}
        variant="outline"
        className="border-blue-500/50 hover:bg-blue-500/10"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Open in Gmail
      </Button>
      
      <Button 
        onClick={copyToClipboard}
        variant="outline"
        className="border-gray-500/50"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
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
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 space-y-2">
      {emailData.to && (
        <div className="flex gap-2">
          <span className="text-sm font-semibold text-gray-400 min-w-[60px]">To:</span>
          <span className="text-sm text-white">{emailData.to}</span>
        </div>
      )}
      
      {emailData.cc && (
        <div className="flex gap-2">
          <span className="text-sm font-semibold text-gray-400 min-w-[60px]">CC:</span>
          <span className="text-sm text-white">{emailData.cc}</span>
        </div>
      )}
      
      {emailData.subject && (
        <div className="flex gap-2">
          <span className="text-sm font-semibold text-gray-400 min-w-[60px]">Subject:</span>
          <span className="text-sm text-white font-medium">{emailData.subject}</span>
        </div>
      )}
      
      {emailData.body && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
            {emailData.body}
          </pre>
        </div>
      )}
    </div>
  );
}

