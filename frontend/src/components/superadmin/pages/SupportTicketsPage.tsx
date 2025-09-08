import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card, CardContent } from '../../ui/Card';
import { PageHeader } from '../../ui/PageHeader';
import { vendorService, SupportTicket } from '../../../services/vendorService';
import { SupportTicketModal } from '../modals/SupportTicketModal';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';

export function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  useEffect(() => {
    fetchTickets();
  }, [currentPage, searchTerm, statusFilter, priorityFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await vendorService.getSupportTickets({
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined
      });
      setTickets(response.data);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch support tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this support ticket?')) return;
    
    try {
      await vendorService.deleteSupportTicket(ticketId);
      await fetchTickets();
      toast.success('Support ticket deleted successfully');
    } catch (error) {
      toast.error('Failed to delete support ticket');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const statusClasses = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  const priorityClasses = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <PageHeader title="Support Tickets" subtitle={`Manage all ${total} support tickets.`}>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <Button onClick={() => {
            setSelectedTicket(null);
            setShowTicketModal(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Ticket</th>
                  <th className="px-6 py-3">Vendor</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                    </tr>
                  ))
                ) : tickets.length > 0 ? (
                  tickets.map((ticket: SupportTicket) => (
                    <tr key={ticket.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 text-gray-400 mr-3" />
                          <div>
                            <div className="font-medium">{ticket.subject}</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {ticket.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">{ticket.vendor?.name || ticket.vendorName}</div>
                          <div className="text-xs text-gray-500">{ticket.vendor?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('px-2 py-1 text-xs font-semibold rounded-full capitalize', 
                          priorityClasses[ticket.priority.toLowerCase() as keyof typeof priorityClasses] || priorityClasses.medium)}>
                          {ticket.priority.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('px-2 py-1 text-xs font-semibold rounded-full capitalize', 
                          statusClasses[ticket.status.toLowerCase().replace('_', '_') as keyof typeof statusClasses] || statusClasses.open)}>
                          {ticket.status.toLowerCase().replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowTicketModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(ticket.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No support tickets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <SupportTicketModal
        isOpen={showTicketModal}
        onClose={() => {
          setShowTicketModal(false);
          setSelectedTicket(null);
        }}
        onSuccess={fetchTickets}
        ticket={selectedTicket}
      />
    </div>
  );
}
