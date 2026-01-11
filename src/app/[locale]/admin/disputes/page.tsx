'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLocale as useC74Locale } from '@/hooks/useLocale';
import { HeaderMenu } from '@/components/HeaderMenu';
import {
  AlertTriangle,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  User,
  Briefcase,
  ArrowLeft,
  LayoutDashboard,
  DollarSign,
  Users,
  LogOut,
  Loader2,
} from 'lucide-react';
import type { Locale } from '@/i18n-routing';
import { MobileBottomNav } from '@/components/MobileBottomNav';

const translations = {
  en: {
    title: 'Disputes Management',
    subtitle: 'Review and resolve customer/worker disputes',
    
    searchPlaceholder: 'Search disputes...',
    
    // Filters
    all: 'All',
    open: 'Open',
    underReview: 'Under Review',
    resolved: 'Resolved',
    
    // Table
    job: 'Job',
    reporter: 'Reporter',
    type: 'Type',
    status: 'Status',
    date: 'Date',
    actions: 'Actions',
    
    // Types
    quality: 'Quality Issue',
    payment: 'Payment Issue',
    noShow: 'No Show',
    damage: 'Damage',
    other: 'Other',
    
    // Actions
    viewDetails: 'View',
    startReview: 'Start Review',
    resolve: 'Resolve',
    close: 'Close',
    
    // Modal
    disputeDetails: 'Dispute Details',
    description: 'Description',
    evidence: 'Evidence',
    resolution: 'Resolution',
    resolutionPlaceholder: 'Enter resolution details...',
    resolveDispute: 'Mark as Resolved',
    
    // Empty
    noDisputes: 'No disputes found',
  },
  fr: {
    title: 'Gestion des Litiges',
    subtitle: 'Examiner et résoudre les litiges',
    
    searchPlaceholder: 'Rechercher des litiges...',
    
    all: 'Tout',
    open: 'Ouvert',
    underReview: 'En Examen',
    resolved: 'Résolu',
    
    job: 'Travail',
    reporter: 'Rapporteur',
    type: 'Type',
    status: 'Statut',
    date: 'Date',
    actions: 'Actions',
    
    quality: 'Problème de qualité',
    payment: 'Problème de paiement',
    noShow: 'Absence',
    damage: 'Dommage',
    other: 'Autre',
    
    viewDetails: 'Voir',
    startReview: 'Examiner',
    resolve: 'Résoudre',
    close: 'Fermer',
    
    disputeDetails: 'Détails du litige',
    description: 'Description',
    evidence: 'Preuves',
    resolution: 'Résolution',
    resolutionPlaceholder: 'Entrez les détails de la résolution...',
    resolveDispute: 'Marquer comme résolu',
    
    noDisputes: 'Aucun litige trouvé',
  },
  'ar-TN': {
    title: 'إدارة النزاعات',
    subtitle: 'مراجعة وحل نزاعات الحرفاء والعمال',
    
    searchPlaceholder: 'ابحث في النزاعات...',
    
    all: 'الكل',
    open: 'مفتوح',
    underReview: 'قيد المراجعة',
    resolved: 'تم الحل',
    
    job: 'الخدمة',
    reporter: 'المبلغ',
    type: 'النوع',
    status: 'الحالة',
    date: 'التاريخ',
    actions: 'الإجراءات',
    
    quality: 'مشكلة جودة',
    payment: 'مشكلة دفع',
    noShow: 'عدم الحضور',
    damage: 'ضرر',
    other: 'أخرى',
    
    viewDetails: 'عرض',
    startReview: 'بدء المراجعة',
    resolve: 'حل',
    close: 'إغلاق',
    
    disputeDetails: 'تفاصيل النزاع',
    description: 'الوصف',
    evidence: 'الأدلة',
    resolution: 'الحل',
    resolutionPlaceholder: 'أدخل تفاصيل الحل...',
    resolveDispute: 'تحديد كمحلول',
    
    noDisputes: 'لم يتم العثور على نزاعات',
  },
};

