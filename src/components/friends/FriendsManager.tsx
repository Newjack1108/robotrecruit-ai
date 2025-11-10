'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Users, UserPlus, Mail, TrendingUp, Flame, Trophy, X, Check } from 'lucide-react';

interface Friend {
  friendshipId: string;
  userId: string;
  email: string;
  stats: {
    currentStreak: number;
    longestStreak: number;
    streakPoints: number;
    highScore: number;
  };
  friendedAt: string;
}

interface FriendRequest {
  id: string;
  fromUser: {
    id: string;
    email: string;
    currentStreak: number;
    longestStreak: number;
  };
  createdAt: string;
}

export function FriendsManager() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setIsLoading(true);
      
      // Fetch friends
      const friendsResponse = await fetch('/api/friends');
      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json();
        setFriends(friendsData.friends);
      }

      // Fetch requests
      const requestsResponse = await fetch('/api/friends/requests');
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setReceivedRequests(requestsData.received);
        setSentRequests(requestsData.sent);
      }
    } catch (error) {
      console.error('Failed to fetch friends data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendRequest() {
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Friend request sent!');
        setEmail('');
        fetchData();
      } else {
        alert(`❌ ${data.error || 'Failed to send request'}`);
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert('❌ Failed to send request');
    } finally {
      setIsSending(false);
    }
  }

  async function handleAcceptRequest(requestId: string) {
    try {
      const response = await fetch(`/api/friends/${requestId}`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('✅ Friend request accepted!');
        fetchData();
      } else {
        alert('❌ Failed to accept request');
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('❌ Failed to accept request');
    }
  }

  async function handleRejectRequest(requestId: string) {
    try {
      const response = await fetch(`/api/friends/${requestId}?type=request`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Request rejected');
        fetchData();
      } else {
        alert('❌ Failed to reject request');
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('❌ Failed to reject request');
    }
  }

  async function handleRemoveFriend(friendshipId: string, email: string) {
    if (!confirm(`Remove ${email} from your friends?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/friends/${friendshipId}?type=friend`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Friend removed');
        fetchData();
      } else {
        alert('❌ Failed to remove friend');
      }
    } catch (error) {
      console.error('Failed to remove friend:', error);
      alert('❌ Failed to remove friend');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Friend */}
      <Card className="bg-gray-800/50 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <UserPlus className="w-5 h-5 text-cyan-400" />
            Add Friend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Enter friend's email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
                className="pl-10 bg-gray-900/50 border-gray-700 text-white"
              />
            </div>
            <Button
              onClick={handleSendRequest}
              disabled={isSending || !email.trim()}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Send Request'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {receivedRequests.length > 0 && (
        <Card className="bg-gray-800/50 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Mail className="w-5 h-5 text-yellow-400" />
              Friend Requests ({receivedRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {receivedRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                >
                  <div>
                    <p className="text-white font-semibold">{request.fromUser.email}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {request.fromUser.currentStreak} day streak
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Best: {request.fromUser.longestStreak}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptRequest(request.id)}
                      className="bg-green-600 hover:bg-green-500"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectRequest(request.id)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card className="bg-gray-800/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5 text-purple-400" />
            My Friends ({friends.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No friends yet. Add some friends to compare stats!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {friends.map((friend) => (
                <div
                  key={friend.friendshipId}
                  className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold">{friend.email}</p>
                      <p className="text-xs text-gray-500">
                        Friends since {new Date(friend.friendedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveFriend(friend.friendshipId, friend.email)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-orange-500/10 rounded-lg p-2 border border-orange-500/30">
                      <div className="flex items-center gap-1 mb-1">
                        <Flame className="w-3 h-3 text-orange-400" />
                        <span className="text-xs text-gray-400">Streak</span>
                      </div>
                      <p className="text-lg font-bold text-white">{friend.stats.currentStreak}</p>
                    </div>

                    <div className="bg-blue-500/10 rounded-lg p-2 border border-blue-500/30">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-gray-400">Best</span>
                      </div>
                      <p className="text-lg font-bold text-white">{friend.stats.longestStreak}</p>
                    </div>

                    <div className="bg-yellow-500/10 rounded-lg p-2 border border-yellow-500/30">
                      <div className="flex items-center gap-1 mb-1">
                        <Trophy className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-gray-400">Points</span>
                      </div>
                      <p className="text-lg font-bold text-white">{friend.stats.streakPoints}</p>
                    </div>

                    <div className="bg-purple-500/10 rounded-lg p-2 border border-purple-500/30">
                      <div className="flex items-center gap-1 mb-1">
                        <Trophy className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-gray-400">High Score</span>
                      </div>
                      <p className="text-lg font-bold text-white">{friend.stats.highScore}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Mail className="w-5 h-5 text-gray-400" />
              Sent Requests ({sentRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                >
                  <span className="text-white text-sm">{request.toUser.email}</span>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                    Pending
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

