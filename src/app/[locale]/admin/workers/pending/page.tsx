'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/lib/i18n';
import { ArrowLeft, CheckCircle, XCircle, User } from 'lucide-react';
import { useLocale as useC74Locale } from '@/hooks/useLocale';

type PendingWorker = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  category: string;
  submitted_at: string;
};

export default function PendingWorkersPage() {
  const { locale, isClient } = useC74Locale();
  const [workers, setWorkers] = useState<PendingWorker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isClient) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        const user = userData ? JSON.parse(userData) : null;

        if (!token || !user || user.role !== 'admin') {
          window.location.href = `/${locale}/signup`;
          return;
        }

        const response = await fetch('/api/admin/workers/pending', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setWorkers([]);
          return;
        }

        const data = await response.json();
        setWorkers(data.applications || []);
      } catch (error) {
        console.error('Load pending workers error:', error);
        setWorkers([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [isClient, locale]);

  const handleAction = async (workerId: string, action: 'approve' | 'reject') => {
    setProcessingId(workerId);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/workers/pending', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ application_id: workerId, action }),
      });

      if (!response.ok) {
        setMessage({ type: 'error', text: 'Action failed' });
        return;
      }

      setWorkers((prev) => prev.filter((w) => w.id !== workerId));
      setMessage({ type: 'success', text: action === 'approve' ? 'Worker approved' : 'Worker rejected' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Worker action error:', error);
      setMessage({ type: 'error', text: 'Action failed' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
      <div className="max-w-4xl mx-auto">
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/${locale}/admin/dashboard`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 me-2 rtl:rotate-180" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Pending Worker Verifications</h1>
          <Badge variant="secondary">{workers.length} pending</Badge>
        </div>
        
        <div className="space-y-4">
          {workers.map((worker) => (
            <Card key={worker.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{worker.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{worker.phone || worker.email || ''}</p>
                    </div>
                  </div>
                  <Badge>{worker.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Submitted: {new Date(worker.submitted_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      disabled={isLoading || processingId === worker.id}
                      onClick={() => handleAction(worker.id, 'reject')}
                    >
                      <XCircle className="h-4 w-4 me-1" /> Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={isLoading || processingId === worker.id}
                      onClick={() => handleAction(worker.id, 'approve')}
                    >
                      <CheckCircle className="h-4 w-4 me-1" /> Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {!isLoading && workers.length === 0 && (
            <div className="py-12 text-center text-neutral-500">No pending workers.</div>
          )}
          {isLoading && (
            <div className="py-12 text-center text-neutral-500">Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
}