interface Dispute {
  id: string;
  jobId: string;
  jobTitle: string;
  reporterName: string;
  reporterRole: 'customer' | 'worker';
  accusedName: string;
  type: 'quality' | 'payment' | 'no_show' | 'damage' | 'other';
  description: string;
  evidenceUrls?: string[];
  status: 'open' | 'under_review' | 'resolved';
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

function getAdminMenuItems(locale: Locale, currentPage?: string) {
  const t = {
    en: { dashboard: 'Dashboard', disputes: 'Disputes', payouts: 'Payouts', workers: 'Workers', logout: 'Logout' },
    fr: { dashboard: 'Tableau de bord', disputes: 'Litiges', payouts: 'Paiements', workers: 'Travailleurs', logout: 'Déconnexion' },
    'ar-TN': { dashboard: 'لوحة التحكم', disputes: 'النزاعات', payouts: 'المدفوعات', workers: 'العمال', logout: 'تسجيل الخروج' },
  }[locale];

  const items = [];
  if (currentPage !== 'dashboard') items.push({ key: 'dashboard', label: t.dashboard, icon: <LayoutDashboard className="w-4 h-4" />, href: `/${locale}/admin/dashboard` });
  if (currentPage !== 'disputes') items.push({ key: 'disputes', label: t.disputes, icon: <AlertTriangle className="w-4 h-4" />, href: `/${locale}/admin/disputes` });
  if (currentPage !== 'payouts') items.push({ key: 'payouts', label: t.payouts, icon: <DollarSign className="w-4 h-4" />, href: `/${locale}/admin/payouts` });
  if (currentPage !== 'workers') items.push({ key: 'workers', label: t.workers, icon: <Users className="w-4 h-4" />, href: `/${locale}/admin/workers` });
  items.push({ key: 'logout', label: t.logout, icon: <LogOut className="w-4 h-4" />, onClick: () => { localStorage.clear(); window.location.href = `/${locale}/login`; }, variant: 'danger' as const, separator: true });
  return items;
}

export default function AdminDisputesPage() {
  const { locale, setLocale, isClient } = useC74Locale();
  const t = translations[locale];

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'under_review' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isClient) return;

