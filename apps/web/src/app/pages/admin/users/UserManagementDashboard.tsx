import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Search, UserCheck, UserX, Shield, AlertTriangle, Eye, Ban, CheckCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Skeleton } from '../../../components/ui/skeleton';

// Skeleton Component
function UserManagementSkeleton() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-9 w-96 mb-2" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: 'buyer' | 'seller' | 'creator' | 'admin';
  status: 'active' | 'suspended' | 'banned' | 'pending';
  verified: boolean;
  joinedDate: string;
  totalOrders: number;
  totalSpent: number;
  flagCount: number;
}

export default function UserManagementDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  // ... existing code ...

  // Simulate progressive data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionDialog, setActionDialog] = useState<{open: boolean, action: string, userId: string}>({
    open: false,
    action: '',
    userId: ''
  });
  const [actionReason, setActionReason] = useState('');

  // Show skeleton while loading
  if (isLoading) {
    return <UserManagementSkeleton />;
  }

  // Mock user data
  const users: User[] = [
    {
      id: 'user1',
      name: 'Sarah Chen',
      username: 'sarahchen',
      email: 'sarah@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      role: 'seller',
      status: 'active',
      verified: true,
      joinedDate: 'Jan 15, 2026',
      totalOrders: 234,
      totalSpent: 12450.00,
      flagCount: 0
    },
    {
      id: 'user2',
      name: 'John Smith',
      username: 'johnsmith',
      email: 'john@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      role: 'buyer',
      status: 'active',
      verified: true,
      joinedDate: 'Jan 10, 2026',
      totalOrders: 45,
      totalSpent: 3200.00,
      flagCount: 0
    },
    {
      id: 'user3',
      name: 'Mike Johnson',
      username: 'mikej',
      email: 'mike@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      role: 'seller',
      status: 'suspended',
      verified: true,
      joinedDate: 'Dec 20, 2025',
      totalOrders: 89,
      totalSpent: 5600.00,
      flagCount: 3
    },
    {
      id: 'user4',
      name: 'Emma Wilson',
      username: 'emmaw',
      email: 'emma@example.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      role: 'creator',
      status: 'active',
      verified: true,
      joinedDate: 'Jan 5, 2026',
      totalOrders: 156,
      totalSpent: 8900.00,
      flagCount: 0
    },
    {
      id: 'user5',
      name: 'Alex Rodriguez',
      username: 'alexr',
      email: 'alex@example.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      role: 'buyer',
      status: 'pending',
      verified: false,
      joinedDate: 'Jan 22, 2026',
      totalOrders: 2,
      totalSpent: 150.00,
      flagCount: 1
    }
  ];

  const stats = {
    totalUsers: 45678,
    activeUsers: 42345,
    suspendedUsers: 234,
    bannedUsers: 89,
    pendingVerification: 1010
  };

  const getRoleBadge = (role: string) => {
    const config: {[key: string]: string} = {
      'buyer': 'bg-info/10 text-info',
      'seller': 'bg-primary/10 text-primary',
      'creator': 'bg-like/10 text-like',
      'admin': 'bg-error/10 text-error'
    };
    return <Badge className={config[role]}>{role}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config: {[key: string]: {label: string, color: string, icon: React.ReactNode}} = {
      'active': { label: 'Active', color: 'bg-success/10 text-success', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
      'suspended': { label: 'Suspended', color: 'bg-warning/10 text-warning', icon: <Clock className="w-3 h-3 mr-1" /> },
      'banned': { label: 'Banned', color: 'bg-error/10 text-error', icon: <Ban className="w-3 h-3 mr-1" /> },
      'pending': { label: 'Pending', color: 'bg-muted text-foreground', icon: <Clock className="w-3 h-3 mr-1" /> }
    };
    const item = config[status];
    return <Badge className={`${item.color} flex items-center w-fit`}>{item.icon}{item.label}</Badge>;
  };

  const handleAction = (action: string, userId: string) => {
    setActionDialog({ open: true, action, userId });
    setActionReason('');
  };

  const confirmAction = () => {
    toast.success(`${actionDialog.action} action completed for user ${actionDialog.userId}`);
    setActionDialog({ open: false, action: '', userId: '' });
    setActionReason('');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 pb-8">
      <div className="mb-6">
        <h1 className="text-foreground mb-2">User Management</h1>
        <p className="text-muted-foreground">Manage all platform users, verification, and access control</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <UserCheck className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-success">{stats.activeUsers.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suspended</p>
                <p className="text-2xl font-bold text-warning">{stats.suspendedUsers.toLocaleString()}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Banned</p>
                <p className="text-2xl font-bold text-error">{stats.bannedUsers.toLocaleString()}</p>
              </div>
              <Ban className="w-8 h-8 text-error" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-muted-foreground">{stats.pendingVerification.toLocaleString()}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, username, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="creator">Creator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      {user.verified ? (
                        <Badge className="bg-success/10 text-success">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-muted text-foreground">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-foreground">{user.totalOrders}</TableCell>
                    <TableCell className="text-foreground">₹{user.totalSpent.toLocaleString()}</TableCell>
                    <TableCell>
                      {user.flagCount > 0 ? (
                        <Badge className="bg-error/10 text-error">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {user.flagCount}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{user.joinedDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/users/${user.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        {user.status === 'active' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-warning hover:bg-warning/5"
                              onClick={() => handleAction('Suspend', user.id)}
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-error hover:bg-error/5"
                              onClick={() => handleAction('Ban', user.id)}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {user.status === 'suspended' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-success hover:bg-success/5"
                              onClick={() => handleAction('Activate', user.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-error hover:bg-error/5"
                              onClick={() => handleAction('Ban', user.id)}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {user.status === 'banned' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-success hover:bg-success/5"
                            onClick={() => handleAction('Unban', user.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {!user.verified && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-info hover:bg-info/5"
                            onClick={() => handleAction('Verify', user.id)}
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({...actionDialog, open})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm {actionDialog.action}</DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionDialog.action.toLowerCase()} this user? This action will be logged.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Required)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for this action..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setActionDialog({ open: false, action: '', userId: '' })}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmAction}
              disabled={!actionReason.trim()}
              className={
                actionDialog.action === 'Ban' ? 'bg-error hover:bg-error' :
                actionDialog.action === 'Suspend' ? 'bg-warning hover:bg-warning/90' :
                'bg-success hover:bg-success/90'
              }
            >
              Confirm {actionDialog.action}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}