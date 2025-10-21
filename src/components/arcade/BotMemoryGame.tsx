'use client';

import { useState, useEffect } from 'react';
import { GAME_BOTS, createCardDeck, calculateScore, formatTime } from '@/lib/arcade-utils';
import { Card } from '@/components/ui/card';
import { Gamepad2, Timer, MousePointerClick } from 'lucide-react';

interface GameCard {
  cardId: string;
  id: string;
  slug: string;
  name: string;
  avatarUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface BotMemoryGameProps {
  onGameComplete: (score: number, moves: number, timeSeconds: number) => void;
}

export function BotMemoryGame({ onGameComplete }: BotMemoryGameProps) {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  // Initialize game
  useEffect(() => {
    const deck = createCardDeck(GAME_BOTS);
    setCards(deck.map(card => ({
      ...card,
      isFlipped: false,
      isMatched: false
    })));
  }, []);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameComplete) return;

    const interval = setInterval(() => {
      setTimeSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, gameComplete]);

  // Check for game completion
  useEffect(() => {
    if (matchedPairs.size === GAME_BOTS.length && matchedPairs.size > 0 && !gameComplete) {
      setGameComplete(true);
      const finalScore = calculateScore(moves, timeSeconds, GAME_BOTS.length);
      onGameComplete(finalScore, moves, timeSeconds);
    }
  }, [matchedPairs, moves, timeSeconds, gameComplete, onGameComplete]);

  // Handle card flip
  const handleCardClick = (cardId: string) => {
    if (!gameStarted) {
      setGameStarted(true);
    }

    // Prevent clicking if already checking, card is matched, or card is already flipped
    if (isChecking) return;
    if (matchedPairs.has(cards.find(c => c.cardId === cardId)!.id)) return;
    if (flippedCards.includes(cardId)) return;
    if (flippedCards.length >= 2) return;

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    // Flip the card
    setCards(cards.map(card =>
      card.cardId === cardId ? { ...card, isFlipped: true } : card
    ));

    // Check for match when two cards are flipped
    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      setIsChecking(true);

      const [firstCardId, secondCardId] = newFlipped;
      const firstCard = cards.find(c => c.cardId === firstCardId);
      const secondCard = cards.find(c => c.cardId === secondCardId);

      if (firstCard && secondCard && firstCard.id === secondCard.id) {
        // Match found!
        setTimeout(() => {
          setMatchedPairs(prev => new Set([...prev, firstCard.id]));
          setCards(cards.map(card =>
            card.id === firstCard.id ? { ...card, isMatched: true } : card
          ));
          setFlippedCards([]);
          setIsChecking(false);
        }, 600);
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards(cards.map(card =>
            newFlipped.includes(card.cardId) ? { ...card, isFlipped: false } : card
          ));
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Stats Bar */}
      <div className="flex justify-between items-center mb-6 bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <MousePointerClick className="w-5 h-5 text-cyan-400" />
          <span className="text-gray-300">Moves:</span>
          <span className="text-2xl font-bold text-cyan-400">{moves}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-blue-400" />
          <span className="text-gray-300">Pairs:</span>
          <span className="text-2xl font-bold text-blue-400">
            {matchedPairs.size}/{GAME_BOTS.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-yellow-400" />
          <span className="text-gray-300">Time:</span>
          <span className="text-2xl font-bold text-yellow-400">
            {formatTime(timeSeconds)}
          </span>
        </div>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {cards.map((card) => (
          <button
            key={card.cardId}
            onClick={() => handleCardClick(card.cardId)}
            disabled={isChecking || card.isMatched || flippedCards.includes(card.cardId)}
            className={`
              relative aspect-square rounded-lg transition-all duration-300
              ${card.isMatched ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
              ${isChecking ? 'pointer-events-none' : ''}
            `}
          >
            <div className={`
              absolute inset-0 rounded-lg transition-all duration-500 preserve-3d
              ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
            `}>
              {/* Card Back */}
              <div className={`
                absolute inset-0 rounded-lg backface-hidden
                bg-gradient-to-br from-cyan-500/20 to-blue-500/20
                border-2 border-cyan-500/30
                flex items-center justify-center
                ${card.isFlipped || card.isMatched ? 'invisible' : ''}
              `}>
                <div className="relative w-full h-full p-4">
                  <div className="absolute inset-0 rounded-lg bg-gray-900/50 backdrop-blur-sm" />
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 animate-pulse flex items-center justify-center">
                      <Gamepad2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  {/* Circuit pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-px h-1/2 bg-cyan-400" />
                    <div className="absolute top-1/2 left-1/4 w-1/2 h-px bg-cyan-400" />
                    <div className="absolute top-1/4 right-1/4 w-px h-1/2 bg-blue-400" />
                    <div className="absolute bottom-1/2 right-1/4 w-1/2 h-px bg-blue-400" />
                  </div>
                </div>
              </div>

              {/* Card Front */}
              <Card className={`
                absolute inset-0 rounded-lg backface-hidden rotate-y-180
                bg-gradient-to-br from-gray-800 to-gray-900
                border-2 ${card.isMatched ? 'border-green-500/50' : 'border-cyan-500/50'}
                flex items-center justify-center p-3
                ${card.isFlipped || card.isMatched ? '' : 'invisible'}
              `}>
                <div className="relative w-full h-full flex flex-col items-center justify-center gap-2">
                  <div className={`
                    relative w-full aspect-square rounded-lg overflow-hidden
                    ${card.isMatched ? 'ring-2 ring-green-400 animate-pulse' : ''}
                  `}>
                    <img
                      src={card.avatarUrl}
                      alt={card.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-xs font-bold text-cyan-400 text-center line-clamp-1">
                    {card.name}
                  </span>
                </div>
              </Card>
            </div>
          </button>
        ))}
      </div>

      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}

