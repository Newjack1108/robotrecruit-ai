'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Send, Loader2, User, Shield } from 'lucide-react';

interface TicketResponse {
  id: string;
  content: string;
  isStaff: boolean;
  authorEmail: string;
  createdAt: string;
}

export function TicketDetails({ ticketId }: { ticketId: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (isExpanded && responses.length === 0) {
      loadResponses();
    }
  }, [isExpanded]);

  const loadResponses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`);
      if (response.ok) {
        const data = await response.json();
        setResponses(data.responses);
      }
    } catch (error) {
      console.error('Failed to load responses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendResponse = async () => {
    if (!newResponse.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newResponse,
          newStatus: newStatus || undefined,
        }),
      });

      if (response.ok) {
        setNewResponse('');
        setNewStatus('');
        await loadResponses();
        window.location.reload(); // Refresh to update ticket status
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

  return (
    <div className="border-t border-gray-700 pt-4 mt-4">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="ghost"
        className="text-cyan-400 hover:text-cyan-300 font-orbitron"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4 mr-2" />
            Hide Details
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4 mr-2" />
            View Details & Respond
          </>
        )}
      </Button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Responses */}
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
            </div>
          ) : (
            <>
              {responses.length > 0 && (
                <div className="space-y-3 bg-gray-950/50 rounded-lg p-4">
                  <h4 className="font-orbitron font-bold text-white mb-3">Conversation History</h4>
                  {responses.map((response) => (
                    <div
                      key={response.id}
                      className={`p-4 rounded-lg ${
                        response.isStaff
                          ? 'bg-cyan-600/20 border border-cyan-500/30'
                          : 'bg-gray-800/50 border border-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        {response.isStaff ? (
                          <Shield className="w-5 h-5 text-cyan-400" />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-semibold ${response.isStaff ? 'text-cyan-400' : 'text-gray-300'}`}>
                              {response.authorEmail}
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

              {/* Response Form */}
              <div className="bg-gray-950/50 rounded-lg p-4 space-y-4">
                <h4 className="font-orbitron font-bold text-white">Respond to Ticket</h4>
                
                <Textarea
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  placeholder="Type your response here..."
                  className="min-h-[120px] bg-gray-900 border-gray-700 text-white"
                  disabled={isSending}
                />

                <div className="flex items-center gap-4">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-cyan-500 focus:outline-none"
                    disabled={isSending}
                  >
                    <option value="">Keep current status</option>
                    <option value="in-progress">Mark as In Progress</option>
                    <option value="resolved">Mark as Resolved</option>
                    <option value="closed">Close Ticket</option>
                  </select>

                  <Button
                    onClick={sendResponse}
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
                        Send Response
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}



