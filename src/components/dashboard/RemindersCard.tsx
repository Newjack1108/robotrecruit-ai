'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Trash2, Clock, ChevronDown, ChevronUp, MessageSquare, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface Bot {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string | null;
}

interface Reminder {
  id: string;
  title: string;
  description?: string | null;
  reminderTime: string;
  isCompleted: boolean;
  conversationId?: string | null;
  bot: Bot;
}

export function RemindersCard() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    upcoming: true,
    pastDue: true,
    completed: false,
  });

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reminders?includeCompleted=true');
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

  const now = new Date();
  const upcomingReminders = reminders.filter(
    r => !r.isCompleted && new Date(r.reminderTime) > now
  );
  const pastDueReminders = reminders.filter(
    r => !r.isCompleted && new Date(r.reminderTime) <= now
  );
  const completedReminders = reminders.filter(r => r.isCompleted);

  const totalPending = upcomingReminders.length + pastDueReminders.length;

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-orange-900/30 to-amber-900/30 border-orange-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-400" />
            Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm text-center py-4">Loading reminders...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-900/30 to-amber-900/30 border-orange-500/30 h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-400" />
            Reminders
          </CardTitle>
          <div className="flex items-center gap-2">
            {totalPending > 0 && (
              <Badge className="bg-orange-600/20 text-orange-300 border border-orange-500/50">
                {totalPending} pending
              </Badge>
            )}
            <Button
              onClick={loadReminders}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-y-auto">
        {reminders.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No reminders yet</p>
            <p className="text-gray-500 text-xs mt-1">Ask any bot to set a reminder for you!</p>
          </div>
        ) : (
          <>
            {/* Upcoming Reminders */}
            {upcomingReminders.length > 0 && (
              <div>
                <button
                  onClick={() => setExpandedSections(prev => ({ ...prev, upcoming: !prev.upcoming }))}
                  className="w-full flex items-center justify-between mb-2"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-semibold text-orange-300">
                      Upcoming ({upcomingReminders.length})
                    </span>
                  </div>
                  {expandedSections.upcoming ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {expandedSections.upcoming && (
                  <div className="space-y-2">
                    {upcomingReminders.map((reminder) => (
                      <ReminderItem
                        key={reminder.id}
                        reminder={reminder}
                        onToggleComplete={toggleComplete}
                        onDelete={deleteReminder}
                        variant="upcoming"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Past Due Reminders */}
            {pastDueReminders.length > 0 && (
              <div>
                <button
                  onClick={() => setExpandedSections(prev => ({ ...prev, pastDue: !prev.pastDue }))}
                  className="w-full flex items-center justify-between mb-2"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-semibold text-red-300">
                      Past Due ({pastDueReminders.length})
                    </span>
                  </div>
                  {expandedSections.pastDue ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {expandedSections.pastDue && (
                  <div className="space-y-2">
                    {pastDueReminders.map((reminder) => (
                      <ReminderItem
                        key={reminder.id}
                        reminder={reminder}
                        onToggleComplete={toggleComplete}
                        onDelete={deleteReminder}
                        variant="pastDue"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Completed Reminders */}
            {completedReminders.length > 0 && (
              <div>
                <button
                  onClick={() => setExpandedSections(prev => ({ ...prev, completed: !prev.completed }))}
                  className="w-full flex items-center justify-between mb-2"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-400">
                      Completed ({completedReminders.length})
                    </span>
                  </div>
                  {expandedSections.completed ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {expandedSections.completed && (
                  <div className="space-y-2">
                    {completedReminders.map((reminder) => (
                      <ReminderItem
                        key={reminder.id}
                        reminder={reminder}
                        onToggleComplete={toggleComplete}
                        onDelete={deleteReminder}
                        variant="completed"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ReminderItem({
  reminder,
  onToggleComplete,
  onDelete,
  variant,
}: {
  reminder: Reminder;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
  variant: 'upcoming' | 'pastDue' | 'completed';
}) {
  const reminderDate = new Date(reminder.reminderTime);
  const now = new Date();
  const isToday = reminderDate.toDateString() === now.toDateString();
  const isTomorrow = reminderDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

  const formatDate = () => {
    if (isToday) {
      return `Today at ${reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return reminderDate.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const borderColor = {
    upcoming: 'border-orange-500/30',
    pastDue: 'border-red-500/30',
    completed: 'border-gray-600/30',
  }[variant];

  const textColor = {
    upcoming: 'text-white',
    pastDue: 'text-red-300',
    completed: 'text-gray-500 line-through',
  }[variant];

  return (
    <div className={cn('bg-gray-800/50 rounded-lg p-3 border', borderColor)}>
      <div className="flex items-start gap-3">
        {/* Bot Avatar */}
        <div className="flex-shrink-0">
          {reminder.bot.avatarUrl ? (
            <Image
              src={reminder.bot.avatarUrl}
              alt={reminder.bot.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <Bell className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>

        {/* Reminder Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium truncate', textColor)}>
                {reminder.title}
              </p>
              {reminder.description && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {reminder.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500">{formatDate()}</p>
                <span className="text-gray-600">•</span>
                <p className="text-xs text-gray-500">{reminder.bot.name}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                onClick={() => onToggleComplete(reminder.id, reminder.isCompleted)}
                variant="ghost"
                size="icon"
                className="h-7 w-7 p-0 hover:bg-green-500/20"
                title={reminder.isCompleted ? 'Mark as incomplete' : 'Mark as done'}
              >
                <Check
                  className={cn(
                    'w-4 h-4',
                    reminder.isCompleted ? 'text-green-400' : 'text-gray-500'
                  )}
                />
              </Button>
              <Button
                onClick={() => onDelete(reminder.id)}
                variant="ghost"
                size="icon"
                className="h-7 w-7 p-0 hover:bg-red-500/20 text-red-400"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Conversation Link */}
          {reminder.conversationId && (
            <Link
              href={`/chat?conversationId=${reminder.conversationId}`}
              className="mt-2 inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              View conversation
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

