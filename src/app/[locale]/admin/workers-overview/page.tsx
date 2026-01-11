'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  User, 
  MapPin, 
  Star, 
  Clock, 
  Eye, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Worker {
  id: string;
  category: string;
  bio: string;
  city: string;
  rating_avg: number;
  rating_count: number;
  completed_jobs_count: number;
  hourly_rate: number;
  years_of_experience: number;
  status: string;
  created_at: string;
  verified_at?: string;
  users: {
    name: string;
    phone: string;
    avatar_url?: string;
  };
  worker_documents: Array<{
    id: string;
    document_type: string;
    file_url: string;
    status: string;
    uploaded_at: string;
  }>;
}

export default function AdminWorkersOverview() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    city: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0,
  });

  useEffect(() => {
    loadWorkers();
  }, [filters, pagination.offset]);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.city && { city: filters.city }),
      });

      const response = await fetch(`/api/admin/workers?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkers(data.workers);
        setPagination(prev => ({ ...prev, total: data.total }));
      }
    } catch (error) {
      console.error('Error loading workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (workerId: string, action: 'approve' | 'reject') => {
    setProcessing(workerId);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/workers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workerId,
          action,
          reason: action === 'reject' ? 'Admin decision' : undefined,
        }),
      });

      if (response.ok) {
        await loadWorkers();
        setSelectedWorker(null);
      }
    } catch (error) {
      console.error('Error updating worker:', error);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'id_front': return 'ID Front';
      case 'id_back': return 'ID Back';
      case 'certificate': return 'Certificate';
      case 'license': return 'License';
      default: return type;
    }
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = !filters.search || 
      worker.users.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      worker.users.phone.includes(filters.search) ||
      worker.bio.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesSearch;
  });

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Workers Overview</h1>
        <p className="text-muted-foreground">
          Manage all workers in the system
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workers..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="ac">AC</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="City..."
              value={filters.city}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{workers.filter(w => w.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{workers.filter(w => w.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{workers.filter(w => w.status === 'rejected').length}</div>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{workers.length}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Workers List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Loading workers...</p>
            </CardContent>
          </Card>
        ) : filteredWorkers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No workers found</p>
            </CardContent>
          </Card>
        ) : (
          filteredWorkers.map((worker) => (
            <Card key={worker.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={worker.users.avatar_url} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{worker.users.name}</CardTitle>
                      <CardDescription>{worker.users.phone} • {worker.city}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(worker.status)}>
                      {worker.status}
                    </Badge>
                    <Badge variant="outline">{worker.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {/* Worker Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span>{worker.rating_avg || 0} ({worker.rating_count || 0})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{worker.years_of_experience} years</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{worker.hourly_rate} TND/hr</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{worker.completed_jobs_count || 0} jobs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Joined {new Date(worker.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{worker.bio}</p>
                  </div>

                  {/* Documents */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      <span>{worker.worker_documents.length} documents</span>
                    </div>
                    {worker.worker_documents.slice(0, 3).map((doc) => (
                      <Badge key={doc.id} variant="outline" className="text-xs">
                        {getDocumentTypeLabel(doc.document_type)}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    {worker.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleApproval(worker.id, 'approve')}
                          disabled={processing === worker.id}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleApproval(worker.id, 'reject')}
                          disabled={processing === worker.id}
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedWorker(worker)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} workers
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
              disabled={pagination.offset === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {Math.floor(pagination.offset / pagination.limit) + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
              disabled={pagination.offset + pagination.limit >= pagination.total}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
