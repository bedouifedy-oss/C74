'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, XCircle, FileText, User, MapPin, Star, Clock, Eye, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export default function AdminWorkerApproval() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  useEffect(() => {
    loadWorkers();
  }, [statusFilter]);

  const loadWorkers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/workers?status=${statusFilter}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkers(data.workers);
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
          reason: action === 'reject' ? 'Documents not verified' : undefined,
        }),
      });

      if (response.ok) {
        await loadWorkers();
        setSelectedWorker(null);
      }
    } catch (error) {
      console.error('Error approving worker:', error);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'id_front': return 'ID Card (Front)';
      case 'id_back': return 'ID Card (Back)';
      case 'certificate': return 'Certificate';
      case 'license': return 'License';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading workers...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Worker Management</h1>
        <p className="text-muted-foreground">
          Review and manage all worker applications
        </p>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Filter className="h-4 w-4" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workers</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="ml-2">
            {workers.length} workers
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {workers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No workers found</p>
            </CardContent>
          </Card>
        ) : (
          workers.map((worker) => (
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
                      <CardDescription>{worker.users.phone}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(worker.status)}>
                    {worker.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {/* Worker Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{worker.city}</span>
                    </div>
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
                  </div>

                  {/* Bio */}
                  <div>
                    <h4 className="font-medium mb-2">Bio</h4>
                    <p className="text-sm text-muted-foreground">{worker.bio}</p>
                  </div>

                  {/* Documents */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documents
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {worker.worker_documents.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs">
                            {getDocumentTypeLabel(doc.document_type)}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(doc.file_url, '_blank')}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => handleApproval(worker.id, 'approve')}
                      disabled={processing === worker.id}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {processing === worker.id ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => handleApproval(worker.id, 'reject')}
                      disabled={processing === worker.id}
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      {processing === worker.id ? 'Processing...' : 'Reject'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
