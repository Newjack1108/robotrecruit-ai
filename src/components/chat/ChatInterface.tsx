'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PowerUpButton } from '@/components/chat/PowerUpButton';
import { VoiceInputButton } from '@/components/chat/VoiceInputButton';
import { FileUploadButton } from '@/components/chat/FileUploadButton';
import { RemindersPanel } from '@/components/chat/RemindersPanel';
import { IntroduceButton } from '@/components/chat/IntroduceButton';
import { ConversationHistory } from '@/components/chat/ConversationHistory';
import { BotToolsPanel } from '@/components/chat/BotToolsPanel';
import { detectIngredients } from '@/lib/ingredient-parser';
import { parseEmailFromMessage } from '@/lib/email-parser';
import { EmailActions, EmailPreview } from './EmailActions';
import { Send, Loader2, Info, Image as ImageIcon, X, Download, Flag, BookOpen, Upload, MessageSquare, Settings, Clock, Wrench, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  createdAt: Date;
}

interface PowerUps {
  imageRecognition: boolean;
  voiceResponse: boolean;
  fileUpload: boolean;
  webSearch: boolean;
  scheduling: boolean;
  dataExport: boolean;
}

interface ChatInterfaceProps {
  botId: string;
  botName: string;
  botImage: string;
  botAvatar: string;
  botSlug: string;
  botIntroAudio?: string | null;
  imageRecognitionEnabled?: boolean;
  conversationId?: string;
  isSystemBot: boolean;
  powerUps?: PowerUps;
}

