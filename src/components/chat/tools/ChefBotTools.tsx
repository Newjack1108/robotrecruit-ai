'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Timer, Play, Pause, RotateCcw, Plus, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ChefBotToolsProps {
  conversationId: string;
  onDataChange: (toolType: string, data: any) => void;
  initialData?: {
    timers?: Array<{ id: string; duration: number; remaining: number; isRunning: boolean; label: string }>;
    ingredients?: string[];
    recipe?: string;
  };
}

export function ChefBotTools({ conversationId, onDataChange, initialData }: ChefBotToolsProps) {
  const [timers, setTimers] = useState(initialData?.timers || [
    { id: '1', duration: 0, remaining: 0, isRunning: false, label: 'Timer 1' },
    { id: '2', duration: 0, remaining: 0, isRunning: false, label: 'Timer 2' },
  ]);
  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients || []);
  const [newIngredient, setNewIngredient] = useState('');
  const [recipe, setRecipe] = useState(initialData?.recipe || '');
  const [timerInputs, setTimerInputs] = useState<Record<string, string>>({ '1': '', '2': '' });

  // Timer countdown logic
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    
    timers.forEach((timer, index) => {
      if (timer.isRunning && timer.remaining > 0) {
        const interval = setInterval(() => {
          setTimers(prev => {
            const updated = [...prev];
            if (updated[index].remaining > 0) {
              updated[index].remaining -= 1;
              if (updated[index].remaining === 0) {
                updated[index].isRunning = false;
                // Play notification sound
                if (typeof window !== 'undefined' && 'Notification' in window) {
                  if (Notification.permission === 'granted') {
                    new Notification('Chef Bot Timer', {
                      body: `${timer.label} is complete!`,
                      icon: '/bots/chef-bot-avatar.png',
                    });
                  }
                }
              }
              onDataChange('timers', updated);
              return updated;
            }
            return prev;
          });
        }, 1000);
        intervals.push(interval);
      }
    });

    return () => intervals.forEach(clearInterval);
  }, [timers, onDataChange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (timerId: string) => {
    const input = timerInputs[timerId];
    console.log('Starting timer:', timerId, 'input:', input);
    
    if (!input || input.trim() === '') {
      alert('Please enter the number of minutes');
      return;
    }
    
    const minutes = parseInt(input);
    console.log('Parsed minutes:', minutes);
    
    if (isNaN(minutes) || minutes <= 0) {
      alert('Please enter a valid number of minutes (1 or more)');
      return;
    }
    
    const seconds = minutes * 60;
    console.log('Setting timer for', seconds, 'seconds');
    
    setTimers(prev => {
      const updated = prev.map(t => 
        t.id === timerId 
          ? { ...t, duration: seconds, remaining: seconds, isRunning: true }
          : t
      );
      console.log('Updated timers:', updated);
      onDataChange('timers', updated);
      return updated;
    });
    setTimerInputs(prev => ({ ...prev, [timerId]: '' }));
  };

  const toggleTimer = (timerId: string) => {
    setTimers(prev => {
      const updated = prev.map(t => 
        t.id === timerId ? { ...t, isRunning: !t.isRunning } : t
      );
      onDataChange('timers', updated);
      return updated;
    });
  };

  const resetTimer = (timerId: string) => {
    setTimers(prev => {
      const updated = prev.map(t => 
        t.id === timerId 
          ? { ...t, remaining: t.duration, isRunning: false }
          : t
      );
      onDataChange('timers', updated);
      return updated;
    });
  };

  const addIngredient = () => {
    if (!newIngredient.trim()) return;
    const updated = [...ingredients, newIngredient.trim()];
    setIngredients(updated);
    setNewIngredient('');
    onDataChange('ingredients', updated);
  };

  const removeIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated);
    onDataChange('ingredients', updated);
  };

  const updateRecipe = (value: string) => {
    setRecipe(value);
    onDataChange('recipe', value);
  };

  return (
    <div className="space-y-4">
      {/* Timers */}
      <Card className="p-4 bg-gray-900/50 border-cyan-500/30">
        <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <Timer className="w-5 h-5" />
          Cooking Timers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {timers.map((timer) => (
            <div key={timer.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">{timer.label}</div>
              {timer.duration === 0 ? (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Minutes"
                    value={timerInputs[timer.id] || ''}
                    onChange={(e) => setTimerInputs(prev => ({ ...prev, [timer.id]: e.target.value }))}
                    className="flex-1 bg-gray-900 border-gray-600 text-white text-lg font-semibold"
                    min="1"
                  />
                  <Button onClick={() => startTimer(timer.id)} size="sm" className="bg-cyan-600 hover:bg-cyan-700 font-bold">
                    Start
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-6xl font-black font-mono text-center text-white tracking-wider py-4 bg-gray-900/80 rounded-xl border-2 border-cyan-500/30">
                    {formatTime(timer.remaining)}
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={() => toggleTimer(timer.id)} 
                      size="sm" 
                      variant="outline"
                      className="bg-gray-700 hover:bg-gray-600"
                    >
                      {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button 
                      onClick={() => resetTimer(timer.id)} 
                      size="sm" 
                      variant="outline"
                      className="bg-gray-700 hover:bg-gray-600"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Ingredients Board */}
      <Card className="p-4 bg-gray-900/50 border-cyan-500/30">
        <h3 className="text-lg font-semibold text-cyan-400 mb-3">Ingredients</h3>
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Add ingredient..."
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
            className="flex-1 bg-gray-900 border-gray-600 text-white"
          />
          <Button onClick={addIngredient} size="sm" className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {ingredients.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No ingredients added yet</p>
          ) : (
            ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-800/50 rounded px-3 py-2 border border-gray-700">
                <span className="text-white">{ingredient}</span>
                <button
                  onClick={() => removeIngredient(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Recipe Board */}
      <Card className="p-4 bg-gray-900/50 border-cyan-500/30">
        <h3 className="text-lg font-semibold text-cyan-400 mb-3">Recipe Notes</h3>
        <textarea
          placeholder="Write your recipe notes, steps, or cooking tips here..."
          value={recipe}
          onChange={(e) => updateRecipe(e.target.value)}
          className="w-full h-48 bg-gray-900 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </Card>
    </div>
  );
}

