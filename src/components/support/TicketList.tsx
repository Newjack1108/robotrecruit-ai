'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertCircle, CheckCircle, Clock, ChevronDown, ChevronUp, 
  Send, Loader2, User, Shield 
} from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  _count: {
    responses: number;
  };
}

interface TicketResponse {
  id: string;
  content: string;
  isStaff: boolean;
  authorEmail: string;
  createdAt: string;
}

export function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [ticketDetails, setTicketDetails] = useState<Record<string, TicketResponse[]>>({});
  const [newResponse, setNewResponse] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetails = async (ticketId: string) => {
    if (ticketDetails[ticketId]) return; // Already loaded

    try {
      const response = await fetch(`/api/tickets/${ticketId}`);
      if (response.ok) {
        const data = await response.json();
        setTicketDetails((prev) => ({ ...prev, [ticketId]: data.responses }));
      }
    } catch (error) {
      console.error('Failed to load ticket details:', error);
    }
  };

  const toggleTicket = (ticketId: string) => {
    if (expandedTicket === ticketId) {
      setExpandedTicket(null);
    } else {
      setExpandedTicket(ticketId);
      loadTicketDetails(ticketId);
    }
  };

  const sendResponse = async (ticketId: string) => {
    if (!newResponse.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newResponse }),
      });

      if (response.ok) {
        setNewResponse('');
        await loadTicketDetails(ticketId);
        await loadTickets();
      } else {
        alert('Failed to send response');
      }
    } catch (error) {
      console.error('Failed to send response:', error);
      alert('Failed to send response');
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      open: { color: 'bg-red-600/20 text-red-400 border-red-500/50', icon: AlertCircle },
      'in-progress': { color: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/50', icon: Clock },
      resolved: { color: 'bg-green-600/20 text-green-400 border-green-500/50', icon: CheckCircle },
      closed: { color: 'bg-gray-600/20 text-gray-400 border-gray-500/50', icon: CheckCircle },
    };
    return badges[status as keyof typeof badges] || badges.open;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-400',
      medium: 'text-blue-400',
      high: 'text-orange-400',
      urgent: 'text-red-400',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border border-gray-700/30">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading your tickets...</p>
        </CardContent>
      </Card>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border border-gray-700/30">
        <CardContent className="p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-orbitron font-bold text-white mb-2">No Tickets Yet</h3>
          <p className="text-gray-400">
            You haven't submitted any support tickets. Need help? Create one on the left!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => {
        const statusBadge = getStatusBadge(ticket.status);
        const StatusIcon = statusBadge.icon;
        const isExpanded = expandedTicket === ticket.id;
        const responses = ticketDetails[ticket.id] || [];

        return (
          <Card
            key={ticket.id}
            className="bg-white/5 backdrop-blur-sm border border-gray-700/30 hover:border-cyan-500/50 transition-all"
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Ticket Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <StatusIcon className={`w-5 h-5 flex-shrink-0 mt-1 ${getPriorityColor(ticket.priority)}`} />
                    <div className="flex-1">
                      <h3 className="text-lg font-orbitron font-bold text-white mb-2">
                        {ticket.subject}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={`${statusBadge.color} border font-semibold text-xs`}>
                          {ticket.status}
                        </Badge>
                        <Badge variant="outline" className="text-gray-400 border-gray-600 text-xs">
                          {ticket.category}
                        </Badge>
                        <Badge variant="outline" className={`${getPriorityColor(ticket.priority)} border-gray-600 text-xs`}>
                          {ticket.priority}
                        </Badge>
                        {ticket._count.responses > 0 && (
                          <Badge className="bg-cyan-600/20 text-cyan-400 border-cyan-500/50 border text-xs">
                            {ticket._count.responses} response{ticket._count.responses !== 1 && 's'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => toggleTicket(ticket.id)}
                    variant="ghost"
                    size="sm"
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Close
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        View
                      </>
                    )}
                  </Button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-700 pt-4 space-y-4">
                    {/* Full Description */}
                    <div className="bg-gray-950/50 rounded-lg p-4">
                      <p className="text-gray-300 whitespace-pre-wrap">{ticket.description}</p>
                    </div>

                    {/* Responses */}
                    {responses.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-orbitron font-bold text-white">Responses</h4>
                        {responses.map((response) => (
                          <div
                            key={response.id}
                            className={`p-4 rounded-lg ${
                              response.isStaff
                                ? 'bg-cyan-600/20 border border-cyan-500/30'
                                : 'bg-gray-800/50 border border-gray-700'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {response.isStaff ? (
                                <Shield className="w-5 h-5 text-cyan-400" />
                              ) : (
                                <User className="w-5 h-5 text-gray-400" />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`font-semibold text-sm ${response.isStaff ? 'text-cyan-400' : 'text-gray-300'}`}>
                                    {response.isStaff ? 'Support Team' : 'You'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(response.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                  {response.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Response (only if not closed) */}
                    {ticket.status !== 'closed' && (
                      <div className="space-y-3">
                        <h4 className="font-orbitron font-bold text-white">Add a Reply</h4>
                        <Textarea
                          value={newResponse}
                          onChange={(e) => setNewResponse(e.target.value)}
                          placeholder="Type your reply here..."
                          className="min-h-[100px] bg-gray-900 border-gray-700 text-white"
                          disabled={isSending}
                        />
                        <Button
                          onClick={() => sendResponse(ticket.id)}
                          disabled={isSending || !newResponse.trim()}
                          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold"
                        >
                          {isSending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Reply
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}



