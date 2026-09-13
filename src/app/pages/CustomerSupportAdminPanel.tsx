import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  User,
  Search,
  Filter,
  Send,
  Phone,
  Mail,
  Star,
  ThumbsUp,
  ThumbsDown,
  Archive,
  Flag,
  MoreVertical,
  Zap,
  TrendingUp,
  Users,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  messages: number;
}

export default function CustomerSupportAdminPanel() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [responseText, setResponseText] = useState('');
  const [archivedTickets, setArchivedTickets] = useState<Set<string>>(new Set());

  const mockTickets: Ticket[] = [
    {
      id: 'TKT-001',
      userId: 'usr_001',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      subject: 'Payment stuck in escrow',
      description: 'My payment has been in escrow for 10 days, but I confirmed delivery 3 days ago.',
      status: 'open',
      priority: 'high',
      category: 'Payment',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      messages: 3,
    },
    {
      id: 'TKT-002',
      userId: 'usr_002',
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      subject: 'Product not as described',
      description: 'Received a different color than what was shown in the images.',
      status: 'in_progress',
      priority: 'medium',
      category: 'Dispute',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      assignedTo: 'Support Agent 1',
      messages: 7,
    },
    {
      id: 'TKT-003',
      userId: 'usr_003',
      userName: 'Bob Wilson',
      userEmail: 'bob@example.com',
      subject: 'How to withdraw funds?',
      description: 'I want to withdraw my seller earnings but cannot find the option.',
      status: 'open',
      priority: 'low',
      category: 'General Inquiry',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      messages: 1,
    },
    {
      id: 'TKT-004',
      userId: 'usr_004',
      userName: 'Alice Johnson',
      userEmail: 'alice@example.com',
      subject: 'Refund not received',
      description: 'Refund was approved 5 days ago but I still haven\'t received the money.',
      status: 'open',
      priority: 'urgent',
      category: 'Refund',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      messages: 5,
    },
    {
      id: 'TKT-005',
      userId: 'usr_005',
      userName: 'Charlie Brown',
      userEmail: 'charlie@example.com',
      subject: 'Account verification issue',
      description: 'Cannot complete KYC verification, documents keep getting rejected.',
      status: 'in_progress',
      priority: 'high',
      category: 'Account',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      assignedTo: 'Support Agent 2',
      messages: 12,
    },
  ];

  const stats = {
    totalTickets: 247,
    openTickets: 45,
    inProgress: 12,
    resolvedToday: 28,
    avgResponseTime: '2.5h',
    satisfaction: 4.7,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-error/10 text-error';
      case 'high': return 'bg-warning/10 text-warning';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'low': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-info/10 text-info';
      case 'in_progress': return 'bg-primary/10 text-primary';
      case 'resolved': return 'bg-success/10 text-success';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredTickets = mockTickets.filter(ticket => {
    if (filterStatus !== 'all' && ticket.status !== filterStatus) return false;
    if (filterPriority !== 'all' && ticket.priority !== filterPriority) return false;
    if (searchQuery && !ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !ticket.userName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky lg:!top-16 z-10" style={{ top: 'calc(5.5rem + env(safe-area-inset-top, 0px))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-info" />
              <div>
                <h1 className="text-2xl font-bold text-foreground dark:text-white">
                  Customer Support Admin
                </h1>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  Manage support tickets and customer inquiries
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                New Ticket
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-info" />
              <div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.totalTickets}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">Open</p>
                <p className="text-2xl font-bold">{stats.openTickets}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{stats.resolvedToday}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">Avg Time</p>
                <p className="text-2xl font-bold">{stats.avgResponseTime}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold">{stats.satisfaction}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <div className="space-y-4">
                {/* Search and Filters */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ticket List */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 border rounded-2xl cursor-pointer transition-colors ${
                        selectedTicket?.id === ticket.id
                          ? 'bg-info/5 border-info'
                          : 'bg-card border-border hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                            {ticket.userName} • {ticket.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(ticket.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <Card className="p-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
                          {selectedTicket.priority}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(selectedTicket.status)}>
                          {selectedTicket.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">{selectedTicket.category}</Badge>
                      </div>
                      <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                        Ticket #{selectedTicket.id} • Created {new Date(selectedTicket.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-muted rounded-2xl p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedTicket.userName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">User ID</p>
                        <p className="font-medium">{selectedTicket.userId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedTicket.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">Total Messages</p>
                        <p className="font-medium">{selectedTicket.messages}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <User className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold mb-2">Issue Description</h3>
                    <p className="text-foreground dark:text-muted-foreground leading-relaxed">
                      {selectedTicket.description}
                    </p>
                  </div>

                  {/* Response Section */}
                  <div>
                    <h3 className="font-semibold mb-3">Response</h3>
                    <Textarea
                      placeholder="Type your response here..."
                      rows={6}
                      className="mb-3"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Select>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Change Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Assign To" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="agent1">Agent 1</SelectItem>
                            <SelectItem value="agent2">Agent 2</SelectItem>
                            <SelectItem value="agent3">Agent 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { setArchivedTickets(prev => new Set([...prev, selectedTicket.id])); toast.success(`Ticket ${selectedTicket.id} archived`); setSelectedTicket(null); }}>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </Button>
                        <Button disabled={!responseText.trim()} onClick={() => { toast.success(`Response sent for ticket ${selectedTicket.id}`); setResponseText(''); }}>
                          <Send className="w-4 h-4 mr-2" />
                          Send Response
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Quick Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">Issue Refund</Button>
                      <Button variant="outline" size="sm">Release Escrow</Button>
                      <Button variant="outline" size="sm">View Order</Button>
                      <Button variant="outline" size="sm">Escalate</Button>
                      <Button variant="outline" size="sm">Request Info</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground dark:text-muted-foreground">
                  Select a ticket to view details
                </h3>
                <p className="text-muted-foreground mt-2">
                  Choose a ticket from the list to view and respond
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