    const loadDisputes = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/admin/disputes?limit=200', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setDisputes([]);
          return;
        }

        const data = await response.json();
        setDisputes(data.disputes || []);
      } catch (error) {
        console.error('Error loading disputes:', error);
        setDisputes([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDisputes();
  }, [isClient]);

  const filteredDisputes = disputes.filter(d => {
    const matchesFilter = filter === 'all' || d.status === filter;
    const matchesSearch = d.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.reporterName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: Dispute['status']) => {
    switch (status) {
      case 'open': return <Badge className="bg-red-100 text-red-700">{t.open}</Badge>;
      case 'under_review': return <Badge className="bg-amber-100 text-amber-700">{t.underReview}</Badge>;
      case 'resolved': return <Badge className="bg-green-100 text-green-700">{t.resolved}</Badge>;
    }
  };

  const getTypeBadge = (type: Dispute['type']) => {
    const labels: Record<Dispute['type'], string> = {
      quality: t.quality,
      payment: t.payment,
      no_show: t.noShow,
      damage: t.damage,
      other: t.other,
    };
    return <Badge variant="outline">{labels[type]}</Badge>;
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(
    locale === 'ar-TN' ? 'ar-TN' : locale === 'fr' ? 'fr-FR' : 'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  const handleStartReview = (dispute: Dispute) => {
    const startReview = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/admin/disputes', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dispute_id: dispute.id, action: 'start_review' }),
        });

        if (!response.ok) return;

        setDisputes((prev) => prev.map((d) => (d.id === dispute.id ? { ...d, status: 'under_review' as const } : d)));
      } catch (error) {
        console.error('Start review error:', error);
      }
    };

    startReview();
  };

  const handleResolve = async () => {
    if (!selectedDispute || !resolution.trim()) return;
    
    setIsResolving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/disputes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dispute_id: selectedDispute.id, action: 'resolve', resolution: resolution.trim() }),
      });

      if (!response.ok) return;

      const now = new Date().toISOString();
      setDisputes((prev) =>
        prev.map((d) =>
          d.id === selectedDispute.id
            ? { ...d, status: 'resolved' as const, resolution: resolution.trim(), resolvedAt: now }
            : d
        )
      );

      setSelectedDispute(null);
      setResolution('');
    } catch (error) {
      console.error('Resolve dispute error:', error);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getAdminMenuItems(locale, 'disputes')}
        title={t.title}
        subtitle={t.subtitle}
      />

      {isClient && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 start-3" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-10"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'open', 'under_review', 'resolved'] as const).map(f => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  {t[f === 'under_review' ? 'underReview' : f]}
                </Button>
              ))}
            </div>
          </div>

          {/* Disputes Table */}
          <Card>
            <CardContent className="p-0">
              {filteredDisputes.length === 0 ? (
                <div className="py-12 text-center text-neutral-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{isLoading ? 'Loading...' : t.noDisputes}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 dark:bg-neutral-800">
                      <tr className="text-sm text-neutral-500">
                        <th className="p-4 font-medium text-start">{t.job}</th>
                        <th className="p-4 font-medium text-start">{t.reporter}</th>
                        <th className="p-4 font-medium text-center">{t.type}</th>
                        <th className="p-4 font-medium text-center">{t.status}</th>
                        <th className="p-4 font-medium text-end">{t.date}</th>
                        <th className="p-4 font-medium text-center">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDisputes.map(dispute => (
                        <tr key={dispute.id} className="border-t hover:bg-neutral-50 dark:hover:bg-neutral-800">
                          <td className="p-4">
                            <span className="font-medium">{dispute.jobTitle}</span>
                          </td>
                          <td className="p-4">
                            <span>{dispute.reporterName}</span>
                            <Badge variant="outline" className="ms-2 text-xs">
                              {dispute.reporterRole}
                            </Badge>
                          </td>
                          <td className="p-4 text-center">{getTypeBadge(dispute.type)}</td>
                          <td className="p-4 text-center">{getStatusBadge(dispute.status)}</td>
                          <td className="p-4 text-neutral-500 text-end">
                            {formatDate(dispute.createdAt)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedDispute(dispute)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {dispute.status === 'open' && (
                                <Button variant="outline" size="sm" onClick={() => handleStartReview(dispute)}>
                                  {t.startReview}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dispute Detail Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t.disputeDetails}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDispute(null)}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedDispute.jobTitle}</h3>
                  <p className="text-sm text-neutral-500">Job ID: {selectedDispute.jobId}</p>
                </div>
                {getStatusBadge(selectedDispute.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-500 mb-1">{t.reporter}</p>
                  <p className="font-medium">{selectedDispute.reporterName}</p>
                  <Badge variant="outline" className="mt-1">{selectedDispute.reporterRole}</Badge>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-500 mb-1">{t.type}</p>
                  {getTypeBadge(selectedDispute.type)}
                </div>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-2">{t.description}</p>
                <p className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  {selectedDispute.description}
                </p>
              </div>

              {selectedDispute.status !== 'resolved' && (
                <div>
                  <p className="text-sm text-neutral-500 mb-2">{t.resolution}</p>
                  <Textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder={t.resolutionPlaceholder}
                    rows={4}
                  />
                  <Button 
                    className="w-full mt-3" 
                    onClick={handleResolve}
                    disabled={isResolving || !resolution.trim()}
                  >
                    {isResolving ? (
                      <Loader2 className="w-4 h-4 animate-spin me-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 me-2" />
                    )}
                    {t.resolveDispute}
                  </Button>
                </div>
              )}

              {selectedDispute.resolution && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-1">{t.resolution}</p>
                  <p>{selectedDispute.resolution}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav locale={locale} userRole="admin" />
    </div>
  );
}
