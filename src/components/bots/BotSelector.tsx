'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Zap, ArrowRight } from 'lucide-react';

interface Bot {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  knowledgeArea: string;
  tier: number;
  isSystemBot: boolean;
  imageRecognition: boolean;
  voiceResponse: boolean;
  fileUpload: boolean;
  webSearch: boolean;
  scheduling: boolean;
  dataExport: boolean;
}

interface BotSelectorProps {
  userTier: number;
}

export function BotSelector({ userTier }: BotSelectorProps) {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      const response = await fetch('/api/bots');
      if (response.ok) {
        const data = await response.json();
        setBots(data);
      }
    } catch (error) {
      console.error('Failed to load bots:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChat = (botSlug: string) => {
    router.push(`/chat?bot=${botSlug}`);
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 2: return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 3: return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const canAccess = (botTier: number) => userTier >= botTier;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-20 blur animate-pulse"></div>
            <Card className="relative bg-gray-900/50 border-gray-800 backdrop-blur-xl">
              <CardHeader>
                <div className="w-full h-48 bg-gray-800/50 rounded-lg mb-4 animate-pulse" />
                <div className="h-6 bg-gray-800/50 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-4 bg-gray-800/50 rounded w-full animate-pulse" />
              </CardHeader>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots
            .filter((bot) => bot.isSystemBot && bot.slug !== 'boss-bot')
            .map((bot) => {
              return (
                <div key={bot.id} className="relative group h-full">
                  {/* Glow Effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-300"></div>
                  
                  <Card className="relative h-full flex flex-col bg-gray-900/80 backdrop-blur-xl border-gray-800 hover:border-cyan-500/50 transition-all duration-300 group-hover:scale-[1.02]">
                    <CardHeader>
                      {/* Bot Image - Full image visible */}
                      <div className="relative mb-4 overflow-hidden rounded-xl h-64 bg-gradient-to-b from-gray-800/30 to-gray-900/50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10"></div>
                        <img
                          src={bot.imageUrl}
                          alt={bot.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />

                      </div>
                      
                      {/* Bot Info */}
                      <div className="space-y-3">
                        <CardTitle className="text-2xl text-white font-bold flex items-center gap-2">
                          {bot.name}
                        </CardTitle>
                        
                        <CardDescription className="text-gray-300 text-base leading-relaxed line-clamp-3 min-h-[72px]">
                          {bot.description}
                        </CardDescription>
                        
                        {/* Power-Up Badges */}
                        <div className="flex flex-wrap gap-2">
                          {bot.imageRecognition && (
                            <Badge className="bg-purple-600/20 text-purple-300 border border-purple-500/50 text-xs">
                              📷 Vision
                            </Badge>
                          )}
                          {bot.voiceResponse && (
                            <Badge className="bg-blue-600/20 text-blue-300 border border-blue-500/50 text-xs">
                              🎤 Voice
                            </Badge>
                          )}
                          {bot.fileUpload && (
                            <Badge className="bg-green-600/20 text-green-300 border border-green-500/50 text-xs">
                              📁 Files
                            </Badge>
                          )}
                          {bot.webSearch && (
                            <Badge className="bg-cyan-600/20 text-cyan-300 border border-cyan-500/50 text-xs">
                              🌐 Web
                            </Badge>
                          )}
                          {bot.scheduling && (
                            <Badge className="bg-orange-600/20 text-orange-300 border border-orange-500/50 text-xs">
                              📅 Schedule
                            </Badge>
                          )}
                          {bot.dataExport && (
                            <Badge className="bg-pink-600/20 text-pink-300 border border-pink-500/50 text-xs">
                              💾 Export
                            </Badge>
                          )}
                        </div>
                        
                        <div className="pt-1">
                          <span className="text-sm text-cyan-400 font-medium">
                            {bot.knowledgeArea}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 space-y-3 mt-auto">
                      <Button 
                        onClick={() => router.push(`/bots/${bot.slug}`)}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-base py-6 rounded-xl shadow-lg"
                      >
                        <ArrowRight className="w-5 h-5 mr-2" />
                        View CV & Recruit
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
        </div>
      </div>

      {/* Custom Bots Section */}
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-orbitron font-bold text-white mb-2">My Custom Bots</h2>
            <p className="text-gray-400 text-lg">Your personalized AI assistants</p>
          </div>
          {userTier >= 2 && (
            <Button
              onClick={() => router.push('/bots/create')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold"
            >
              ✨ Create New Bot
            </Button>
          )}
        </div>
        
        {bots.filter((bot) => !bot.isSystemBot).length > 0 && (
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots
              .filter((bot) => !bot.isSystemBot)
              .map((bot) => (
                <div key={bot.id} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-300"></div>
                  
                  <Card className="relative bg-gray-900/80 backdrop-blur-xl border-gray-800 hover:border-purple-500/50 transition-all duration-300 group-hover:scale-[1.02]">
                    <CardHeader>
                      <div className="relative mb-4 overflow-hidden rounded-xl h-56">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10"></div>
                        <img
                          src={bot.imageUrl}
                          alt={bot.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          style={{ objectPosition: '50% 20%' }}
                        />
                        <div className="absolute top-3 right-3 z-20">
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 border backdrop-blur-md font-semibold">
                            Custom
                          </Badge>
                        </div>
                      </div>
                      
                      <CardTitle className="text-2xl text-white">{bot.name}</CardTitle>
                      <CardDescription className="text-gray-400 leading-relaxed mt-2">
                        {bot.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <Button 
                        onClick={() => startChat(bot.slug)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-base py-6 rounded-xl shadow-lg"
                      >
                        💬 Start Chat
                      </Button>
                      <Button 
                        onClick={() => router.push(`/bots/${bot.slug}/files`)}
                        variant="outline"
                        className="w-full border-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 font-bold text-base py-6 rounded-xl"
                      >
                        📁 Manage Knowledge
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
          </div>
        )}
        
        {bots.filter((bot) => !bot.isSystemBot).length === 0 && userTier >= 2 && (
          <div className="text-center py-12 bg-white/5 backdrop-blur-sm border border-gray-700/30 rounded-xl">
            <p className="text-gray-400 mb-4">You haven't created any custom bots yet</p>
            <Button
              onClick={() => router.push('/bots/create')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold"
            >
              ✨ Create Your First Bot
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}