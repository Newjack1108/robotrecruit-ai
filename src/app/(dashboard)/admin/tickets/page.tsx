import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TicketDetails } from '@/components/admin/TicketDetails';
import { AlertCircle, CheckCircle, Clock, Flame } from 'lucide-react';

export default async function AdminTicketsPage() {
  const tickets = await prisma.ticket.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          email: true,
          tier: true,
        },
      },
      _count: {
        select: {
          responses: true,
        },
      },
    },
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      open: { color: 'bg-red-600/20 text-red-400 border-red-500/50', icon: AlertCircle },
      'in-progress': { color: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/50', icon: Clock },
      resolved: { color: 'bg-green-600/20 text-green-400 border-green-500/50', icon: CheckCircle },
      closed: { color: 'bg-gray-600/20 text-gray-400 border-gray-500/50', icon: CheckCircle },
    };
    return badges[status as keyof typeof badges] || badges.open;
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: { color: 'bg-gray-600/20 text-gray-400 border-gray-500/50' },
      medium: { color: 'bg-blue-600/20 text-blue-400 border-blue-500/50' },
      high: { color: 'bg-orange-600/20 text-orange-400 border-orange-500/50' },
      urgent: { color: 'bg-red-600/20 text-red-400 border-red-500/50' },
    };
    return badges[priority as keyof typeof badges] || badges.medium;
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in-progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-orbitron font-bold text-white mb-2">Support Tickets</h2>
        <p className="text-gray-400">Manage customer support requests and issues</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-white/5 backdrop-blur-sm border border-gray-700/30">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">Total Tickets</p>
              <p className="text-4xl font-bold text-white">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border border-red-700/30">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">Open</p>
              <p className="text-4xl font-bold text-red-400">{stats.open}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border border-yellow-700/30">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">In Progress</p>
              <p className="text-4xl font-bold text-yellow-400">{stats.inProgress}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border border-green-700/30">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">Resolved</p>
              <p className="text-4xl font-bold text-green-400">{stats.resolved}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 gap-6">
        {tickets.map((ticket) => {
          const statusBadge = getStatusBadge(ticket.status);
          const priorityBadge = getPriorityBadge(ticket.priority);
          const StatusIcon = statusBadge.icon;

          return (
            <Card
              key={ticket.id}
              className="bg-white/5 backdrop-blur-sm border border-gray-700/30 hover:border-cyan-500/50 transition-all"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <StatusIcon className={`w-6 h-6 flex-shrink-0 mt-1 ${statusBadge.color.includes('red') ? 'text-red-400' : statusBadge.color.includes('yellow') ? 'text-yellow-400' : 'text-green-400'}`} />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-xl font-orbitron font-bold text-white">
                            {ticket.subject}
                          </h3>
                          <div className="flex gap-2">
                            <Badge className={`${statusBadge.color} border font-semibold`}>
                              {ticket.status}
                            </Badge>
                            <Badge className={`${priorityBadge.color} border font-semibold`}>
                              {ticket.priority}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-gray-400 mb-3 line-clamp-2">{ticket.description}</p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-400">From:</span>
                            <span className="text-cyan-400">{ticket.user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-400">Category:</span>
                            <Badge variant="outline" className="text-gray-400 border-gray-600">
                              {ticket.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-400">Responses:</span>
                            <span className="text-white">{ticket._count.responses}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <TicketDetails ticketId={ticket.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {tickets.length === 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border border-gray-700/30">
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-orbitron font-bold text-white mb-2">All Clear!</h3>
              <p className="text-gray-400">No support tickets yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}



