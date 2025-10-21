'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HireButton } from '@/components/bots/HireButton';

interface Bot {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  imageRecognition: boolean;
  voiceResponse: boolean;
  fileUpload: boolean;
  webSearch: boolean;
  scheduling: boolean;
  dataExport: boolean;
}

interface BotHireCardProps {
  bot: Bot;
  isHired: boolean;
  canHire: boolean;
  disabledReason?: string;
}

export function BotHireCard({ bot, isHired, canHire, disabledReason }: BotHireCardProps) {
  return (
    <div className="relative group h-full">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${
        isHired 
          ? 'from-cyan-500 to-blue-600' 
          : 'from-green-500 to-emerald-600'
      } rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-300`}></div>
      
      <Card className={`relative h-full flex flex-col bg-gray-900/80 backdrop-blur-xl border-gray-800 ${
        isHired 
          ? 'hover:border-cyan-500/50' 
          : 'hover:border-green-500/50'
      } transition-all duration-300 group-hover:scale-[1.02]`}>
        <CardHeader>
          <div className="relative mb-4 overflow-hidden rounded-xl h-48 bg-gradient-to-b from-gray-800/30 to-gray-900/50 flex items-center justify-center">
            <img
              src={bot.imageUrl}
              alt={bot.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            
            {!isHired && (
              <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden">
                <div className="absolute top-6 -left-8 w-40 text-center bg-yellow-500 text-black font-bold text-xs py-1 transform -rotate-45 shadow-lg">
                  UNEMPLOYED
                </div>
              </div>
            )}

          </div>

          <CardTitle className="text-xl text-white font-bold">{bot.name}</CardTitle>
          <CardDescription className="text-gray-300 text-sm line-clamp-2 min-h-[40px]">
            {bot.description}
          </CardDescription>
          
          {/* Power-Up Badges */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {bot.imageRecognition && (
              <Badge className="bg-purple-600/20 text-purple-300 border border-purple-500/50 text-xs">
                📷
              </Badge>
            )}
            {bot.voiceResponse && (
              <Badge className="bg-blue-600/20 text-blue-300 border border-blue-500/50 text-xs">
                🎤
              </Badge>
            )}
            {bot.fileUpload && (
              <Badge className="bg-green-600/20 text-green-300 border border-green-500/50 text-xs">
                📁
              </Badge>
            )}
            {bot.webSearch && (
              <Badge className="bg-cyan-600/20 text-cyan-300 border border-cyan-500/50 text-xs">
                🌐
              </Badge>
            )}
            {bot.scheduling && (
              <Badge className="bg-orange-600/20 text-orange-300 border border-orange-500/50 text-xs">
                📅
              </Badge>
            )}
            {bot.dataExport && (
              <Badge className="bg-pink-600/20 text-pink-300 border border-pink-500/50 text-xs">
                💾
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="mt-auto">
          {isHired ? (
            <div className="flex gap-2">
              <Link href={`/chat?bot=${bot.slug}`} className="flex-1">
                <Button className="w-full relative overflow-hidden group/btn bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white font-bold font-orbitron tracking-wide py-6 text-base shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105">
                  <span className="relative z-10 flex items-center justify-center">
                    💼 START SHIFT
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                </Button>
              </Link>
              <HireButton
                botId={bot.id}
                botName={bot.name}
                isHired={true}
                isDisabled={false}
              />
            </div>
          ) : (
            <HireButton
              botId={bot.id}
              botName={bot.name}
              isHired={false}
              isDisabled={!canHire}
              disabledReason={disabledReason}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