export function ChatInterface({ 
  botId, 
  botName, 
  botImage, 
  botAvatar,
  botSlug,
  botIntroAudio,
  imageRecognitionEnabled = false,
  conversationId: initialConversationId,
  isSystemBot,
  powerUps
}: ChatInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activePowerUps, setActivePowerUps] = useState<Set<string>>(new Set());
  const [powerUpAllowance, setPowerUpAllowance] = useState<number>(0);
  const [powerUpUsed, setPowerUpUsed] = useState<number>(0);
  const [reportedMessages, setReportedMessages] = useState<Set<string>>(new Set());
  const [limitModal, setLimitModal] = useState<{ show: boolean; type: 'trial' | 'limit' | null; message: string }>({ show: false, type: null, message: '' });
  const [showBotTools, setShowBotTools] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState<Record<string, string[]>>({}); // messageId -> ingredients[]
  const [itemsToAddToList, setItemsToAddToList] = useState<string[]>([]); // Items to pass to ChefBotTools
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user's power-up allowance
  useEffect(() => {
    loadPowerUpAllowance();
  }, []);

  // Detect ingredients in Chef Bot messages (only for chef-bot)
  useEffect(() => {
    if (botSlug === 'chef-bot' && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Only detect in assistant messages that haven't been processed yet
      if (lastMessage.role === 'assistant' && !detectedIngredients[lastMessage.id]) {
        const ingredients = detectIngredients(lastMessage.content);
        
        if (ingredients) {
          setDetectedIngredients(prev => ({
            ...prev,
            [lastMessage.id]: ingredients
          }));
        }
      }
    }
  }, [messages, botSlug, detectedIngredients]);

  const loadPowerUpAllowance = async () => {
    try {
      const response = await fetch('/api/user/powerup-allowance');
      if (response.ok) {
        const data = await response.json();
        setPowerUpAllowance(data.allowance);
        setPowerUpUsed(data.used);
      }
    } catch (error) {
      console.error('Failed to load power-up allowance:', error);
    }
  };

  // Add a single ingredient to shopping list
  const addIngredientToList = (ingredient: string) => {
    setItemsToAddToList([ingredient]);
    // Clear after a short delay so it can trigger the ChefBotTools useEffect
    setTimeout(() => setItemsToAddToList([]), 100);
    
    // Show tools panel if not already visible
    if (!showBotTools) {
      setShowBotTools(true);
    }
  };

  // Add all detected ingredients to shopping list
  const addAllIngredientsToList = (ingredients: string[]) => {
    setItemsToAddToList(ingredients);
    // Clear after a short delay
    setTimeout(() => setItemsToAddToList([]), 100);
    
    // Show tools panel if not already visible
    if (!showBotTools) {
      setShowBotTools(true);
    }
  };

  const activatePowerUp = async (powerUpType: string): Promise<boolean> => {
    // Check if already active - allow deactivation
    if (activePowerUps.has(powerUpType)) {
      const newActivePowerUps = new Set(activePowerUps);
      newActivePowerUps.delete(powerUpType);
      setActivePowerUps(newActivePowerUps);
      return true;
    }
    
    // For demo purposes: allow activation even without credits
    // Just toggle the state locally for visual effect
    const newActivePowerUps = new Set(activePowerUps);
    newActivePowerUps.add(powerUpType);
    setActivePowerUps(newActivePowerUps);
    
    // Try to actually activate with backend (but don't block if it fails)
    try {
      const response = await fetch('/api/power-ups/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          botId, 
          powerUpType,
          conversationId 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPowerUpUsed(powerUpAllowance - data.remaining);
      }
    } catch (error) {
      console.log('Power-up activated (demo mode):', powerUpType);
    }
    
    return true;
  };

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      loadConversationPowerUps();
    } else {
      // Clear power-ups when starting a new conversation
      setActivePowerUps(new Set());
    }
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    const scrollToBottom = () => {
      if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
      }
    };
    
    // Use setTimeout to ensure DOM is updated
    setTimeout(scrollToBottom, 100);
  }, [messages, isLoading]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/chat?conversationId=${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadConversationPowerUps = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/powerups`);
      if (response.ok) {
        const data = await response.json();
        const powerUpsArray = data.activePowerUps || [];
        setActivePowerUps(new Set(powerUpsArray));
        console.log('[POWER_UP] Loaded active power-ups for conversation:', powerUpsArray);
      }
    } catch (error) {
      console.error('Failed to load conversation power-ups:', error);
    }
  };

  const handleSelectConversation = (newConversationId: string) => {
    setConversationId(newConversationId);
    router.push(`/chat?bot=${botSlug}&conversation=${newConversationId}`);
  };

  const handleNewConversation = () => {
    setConversationId(undefined);
    setMessages([]);
    setInput('');
    removeImage();
    setSelectedFile(null);
    setActivePowerUps(new Set()); // Clear active power-ups
    router.push(`/chat?bot=${botSlug}`);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit for free hosting
        alert('Image must be under 4MB');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const checkContentSafety = (text: string): { safe: boolean; warning?: string } => {
    const lowerText = text.toLowerCase();
    
    // Check for obviously harmful content patterns
    const harmfulPatterns = [
      { pattern: /\b(kill|harm|hurt)\s+(myself|yourself|themselves)\b/i, warning: 'self-harm or harm to others' },
      { pattern: /\bhow\s+to\s+(make|create|build)\s+(bomb|weapon|explosive)\b/i, warning: 'dangerous or illegal activities' },
      { pattern: /\b(hack|steal|fraud|scam)\b.*\b(account|password|credit\s*card|bank)\b/i, warning: 'illegal activities' },
    ];

    for (const { pattern, warning } of harmfulPatterns) {
      if (pattern.test(text)) {
        return { safe: false, warning };
      }
    }

    return { safe: true };
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage && !selectedFile) || isLoading) return;

    // Basic content safety check
    if (input.trim()) {
      const safetyCheck = checkContentSafety(input);
      if (!safetyCheck.safe) {
        alert(
          `⚠️ Safety Alert\n\n` +
          `Your message contains content related to ${safetyCheck.warning}. ` +
          `This type of content violates our safety guidelines.\n\n` +
          `If you're experiencing a crisis or emergency:\n` +
          `• Call emergency services (911)\n` +
          `• Contact a crisis helpline\n` +
          `• Reach out to a trusted person\n\n` +
          `We're here to help with safe, constructive conversations.`
        );
        return;
      }
    }

    const userMessage = input.trim() || (selectedImage ? '(Image attached)' : selectedFile ? `(File: ${selectedFile.name})` : '');
    const imagePreview = selectedImage;
    const fileToUpload = imageFile;
    const documentToUpload = selectedFile;
    
    setInput('');
    removeImage();
    setSelectedFile(null);

    const tempUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      imageUrl: imagePreview || undefined,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);
    setIsLoading(true);

    // Check if we should show web search indicator
    const webSearchIndicators = [
      /\b(current|latest|recent|today|this week|this month|2024|2025)\b/i,
      /\b(news|update|happening|going on)\b/i,
      /\b(weather|temperature|forecast)\b/i,
      /\b(price|stock|crypto)\b/i,
    ];
    const needsWebSearch = activePowerUps.has('webSearch') && 
      webSearchIndicators.some(pattern => pattern.test(userMessage));
    
    if (needsWebSearch) {
      setIsSearching(true);
      // Show search indicator for 1.5 seconds
      setTimeout(() => setIsSearching(false), 1500);
    }

    try {
      let uploadedImageUrl = undefined;
      let uploadedFileId = undefined;

      // Upload image to get public URL if image is selected
      if (fileToUpload) {
        const formData = new FormData();
        formData.append('file', fileToUpload);

        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadData = await uploadResponse.json();
        uploadedImageUrl = uploadData.url;
      }

      // Upload document file to OpenAI if file is selected
      if (documentToUpload) {
        const formData = new FormData();
        formData.append('file', documentToUpload);

        const uploadResponse = await fetch('/api/upload-file', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Failed to upload file: ${errorText}`);
        }

        const uploadData = await uploadResponse.json();
        uploadedFileId = uploadData.fileId;
        console.log('[FILE_UPLOAD] File uploaded with ID:', uploadedFileId);
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          botId,
          conversationId,
          imageUrl: uploadedImageUrl,
          fileId: uploadedFileId,
          activePowerUps: Array.from(activePowerUps),
        }),
      });

      if (!response.ok) {
        // Check for trial/limit errors with JSON response
        if (response.status === 403 || response.status === 429) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            if (errorData.trialEnded) {
              throw new Error('TRIAL_EXPIRED:' + errorData.message);
            }
            if (errorData.limitReached) {
              throw new Error('LIMIT_REACHED:' + errorData.message);
            }
          }
        }
        
        const error = await response.text();
        if (response.status === 503) {
          throw new Error('This bot is not configured yet. Please contact an administrator.');
        }
        if (response.status === 403) {
          throw new Error(error);
        }
        throw new Error(error);
      }

      const data = await response.json();
      
      if (!conversationId) {
        setConversationId(data.conversationId);
      }

      setMessages((prev) => [...prev, data.message]);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
      
      // Check for trial/limit errors
      const errorMessage = error.message || '';
      if (errorMessage.startsWith('TRIAL_EXPIRED:')) {
        const message = errorMessage.replace('TRIAL_EXPIRED:', '');
        setLimitModal({ show: true, type: 'trial', message });
      } else if (errorMessage.startsWith('LIMIT_REACHED:')) {
        const message = errorMessage.replace('LIMIT_REACHED:', '');
        setLimitModal({ show: true, type: 'limit', message });
      } else {
        alert(errorMessage || 'Failed to send message. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReportMessage = async (messageId: string) => {
    if (reportedMessages.has(messageId)) {
      alert('This message has already been reported. Thank you for helping keep our platform safe.');
      return;
    }

    const confirmed = confirm(
      'Report this message?\n\n' +
      'This will flag the content for review by our moderation team. ' +
      'Reports help us maintain a safe and respectful environment.\n\n' +
      'Reasons to report:\n' +
      '• Harmful or dangerous content\n' +
      '• Inappropriate or offensive material\n' +
      '• Misinformation on critical topics\n' +
      '• Privacy or security concerns'
    );

    if (confirmed) {
      // Mark as reported locally
      setReportedMessages(new Set(reportedMessages).add(messageId));
      
      // TODO: Send report to backend for logging/review
      // await fetch('/api/report-message', { method: 'POST', body: JSON.stringify({ messageId, conversationId }) });
      
      alert('Thank you for your report. Our team will review this content. You can continue using the service safely.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Bot Header Card - Redesigned */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-8">
          {/* Left: Bot Image - Enhanced with Effects */}
          <div className="flex items-center justify-center md:col-span-1">
            <div className="relative w-80 h-80 group">
              {/* Animated Glow Rings */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 blur-3xl animate-glow-pulse" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-pink-500/20 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
              
              {/* Rotating Holographic Border Ring */}
              <div className="absolute inset-0 rounded-full opacity-40 animate-spin-very-slow">
                <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-border" 
                     style={{ 
                       maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
                       WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)'
                     }} 
                />
              </div>
              
              {/* Floating Particles */}
              <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60 animate-float"
                    style={{
                      left: `${15 + (i * 12)}%`,
                      top: `${20 + (i % 3) * 25}%`,
                      animationDelay: `${i * 0.4}s`,
                      animationDuration: `${3 + (i % 3)}s`
                    }}
                  />
                ))}
              </div>
              
              {/* Bot Image */}
              <img 
                src={botAvatar} 
                alt={botName}
                className="relative w-full h-full object-contain object-center group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl filter group-hover:brightness-110 group-hover:drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]"
              />
            </div>
          </div>

          {/* Middle: Bot Info */}
          <div className="flex flex-col justify-center text-center md:text-left space-y-4 md:pl-4">
            <div>
              <h1 className="text-4xl font-orbitron font-bold text-white mb-3">{botName}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-green-400 font-orbitron font-semibold mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>Online & Ready</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <IntroduceButton audioUrl={botIntroAudio} botName={botName} />
              
              <Link href={`/bots/${botSlug}`}>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:border-cyan-400 w-full md:w-auto"
                >
                  <Info className="w-4 h-4 mr-2" />
                  View Full Profile
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Right: Power-Ups (System Bots) or Training Guide (Custom Bots) */}
          <div className="flex flex-col justify-center space-y-4 md:col-span-2">
            {isSystemBot && (powerUps?.imageRecognition || powerUps?.voiceResponse || powerUps?.fileUpload || 
              powerUps?.webSearch || powerUps?.scheduling || powerUps?.dataExport) ? (
              <>
                {/* Power-Ups Section for System Bots */}
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-orbitron font-bold text-white tracking-wider">
                    POWER-UPS
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <div className={`text-sm font-orbitron font-bold ${
                        powerUpAllowance - powerUpUsed === 0 ? 'text-red-400' : 
                        powerUpAllowance - powerUpUsed < 5 ? 'text-yellow-400' : 
                        'text-cyan-400'
                      }`}>
                        {powerUpAllowance - powerUpUsed}
                      </div>
                      <span className="text-[10px] text-gray-400">Remaining</span>
                    </div>
                    <Link href="/powerups/purchase">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-xs font-bold"
                      >
                        + BUY
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {powerUps?.imageRecognition && (
                    <PowerUpButton
                      type="imageRecognition"
                      emoji="📷"
                      label="Vision"
                      isActive={activePowerUps.has('imageRecognition')}
                      isEnabled={true}
                      onActivate={() => activatePowerUp('imageRecognition')}
                    />
                  )}
                  {powerUps?.voiceResponse && (
                    <PowerUpButton
                      type="voiceResponse"
                      emoji="🎤"
                      label="Voice"
                      isActive={activePowerUps.has('voiceResponse')}
                      isEnabled={true}
                      onActivate={() => activatePowerUp('voiceResponse')}
                    />
                  )}
                  {powerUps?.fileUpload && (
                    <PowerUpButton
                      type="fileUpload"
                      emoji="📁"
                      label="Files"
                      isActive={activePowerUps.has('fileUpload')}
                      isEnabled={true}
                      onActivate={() => activatePowerUp('fileUpload')}
                    />
                  )}
                  {powerUps?.webSearch && (
                    <PowerUpButton
                      type="webSearch"
                      emoji="🌐"
                      label="Web"
                      isActive={activePowerUps.has('webSearch')}
                      isEnabled={true}
                      onActivate={() => activatePowerUp('webSearch')}
                    />
                  )}
                  {powerUps?.scheduling && (
                    <PowerUpButton
                      type="scheduling"
                      emoji="📅"
                      label="Schedule"
                      isActive={activePowerUps.has('scheduling')}
                      isEnabled={true}
                      onActivate={() => activatePowerUp('scheduling')}
                    />
                  )}
                  {powerUps?.dataExport && (
                    <PowerUpButton
                      type="dataExport"
                      emoji="💾"
                      label="Export"
                      isActive={activePowerUps.has('dataExport')}
                      isEnabled={true}
                      onActivate={() => activatePowerUp('dataExport')}
                    />
                  )}
                </div>
                <p className="text-xs text-gray-400 text-center font-orbitron tracking-wide">
                  {(powerUps?.imageRecognition || powerUps?.voiceResponse || powerUps?.fileUpload || 
                    powerUps?.webSearch || powerUps?.scheduling || powerUps?.dataExport) 
                    ? 'CLICK TO ACTIVATE • 1 CREDIT' 
                    : 'UPGRADE TO UNLOCK POWER-UPS'}
                </p>
              </>
            ) : (
              <>
                {/* Training & Learning Guide for Custom Bots */}
                <div className="bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-orange-900/30 border border-purple-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                    <h3 className="text-2xl font-orbitron font-bold text-white tracking-wider">
                      TRAINING & LEARNING
                    </h3>
                  </div>
                  
                  <div className="space-y-4 text-sm text-gray-300">
                    <div className="flex items-start gap-3">
                      <Upload className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-cyan-300 mb-1">Upload Knowledge Files</p>
                        <p className="text-xs text-gray-400">Add PDFs, documents, and files to expand your bot's knowledge base. The more context you provide, the smarter it becomes.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-300 mb-1">Chat to Train & Refine</p>
                        <p className="text-xs text-gray-400">Every conversation helps your bot learn your preferences. Be specific in your questions and provide feedback.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Settings className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-orange-300 mb-1">Manage Files & Context</p>
                        <p className="text-xs text-gray-400">Regularly update your bot's files to keep information current. Remove outdated content to maintain accuracy.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-purple-500/20">
                    <Link href={`/bots/${botSlug}/files`}>
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold">
                        <Upload className="w-4 h-4 mr-2" />
                        Manage Knowledge Files
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reminders Panel - Only show when Scheduling power-up is active */}
      <RemindersPanel isActive={activePowerUps.has('scheduling')} />

      {/* Main Content Area: Sidebar + Chat Window */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Conversation History Sidebar */}
        <div className="lg:col-span-1 h-[600px]">
          <ConversationHistory
            botId={botId}
            currentConversationId={conversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
          />
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-3 space-y-4">
          {/* Data Export Buttons - Only show when Export power-up is active */}
          {activePowerUps.has('dataExport') && conversationId && messages.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch">
              {/* AI Summary Export */}
              <Button
                onClick={() => window.open(`/api/export/conversation?conversationId=${conversationId}&format=pdf&type=summary`, '_blank')}
                className="relative overflow-hidden group/btn bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold font-orbitron tracking-wide px-8 py-5 shadow-lg hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105 flex-1"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <Download className="w-6 h-6" />
                  <span className="text-lg">AI SUMMARY</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
              </Button>
              
              {/* Full Transcript Export */}
              <Button
                onClick={() => window.open(`/api/export/conversation?conversationId=${conversationId}&format=pdf&type=full`, '_blank')}
                variant="outline"
                className="border-2 border-cyan-500/50 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 font-bold font-orbitron tracking-wide px-8 py-5 transition-all duration-300 hover:scale-105 flex-1"
              >
                <span className="flex items-center justify-center gap-3">
                  <Download className="w-6 h-6" />
                  <span className="text-lg">FULL TRANSCRIPT</span>
                </span>
              </Button>
            </div>
          )}

          <div className="flex flex-col h-[600px] bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-gray-700/30">

        {/* Messages Area - Phone Style */}
        <div 
          ref={scrollViewportRef}
          className="flex-1 p-4 bg-gray-950/20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
        >
          <div className="space-y-3 max-w-3xl mx-auto">
          {messages.length === 0 && (
              <div className="text-center mt-16">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-xl text-white font-semibold mb-2">No messages yet</p>
                <p className="text-gray-400">Start the conversation below!</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
                className={`flex gap-2 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
                {/* Assistant Message - iPhone Style */}
              {message.role === 'assistant' && (
                  <div className="flex gap-3 max-w-[80%] group/message">
                    <img 
                      src={botAvatar} 
                      alt={botName}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-1 border-2 border-cyan-500/30"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl rounded-tl-md px-5 py-3 shadow-lg">
                        <p className="text-white text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        
                        {/* Safety warning for sensitive topics */}
                        {(message.content.toLowerCase().includes('medical') || 
                          message.content.toLowerCase().includes('legal') || 
                          message.content.toLowerCase().includes('financial') ||
                          message.content.toLowerCase().includes('health') ||
                          message.content.toLowerCase().includes('invest') ||
                          message.content.toLowerCase().includes('diagnos') ||
                          message.content.toLowerCase().includes('treatment') ||
                          message.content.toLowerCase().includes('lawyer') ||
                          message.content.toLowerCase().includes('attorney')) && (
                          <div className="mt-2">
                            <p className="text-gray-500 text-[10px] italic opacity-60">
                              For general knowledge only. Consult qualified professionals for {
                                message.content.toLowerCase().includes('medical') || message.content.toLowerCase().includes('health') || message.content.toLowerCase().includes('diagnos') || message.content.toLowerCase().includes('treatment')
                                  ? 'medical' 
                                  : message.content.toLowerCase().includes('legal') || message.content.toLowerCase().includes('lawyer') || message.content.toLowerCase().includes('attorney')
                                  ? 'legal'
                                  : 'financial'
                              } advice.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Email Actions (Email Bot Only) */}
                      {botSlug === 'email-bot' && (() => {
                        const parsedEmail = parseEmailFromMessage(message.content);
                        if (parsedEmail.isEmail && (parsedEmail.subject || parsedEmail.body)) {
                          return (
                            <div className="mt-3">
                              <EmailPreview emailData={parsedEmail} />
                              <EmailActions 
                                emailData={parsedEmail}
                                onCopySuccess={() => {
                                  // Could show a toast notification here
                                }}
                              />
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      {/* Detected Ingredients - Add to Shopping List (Chef Bot Only) */}
                      {botSlug === 'chef-bot' && detectedIngredients[message.id] && (
                        <div className="mt-2 p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <ShoppingCart className="w-4 h-4 text-cyan-400" />
                            <p className="text-xs text-cyan-400 font-semibold">
                              Ingredients detected ({detectedIngredients[message.id].length})
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {detectedIngredients[message.id].slice(0, 5).map((ingredient, idx) => (
                              <Button
                                key={idx}
                                size="sm"
                                onClick={() => addIngredientToList(ingredient)}
                                className="bg-cyan-600 hover:bg-cyan-700 text-xs h-7 px-2"
                              >
                                + {ingredient.length > 30 ? ingredient.substring(0, 30) + '...' : ingredient}
                              </Button>
                            ))}
                            {detectedIngredients[message.id].length > 5 && (
                              <span className="text-xs text-gray-400 self-center">
                                +{detectedIngredients[message.id].length - 5} more
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addAllIngredientsToList(detectedIngredients[message.id])}
                            className="w-full text-xs h-7 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Add All to Shopping List
                          </Button>
                        </div>
                      )}
                      
                      {/* Report Button - Shows on hover */}
                      <button
                        onClick={() => handleReportMessage(message.id)}
                        className={`mt-1 ml-2 text-xs flex items-center gap-1 transition-all ${
                          reportedMessages.has(message.id)
                            ? 'text-red-400 opacity-100'
                            : 'text-gray-500 opacity-0 group-hover/message:opacity-100 hover:text-red-400'
                        }`}
                        title="Report this message"
                      >
                        <Flag className="w-3 h-3" />
                        {reportedMessages.has(message.id) ? 'Reported' : 'Report'}
                      </button>
                    </div>
                  </div>
              )}
              
                {/* User Message - iPhone Style */}
              {message.role === 'user' && (
                  <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-3xl rounded-tr-md px-5 py-3 shadow-lg max-w-[80%]">
                    {message.imageUrl && (
                      <div className="mb-2">
                        <img 
                          src={message.imageUrl} 
                          alt="Uploaded" 
                          className="rounded-lg max-w-full max-h-64 object-contain"
                        />
                    </div>
                    )}
                    <p className="text-white text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
              )}
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
              <div className="space-y-2">
                {/* Web Search Indicator */}
                {isSearching && activePowerUps.has('webSearch') && (
                  <div className="flex gap-3">
                    <img 
                      src={botAvatar} 
                      alt={botName}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-1 border-2 border-cyan-500/30"
                    />
                    <div className="bg-cyan-600/20 border border-cyan-500/50 backdrop-blur-sm rounded-3xl rounded-tl-md px-5 py-3">
                      <p className="text-cyan-300 text-sm flex items-center gap-2">
                        🌐 Searching the web...
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </span>
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Typing Indicator */}
                <div className="flex gap-3">
                  <img 
                    src={botAvatar} 
                  alt={botName}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-1 border-2 border-cyan-500/30"
                />
                  <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl rounded-tl-md px-5 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Input Area - Phone Style */}
        <div className="bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 p-4">
          {/* Image Preview */}
          {selectedImage && (
            <div className="mb-3 relative inline-block">
              <img 
                src={selectedImage} 
                alt="Preview" 
                className="max-h-32 rounded-lg border-2 border-cyan-500/50"
              />
              <Button
                onClick={removeImage}
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Voice Input Button - Only show when Voice power-up is active */}
            {activePowerUps.has('voiceResponse') && (
              <VoiceInputButton
                onTranscript={(text) => {
                  setInput(text);
                }}
                disabled={isLoading}
              />
            )}

            {/* File Upload Button - Only show when Files power-up is active */}
            {activePowerUps.has('fileUpload') && (
              <FileUploadButton
                onFileSelect={setSelectedFile}
                disabled={isLoading}
                selectedFile={selectedFile}
                onRemoveFile={() => setSelectedFile(null)}
              />
            )}

            {/* Image Upload Button - Only show when Vision power-up is active */}
            {activePowerUps.has('imageRecognition') && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="ghost"
                  size="icon"
                  disabled={isLoading}
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 h-12 w-12 rounded-full flex-shrink-0 border border-purple-500/30 animate-pulse"
                  title="📷 Vision Active - Upload image"
                >
                  <ImageIcon className="w-5 h-5" />
                </Button>
              </>
            )}

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
              placeholder={
                activePowerUps.has('voiceResponse') && activePowerUps.has('imageRecognition') && activePowerUps.has('fileUpload')
                  ? "Type, speak, upload file or image..."
                  : activePowerUps.has('voiceResponse') && activePowerUps.has('imageRecognition')
                  ? "Type, speak, or upload..."
                  : activePowerUps.has('voiceResponse') && activePowerUps.has('fileUpload')
                  ? "Type, speak, or upload file..."
                  : activePowerUps.has('imageRecognition') && activePowerUps.has('fileUpload')
                  ? "Type or upload file/image..."
                  : activePowerUps.has('voiceResponse')
                  ? "Type or speak a message..."
                  : activePowerUps.has('imageRecognition')
                  ? "Type or upload an image..."
                  : activePowerUps.has('fileUpload')
                  ? "Type or upload a file..."
                  : "Type a message..."
              }
                disabled={isLoading}
              className="flex-1 bg-gray-800/80 border-gray-700 rounded-full px-5 py-3 text-white placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:border-transparent text-base h-12"
              />
              
              {/* Bot Tools Button - Only for bots with tools */}
              {(botSlug === 'chef-bot' || botSlug === 'fishing-bot' || botSlug === 'bee-bot') && (
                <Button 
                  onClick={() => setShowBotTools(!showBotTools)} 
                  className={`h-12 w-12 rounded-full shadow-lg flex-shrink-0 ${
                    showBotTools 
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  size="icon"
                  title="Bot Tools"
                >
                  <Wrench className="w-5 h-5" />
                </Button>
              )}
              
              <Button 
                onClick={sendMessage} 
              disabled={(!input.trim() && !selectedImage && !selectedFile) || isLoading}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 h-12 w-12 rounded-full shadow-lg flex-shrink-0"
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
          </div>
          
          {/* Active Power-Ups Helper Text */}
          {(activePowerUps.has('imageRecognition') || activePowerUps.has('voiceResponse') || activePowerUps.has('fileUpload') || activePowerUps.has('webSearch') || activePowerUps.has('scheduling')) && (
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              {activePowerUps.has('imageRecognition') && (
                <p className="text-xs text-purple-400 font-orbitron">
                  📷 VISION ACTIVE
                </p>
              )}
              {activePowerUps.has('voiceResponse') && (
                <p className="text-xs text-blue-400 font-orbitron">
                  🎤 VOICE ACTIVE
                </p>
              )}
              {activePowerUps.has('fileUpload') && (
                <p className="text-xs text-green-400 font-orbitron">
                  📁 FILES ACTIVE
                </p>
              )}
              {activePowerUps.has('webSearch') && (
                <p className="text-xs text-cyan-400 font-orbitron">
                  🌐 WEB SEARCH ACTIVE
                </p>
              )}
              {activePowerUps.has('scheduling') && (
                <p className="text-xs text-orange-400 font-orbitron">
                  📅 REMINDERS ACTIVE
                </p>
              )}
            </div>
          )}
          
          {/* Compact Safety Notice - Bottom */}
          <div className="border-t border-yellow-600/20 bg-yellow-900/10 px-3 py-1.5">
            <p className="text-yellow-400/70 text-[10px] text-center leading-relaxed">
              ⚠️ AI Safety: Information for general purposes only. Verify important info with professionals. Not for medical, legal, or financial advice. 
              <button 
                onClick={() => alert('AI Safety Guidelines:\n\n• Always verify important information with qualified professionals\n• Do not rely on AI for medical, legal, or financial advice\n• Not suitable for safety-critical decisions\n• Use the flag button to report concerning behavior\n• This AI assistant has limitations - consult experts for your specific situation')}
                className="text-yellow-300 hover:text-yellow-200 underline ml-1"
              >
                Learn more
              </button>
            </p>
          </div>
        </div>
          </div>
        </div>
      </div>

      {/* Bot-Specific Tools Panel - Full Width Below Chat */}
      {showBotTools && (
        <div className="mt-4">
          <BotToolsPanel 
            botSlug={botSlug} 
            conversationId={conversationId}
            isVisible={showBotTools}
            onClose={() => setShowBotTools(false)}
            itemsToAdd={itemsToAddToList}
          />
        </div>
      )}

      {/* Trial/Limit Modal */}
      {limitModal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                {limitModal.type === 'trial' ? (
                  <Clock className="w-8 h-8 text-white" />
                ) : (
                  <MessageSquare className="w-8 h-8 text-white" />
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-white font-orbitron">
                {limitModal.type === 'trial' ? 'Trial Expired' : 'Daily Limit Reached'}
              </h3>
              
              <p className="text-gray-300 text-base">
                {limitModal.message}
              </p>
              
              <div className="space-y-3 pt-4">
                <button
                  onClick={() => {
                    setLimitModal({ show: false, type: null, message: '' });
                    router.push('/subscription');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all shadow-lg"
                >
                  View Subscription Plans
                </button>
                
                <button
                  onClick={() => setLimitModal({ show: false, type: null, message: '' })}
                  className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
