'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Bot, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CustomBotCardProps {
  bot: {
    id: string;
    name: string;
    slug: string;
    description: string;
    knowledgeArea: string;
    imageUrl: string;
    createdAt: Date;
  };
}

export function CustomBotCard({ bot }: CustomBotCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${bot.name}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/bots/${bot.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to delete bot. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete bot:', error);
      alert('Failed to delete bot. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl opacity-30 group-hover:opacity-60 blur transition-opacity"></div>
      
      <Card className="relative bg-gray-900/90 border-purple-500/30 backdrop-blur-xl overflow-hidden h-full flex flex-col">
        <CardHeader className="pb-3">
          {/* Header Image */}
          <div className="relative mb-4 overflow-hidden rounded-xl h-48 bg-gradient-to-b from-purple-900/50 to-pink-900/50 flex items-center justify-center">
            {bot.imageUrl ? (
              <img 
                src={bot.imageUrl} 
                alt={bot.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <Bot className="w-20 h-20 text-purple-400/50" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            
            {/* Custom Badge */}
            <div className="absolute top-3 right-3">
              <Badge className="bg-purple-600/90 text-white border-purple-400/50 backdrop-blur-sm">
                ✨ Custom
              </Badge>
            </div>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-white text-xl mb-1 line-clamp-1">
                {bot.name}
              </CardTitle>
              <Badge variant="outline" className="text-xs text-purple-400 border-purple-500/50 mb-2">
                {bot.knowledgeArea}
              </Badge>
            </div>
          </div>
          <CardDescription className="text-gray-400 text-sm line-clamp-2">
            {bot.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-auto">
          <div className="flex gap-2">
            <Link href={`/chat?bot=${bot.slug}`} className="flex-1">
              <Button className="w-full relative overflow-hidden group/btn bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 text-white font-bold font-orbitron tracking-wide py-6 text-base shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
                <span className="relative z-10 flex items-center justify-center">
                  CHAT NOW
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
              </Button>
            </Link>
            
            <Button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="py-6 px-6 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/50 hover:border-red-500/70 transition-all duration-300 hover:scale-105"
            >
              {isDeleting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

