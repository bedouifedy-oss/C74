'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link } from '@/lib/i18n';
import { useLocale as useC74Locale } from '@/hooks/useLocale';
import { HeaderMenu } from '@/components/HeaderMenu';
import {
  Users,
  Briefcase,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Eye,
  MessageSquare,
  ArrowRight,
  LayoutDashboard,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';
import type { Locale } from '@/i18n-routing';
import { MobileBottomNav } from '@/components/MobileBottomNav';

const translations = {
  en: {
    title: 'Admin Dashboard',
    subtitle: 'Manage platform operations',
    
    // Stats
    totalWorkers: 'Total Workers',
    pendingVerification: 'pending verification',
    activeJobs: 'Active Jobs',
    completedToday: 'completed today',
    openDisputes: 'Open Disputes',
    requiresAttention: 'requires attention',
    monthlyRevenue: 'Monthly Revenue',
    platformFees: 'from platform fees',
    
    // Sections
    recentDisputes: 'Recent Disputes',
    viewAll: 'View All',
    pendingFees: 'Pending Fees',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    
    // Dispute statuses
    open: 'Open',
    underReview: 'Under Review',
    resolved: 'Resolved',
    
    // Actions
    reviewWorkers: 'Review Pending Workers',
    manageDisputes: 'Manage Disputes',
    viewFees: 'View All Fees',
    collectFees: 'Collect Fees',
    viewDetails: 'View Details',
    
    // Table headers
    worker: 'Worker',
    amount: 'Amount',
    status: 'Status',
    date: 'Date',
    reporter: 'Reporter',
    type: 'Type',
    apiIntegrations: 'API Integrations',
  },
  fr: {
    title: 'Tableau de bord Admin',
    subtitle: 'Gérer les opérations de la plateforme',
    
    totalWorkers: 'Total Travailleurs',
    pendingVerification: 'en attente de vérification',
    activeJobs: 'Travaux Actifs',
    completedToday: 'terminés aujourd\'hui',
    openDisputes: 'Litiges Ouverts',
    requiresAttention: 'nécessite attention',
    monthlyRevenue: 'Revenus Mensuels',
    platformFees: 'des frais de plateforme',
    
    recentDisputes: 'Litiges Récents',
    viewAll: 'Voir Tout',
    pendingFees: 'Frais en Attente',
    recentActivity: 'Activité Récente',
    quickActions: 'Actions Rapides',
    
    open: 'Ouvert',
    underReview: 'En Examen',
    resolved: 'Résolu',
    
    reviewWorkers: 'Examiner les Travailleurs',
    manageDisputes: 'Gérer les Litiges',
    viewFees: 'Voir tous les Frais',
    collectFees: 'Collecter les Frais',
    viewDetails: 'Voir Détails',
    
    worker: 'Travailleur',
    amount: 'Montant',
    status: 'Statut',
    date: 'Date',
    reporter: 'Rapporteur',
    type: 'Type',
    apiIntegrations: 'Intégrations API',
  },
  'ar-TN': {
    title: 'لوحة تحكم الأدمن',
    subtitle: 'إدارة عمليات المنصة',
    
    totalWorkers: 'إجمالي العمال',
    pendingVerification: 'في انتظار التحقق',
    activeJobs: 'الخدمات النشطة',
    completedToday: 'مكتملة اليوم',
    openDisputes: 'النزاعات المفتوحة',
    requiresAttention: 'تتطلب اهتمام',
    monthlyRevenue: 'الإيرادات الشهرية',
    platformFees: 'من رسوم المنصة',
    
    recentDisputes: 'النزاعات الأخيرة',
    viewAll: 'عرض الكل',
    pendingFees: 'الرسوم المعلقة',
    recentActivity: 'النشاط الأخير',
    quickActions: 'إجراءات سريعة',
    
    open: 'مفتوح',
    underReview: 'قيد المراجعة',
    resolved: 'تم الحل',
    
    reviewWorkers: 'مراجعة العمال المعلقين',
    manageDisputes: 'إدارة النزاعات',
    viewFees: 'عرض كل الرسوم',
    collectFees: 'تحصيل الرسوم',
    viewDetails: 'عرض التفاصيل',
    
    worker: 'العامل',
    amount: 'المبلغ',
    status: 'الحالة',
    date: 'التاريخ',
    reporter: 'المبلغ',
    type: 'النوع',
    apiIntegrations: 'تكاملات API',
  },
};

interface Dispute {
  id: string;
  jobId: string;
  jobTitle: string;
  reporterName: string;
  reporterRole: 'customer' | 'worker';
  type: 'quality' | 'payment' | 'no_show' | 'damage' | 'other';
  status: 'open' | 'under_review' | 'resolved';
  createdAt: string;
}

interface PendingFee {
  id: string;
  workerId: string;
  workerName: string;
  amount: number;
  status: 'unpaid' | 'overdue' | 'pending_verification';
  dueDate: string;
}

function getAdminMenuItems(locale: Locale, currentPage?: string) {
  const t = {
    en: { dashboard: 'Dashboard', disputes: 'Disputes', fees: 'Fees', workers: 'Workers', logout: 'Logout' },
    fr: { dashboard: 'Tableau de bord', disputes: 'Litiges', fees: 'Frais', workers: 'Travailleurs', logout: 'Déconnexion' },
    'ar-TN': { dashboard: 'لوحة التحكم', disputes: 'النزاعات', fees: 'الرسوم', workers: 'العمال', logout: 'تسجيل الخروج' },
  }[locale];

  const items = [];
  if (currentPage !== 'dashboard') items.push({ key: 'dashboard', label: t.dashboard, icon: <LayoutDashboard className="w-4 h-4" />, href: `/${locale}/admin/dashboard` });
  if (currentPage !== 'disputes') items.push({ key: 'disputes', label: t.disputes, icon: <AlertTriangle className="w-4 h-4" />, href: `/${locale}/admin/disputes` });
  if (currentPage !== 'fees') items.push({ key: 'fees', label: t.fees, icon: <DollarSign className="w-4 h-4" />, href: `/${locale}/admin/fees` });
  if (currentPage !== 'workers') items.push({ key: 'workers', label: t.workers, icon: <Users className="w-4 h-4" />, href: `/${locale}/admin/workers` });
  items.push({ key: 'logout', label: t.logout, icon: <LogOut className="w-4 h-4" />, onClick: () => { localStorage.clear(); window.location.href = `/${locale}/login`; }, variant: 'danger' as const, separator: true });
  return items;
}

export default function AdminDashboardPage() {
  const { locale, setLocale, isClient } = useC74Locale();
  const t = translations[locale];

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [pendingFees, setPendingFees] = useState<PendingFee[]>([]);
  const [workerStats, setWorkerStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Auth check - redirect to admin login if not authenticated as admin
  useEffect(() => {
    if (!isClient) return;

    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (!token || !userData) {
      window.location.href = `/${locale}/admin/login`;
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user.role !== 'admin') {
        window.location.href = `/${locale}/admin/login`;
        return;
      }
    } catch {
      window.location.href = `/${locale}/admin/login`;
      return;
    }
  }, [isClient, locale]);

  // Fetch real data from API
  useEffect(() => {
    if (!isClient) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('auth_token');

        // Fetch disputes
        const disputesRes = await fetch('/api/admin/disputes?limit=10', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (disputesRes.ok) {
          const disputesData = await disputesRes.json();
          setDisputes(disputesData.disputes || []);
        }

        // Fetch pending fees
        const feesRes = await fetch('/api/fees?admin=true&status=pending_verification&limit=10&offset=0', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (feesRes.ok) {
          const feesData = await feesRes.json();
          setPendingFees((feesData.fees || []).map((f: any) => ({
            id: f.id,
            workerId: f.worker_id,
            workerName: f.worker_name || 'Unknown',
            amount: f.amount_due,
            status: f.status,
            dueDate: f.due_date,
          })));
        }

        // Fetch worker stats
        const workersRes = await fetch('/api/admin/workers?status=all&limit=1000', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (workersRes.ok) {
          const workersData = await workersRes.json();
          const workers = workersData.workers || [];
          setWorkerStats({
            total: workers.length,
            pending: workers.filter((w: any) => w.status === 'pending').length,
            active: workers.filter((w: any) => w.status === 'active').length,
            rejected: workers.filter((w: any) => w.status === 'rejected').length,
          });
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isClient]);

  const getDisputeStatusBadge = (status: Dispute['status']) => {
    switch (status) {
      case 'open': return <Badge className="bg-red-100 text-red-700">{t.open}</Badge>;
      case 'under_review': return <Badge className="bg-amber-100 text-amber-700">{t.underReview}</Badge>;
      case 'resolved': return <Badge className="bg-green-100 text-green-700">{t.resolved}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(locale === 'ar-TN' ? 'ar-TN' : locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getAdminMenuItems(locale, 'dashboard')}
        title={t.title}
        subtitle={t.subtitle}
      />

      {isClient && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t.totalWorkers}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workerStats.total}</div>
                <p className="text-xs text-muted-foreground">{workerStats.pending} {t.pendingVerification}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t.activeJobs}</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workerStats.active}</div>
                <p className="text-xs text-muted-foreground">{workerStats.total} total jobs</p>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t.openDisputes}</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{disputes.filter(d => d.status === 'open').length}</div>
                <p className="text-xs text-red-500">{t.requiresAttention}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t.monthlyRevenue}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingFees.reduce((sum, fee) => sum + fee.amount, 0)} TND</div>
                <p className="text-xs text-muted-foreground">{t.platformFees}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Disputes Panel */}
            <Card>
              <CardHeader>
                <div className={`flex items-center justify-between`}>
                  <CardTitle className={`flex items-center gap-2`}>
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    {t.recentDisputes}
                  </CardTitle>
                  <Link href="/admin/disputes">
                    <Button variant="ghost" size="sm">{t.viewAll} <ArrowRight className={`w-4 h-4 ms-1 rtl:rotate-180`} /></Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {disputes.length === 0 ? (
                  <p className="text-center text-neutral-500 py-8">No disputes</p>
                ) : (
                  <div className="space-y-3">
                    {disputes.slice(0, 3).map(dispute => (
                      <div key={dispute.id} className={`p-3 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 `}>
                        <div className={`flex items-center justify-between mb-2`}>
                          <span className="font-medium">{dispute.jobTitle}</span>
                          {getDisputeStatusBadge(dispute.status)}
                        </div>
                        <div className={`flex items-center gap-4 text-sm text-neutral-500`}>
                          <span>{dispute.reporterName}</span>
                          <span>{formatDate(dispute.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Fees Panel */}
            <Card>
              <CardHeader>
                <div className={`flex items-center justify-between`}>
                  <CardTitle className={`flex items-center gap-2`}>
                    <DollarSign className="w-5 h-5 text-amber-500" />
                    {t.pendingFees}
                  </CardTitle>
                  <Link href="/admin/fees">
                    <Button variant="ghost" size="sm">{t.viewAll} <ArrowRight className={`w-4 h-4 ms-1 rtl:rotate-180`} /></Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {pendingFees.length === 0 ? (
                  <p className="text-center text-neutral-500 py-8">No pending fees</p>
                ) : (
                  <div className="space-y-3">
                    {pendingFees.slice(0, 4).map(fee => (
                      <div key={fee.id} className={`flex items-center justify-between p-3 border rounded-lg ${fee.status === 'overdue' ? 'border-red-200 bg-red-50/50' : ''}`}>
                        <div>
                          <span className="font-medium">{fee.workerName}</span>
                          <p className="text-sm text-neutral-500">{formatDate(fee.dueDate)}</p>
                        </div>
                        <div className={`flex items-center gap-3`}>
                          <span className="font-bold text-amber-600">{fee.amount} TND</span>
                          <Badge className={fee.status === 'overdue' ? 'bg-red-100 text-red-700' : fee.status === 'pending_verification' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}>
                            {fee.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/admin/fees"><Button className="w-full mt-4">{t.collectFees}</Button></Link>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t.quickActions}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex flex-wrap gap-3`}>
                <Link href="/admin/workers"><Button variant="outline"><Users className={`w-4 h-4 me-2`} />{t.reviewWorkers}</Button></Link>
                <Link href="/admin/disputes"><Button variant="outline"><AlertTriangle className={`w-4 h-4 me-2`} />{t.manageDisputes}</Button></Link>
                <Link href="/admin/fees"><Button variant="outline"><DollarSign className={`w-4 h-4 me-2`} />{t.viewFees}</Button></Link>
                <Link href="/admin/integrations"><Button variant="outline"><Settings className={`w-4 h-4 me-2`} />{t.apiIntegrations || 'API Integrations'}</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav locale={locale} userRole="admin" />
    </div>
  );
}
