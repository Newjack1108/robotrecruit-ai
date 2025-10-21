'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  reminderTime: string;
  isCompleted: boolean;
}

interface RemindersPanelProps {
  isActive: boolean;
}

export function RemindersPanel({ isActive }: RemindersPanelProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isActive) {
      loadReminders();
    }
  }, [isActive]);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reminders');
      if (response.ok) {
        const data = await response.json();
        setReminders(data);
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (reminderId: string, isCompleted: boolean) => {
    try {
      const response = await fetch('/api/reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderId, isCompleted: !isCompleted }),
      });

      if (response.ok) {
        loadReminders();
      }
    } catch (error) {
      console.error('Failed to update reminder:', error);
    }
  };

  const deleteReminder = async (reminderId: string) => {
    if (!confirm('Delete this reminder?')) return;

    try {
      const response = await fetch('/api/reminders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderId }),
      });

      if (response.ok) {
        loadReminders();
      }
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  if (!isActive) return null;

  const upcomingReminders = reminders.filter(r => !r.isCompleted && new Date(r.reminderTime) > new Date());
  const pastReminders = reminders.filter(r => !r.isCompleted && new Date(r.reminderTime) <= new Date());
  const completedReminders = reminders.filter(r => r.isCompleted);

  return (
    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-orbitron font-bold text-orange-300 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          ACTIVE REMINDERS
        </h3>
        <Badge className="bg-orange-600/20 text-orange-300 border border-orange-500/50 text-xs">
          {upcomingReminders.length} pending
        </Badge>
      </div>

      {loading ? (
        <p className="text-xs text-gray-400 text-center py-2">Loading reminders...</p>
      ) : reminders.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-2">
          No reminders yet. Ask the bot to set one!
        </p>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {upcomingReminders.map((reminder) => (
            <ReminderItem
              key={reminder.id}
              reminder={reminder}
              onToggleComplete={toggleComplete}
              onDelete={deleteReminder}
            />
          ))}
          {pastReminders.map((reminder) => (
            <ReminderItem
              key={reminder.id}
              reminder={reminder}
              onToggleComplete={toggleComplete}
              onDelete={deleteReminder}
              isPast
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReminderItem({
  reminder,
  onToggleComplete,
  onDelete,
  isPast = false,
}: {
  reminder: Reminder;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
  isPast?: boolean;
}) {
  const reminderDate = new Date(reminder.reminderTime);
  const now = new Date();
  const isToday = reminderDate.toDateString() === now.toDateString();
  
  return (
    <div className={cn(
      'flex items-center gap-2 bg-gray-800/50 rounded-lg p-2 border',
      isPast ? 'border-red-500/30' : 'border-orange-500/30'
    )}>
      <Button
        onClick={() => onToggleComplete(reminder.id, reminder.isCompleted)}
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0 hover:bg-green-500/20"
      >
        <Check className={cn(
          'w-4 h-4',
          reminder.isCompleted ? 'text-green-400' : 'text-gray-500'
        )} />
      </Button>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-xs font-medium truncate',
          reminder.isCompleted ? 'line-through text-gray-500' : isPast ? 'text-red-400' : 'text-white'
        )}>
          {reminder.title}
        </p>
        <p className="text-xs text-gray-500">
          {isToday ? reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    : reminderDate.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <Button
        onClick={() => onDelete(reminder.id)}
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0 hover:bg-red-500/20 text-red-400"
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}

