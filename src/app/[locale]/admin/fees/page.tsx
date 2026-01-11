'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLocale as useC74Locale } from '@/hooks/useLocale';
import { HeaderMenu } from '@/components/HeaderMenu';
import {
  DollarSign,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  Eye,
  Loader2,
  LayoutDashboard,
  LogOut,
  XCircle,
  Phone,
} from 'lucide-react';
import type { Locale } from '@/i18n-routing';
import { MobileBottomNav } from '@/components/MobileBottomNav';

const translations = {
  en: {
    title: 'Fee Collection',
    subtitle: 'Manage and verify worker platform fees',
    searchPlaceholder: 'Search by worker name...',
    pendingVerification: 'Pending Verification',
    overduePayments: 'Overdue Payments',
    collectedThisMonth: 'Collected This Month',
    totalOutstanding: 'Total Outstanding',
    all: 'All',
    unpaid: 'Unpaid',
    overdue: 'Overdue',
    pendingVerificationShort: 'Pending',
    paid: 'Paid',
    worker: 'Worker',
    week: 'Week',
    jobs: 'Jobs',
    amount: 'Amount',
    status: 'Status',
    dueDate: 'Due Date',
    actions: 'Actions',
    verify: 'Verify',
    reject: 'Reject',
    viewProof: 'View Proof',
    sendReminder: 'Send Reminder',
    verifyPayment: 'Verify Payment',
    paymentProof: 'Payment Proof',
    paymentReference: 'Reference',
    paymentMethod: 'Method',
    confirmVerify: 'Confirm Payment',
    confirmReject: 'Reject Payment',
    paymentVerified: 'Payment verified successfully',
    paymentRejected: 'Payment rejected',
    reminderSent: 'Reminder sent',
    error: 'An error occurred',
    noFees: 'No fees found',
    gracePeriod: '30-day grace period',
    day7Reminder: 'Day 7: Reminder',
    day21Warning: 'Day 21: Warning',
    day30Suspension: 'Day 30: Suspension',
    feeInfo: 'Platform fee: 10% of job price (min 5 TND per job)',
  },
  fr: {
    title: 'Collecte des Frais',
    subtitle: 'Gérer et vérifier les frais de plateforme',
    searchPlaceholder: 'Rechercher par nom...',
    pendingVerification: 'En attente de vérification',
    overduePayments: 'Paiements en retard',
    collectedThisMonth: 'Collectés ce mois',
    totalOutstanding: 'Total en attente',
    all: 'Tout',
    unpaid: 'Non payé',
    overdue: 'En retard',
    pendingVerificationShort: 'En attente',
    paid: 'Payé',
    worker: 'Travailleur',
    week: 'Semaine',
    jobs: 'Travaux',
    amount: 'Montant',
    status: 'Statut',
    dueDate: 'Date limite',
    actions: 'Actions',
    verify: 'Vérifier',
    reject: 'Rejeter',
    viewProof: 'Voir la preuve',
    sendReminder: 'Envoyer rappel',
    verifyPayment: 'Vérifier le paiement',
    paymentProof: 'Preuve de paiement',
    paymentReference: 'Référence',
    paymentMethod: 'Méthode',
    confirmVerify: 'Confirmer le paiement',
    confirmReject: 'Rejeter le paiement',
    paymentVerified: 'Paiement vérifié',
    paymentRejected: 'Paiement rejeté',
    reminderSent: 'Rappel envoyé',
    error: 'Une erreur est survenue',
    noFees: 'Aucun frais trouvé',
    gracePeriod: 'Période de grâce de 30 jours',
    day7Reminder: 'Jour 7: Rappel',
    day21Warning: 'Jour 21: Avertissement',
    day30Suspension: 'Jour 30: Suspension',
    feeInfo: 'Frais de plateforme: 10% du prix (min 5 TND)',
  },
  'ar-TN': {
    title: 'تحصيل الرسوم',
    subtitle: 'إدارة والتحقق من رسوم المنصة',
    searchPlaceholder: 'ابحث باسم العامل...',
    pendingVerification: 'في انتظار التحقق',
    overduePayments: 'مدفوعات متأخرة',
    collectedThisMonth: 'تم تحصيله هذا الشهر',
    totalOutstanding: 'إجمالي المعلق',
    all: 'الكل',
    unpaid: 'غير مدفوع',
    overdue: 'متأخر',
    pendingVerificationShort: 'في الانتظار',
    paid: 'مدفوع',
    worker: 'العامل',
    week: 'الأسبوع',
    jobs: 'الخدمات',
    amount: 'المبلغ',
    status: 'الحالة',
    dueDate: 'تاريخ الاستحقاق',
    actions: 'الإجراءات',
    verify: 'تحقق',
    reject: 'رفض',
    viewProof: 'عرض الإثبات',
    sendReminder: 'إرسال تذكير',
    verifyPayment: 'التحقق من الدفع',
    paymentProof: 'إثبات الدفع',
    paymentReference: 'المرجع',
    paymentMethod: 'طريقة الدفع',
    confirmVerify: 'تأكيد الدفع',
    confirmReject: 'رفض الدفع',
    paymentVerified: 'تم التحقق من الدفع',
    paymentRejected: 'تم رفض الدفع',
    reminderSent: 'تم إرسال التذكير',
    error: 'حدث خطأ',
    noFees: 'لا توجد رسوم',
    gracePeriod: 'فترة السماح 30 يوم',
    day7Reminder: 'اليوم 7: تذكير',
    day21Warning: 'اليوم 21: تحذير',
    day30Suspension: 'اليوم 30: إيقاف',
    feeInfo: 'رسوم المنصة: 10% من السعر (الحد الأدنى 5 دينار)',
  },
};

interface Fee {
  id: string;
  worker_id: string;
  worker_name: string;
  worker_phone: string;
  week_start: string;
  week_end: string;
  jobs_count: number;
  total_earnings: number;
  amount_due: number;
  status: 'unpaid' | 'overdue' | 'pending_verification' | 'paid';
  due_date: string;
  days_until_due: number;
  reminder_sent_at?: string;
  warning_sent_at?: string;
  payment_method?: string;
  payment_reference?: string;
  payment_proof_url?: string;
  verified_at?: string;
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

export default function AdminFeesPage() {
  const { locale, setLocale, isClient } = useC74Locale();
  const t = translations[locale];

  const [fees, setFees] = useState<Fee[]>([]);
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'overdue' | 'pending_verification' | 'paid'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isClient) return;

    const loadFees = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        const user = userData ? JSON.parse(userData) : null;

        if (!token || !user || user.role !== 'admin') {
          window.location.href = `/${locale}/signup`;
          return;
        }

        const response = await fetch('/api/fees?admin=true&limit=100&offset=0', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setFees([]);
          return;
        }

        const data = await response.json();
        setFees(data.fees || []);
      } catch (error) {
        console.error('Error loading fees:', error);
        setFees([]);
      }
    };

    loadFees();
  }, [isClient, locale]);

  const filteredFees = fees.filter(f => {
    const matchesFilter = filter === 'all' || f.status === filter;
    const matchesSearch = f.worker_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    pendingVerification: fees.filter(f => f.status === 'pending_verification').length,
    pendingAmount: fees.filter(f => f.status === 'pending_verification').reduce((sum, f) => sum + f.amount_due, 0),
    overdue: fees.filter(f => f.status === 'overdue').length,
    overdueAmount: fees.filter(f => f.status === 'overdue').reduce((sum, f) => sum + f.amount_due, 0),
    collected: fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount_due, 0),
    outstanding: fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + f.amount_due, 0),
  };

  const getStatusBadge = (status: Fee['status']) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-100 text-green-700">{t.paid}</Badge>;
      case 'overdue': return <Badge className="bg-red-100 text-red-700">{t.overdue}</Badge>;
      case 'pending_verification': return <Badge className="bg-blue-100 text-blue-700">{t.pendingVerificationShort}</Badge>;
      case 'unpaid':
      default: return <Badge className="bg-amber-100 text-amber-700">{t.unpaid}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(
    locale === 'ar-TN' ? 'ar-TN' : locale === 'fr' ? 'fr-FR' : 'en-US',
    { month: 'short', day: 'numeric' }
  );

  const formatWeek = (start: string, end: string) => `${formatDate(start)} - ${formatDate(end)}`;

  const handleVerify = async (fee: Fee) => {
    setProcessingId(fee.id);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/fees', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fee_id: fee.id, action: 'verify' }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to verify payment');
      }

      const data = await response.json();
      const updated = data.fee;
      setFees((prev) => prev.map((f) => (f.id === fee.id ? { ...f, status: 'paid', verified_at: updated.verified_at } : f)));
      setMessage({ type: 'success', text: t.paymentVerified });
      setSelectedFee(null);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Verify payment error:', error);
      setMessage({ type: 'error', text: t.error });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (fee: Fee) => {
    setProcessingId(fee.id);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/fees', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fee_id: fee.id, action: 'reject' }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to reject payment');
      }

      setFees((prev) =>
        prev.map((f) => (f.id === fee.id ? { ...f, status: 'unpaid', payment_proof_url: undefined, payment_reference: undefined } : f))
      );
      setMessage({ type: 'error', text: t.paymentRejected });
      setSelectedFee(null);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Reject payment error:', error);
      setMessage({ type: 'error', text: t.error });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSendReminder = async (fee: Fee) => {
    setProcessingId(fee.id);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/fees', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fee_id: fee.id, action: 'mark_reminder_sent' }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to send reminder');
      }

      const data = await response.json();
      const updated = data.fee;
      setFees((prev) => prev.map((f) => (f.id === fee.id ? { ...f, reminder_sent_at: updated.reminder_sent_at } : f)));
      setMessage({ type: 'success', text: t.reminderSent });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Send reminder error:', error);
      setMessage({ type: 'error', text: t.error });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getAdminMenuItems(locale, 'fees')}
        title={t.title}
        subtitle={t.subtitle}
      />

      {isClient && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {message && (
            <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="font-medium text-blue-700 dark:text-blue-300 mb-2">{t.gracePeriod} • {t.feeInfo}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {t.day7Reminder}</span>
              <span className="flex items-center gap-1 text-amber-600"><AlertTriangle className="w-4 h-4" /> {t.day21Warning}</span>
              <span className="flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4" /> {t.day30Suspension}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  {t.pendingVerification}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.pendingAmount.toFixed(0)} TND</div>
                <p className="text-xs text-neutral-500">{stats.pendingVerification} invoices</p>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  {t.overduePayments}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.overdueAmount.toFixed(0)} TND</div>
                <p className="text-xs text-neutral-500">{stats.overdue} invoices</p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {t.collectedThisMonth}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.collected.toFixed(0)} TND</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {t.totalOutstanding}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.outstanding.toFixed(0)} TND</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 start-3" />
              <Input placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="ps-10" />
            </div>
            <div className={`flex gap-2 flex-wrap`}>
              {(['all', 'pending_verification', 'overdue', 'unpaid', 'paid'] as const).map(f => (
                <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
                  {f === 'pending_verification' ? t.pendingVerificationShort : t[f]}
                </Button>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {filteredFees.length === 0 ? (
                <div className="py-12 text-center text-neutral-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t.noFees}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 dark:bg-neutral-800">
                      <tr className="text-sm text-neutral-500">
                        <th className="p-4 font-medium text-start">{t.worker}</th>
                        <th className="p-4 font-medium text-start">{t.week}</th>
                        <th className="p-4 font-medium text-center">{t.jobs}</th>
                        <th className="p-4 font-medium text-end">{t.amount}</th>
                        <th className="p-4 font-medium text-center">{t.status}</th>
                        <th className="p-4 font-medium text-end">{t.dueDate}</th>
                        <th className="p-4 font-medium text-center">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFees.map(fee => (
                        <tr key={fee.id} className={`border-t hover:bg-neutral-50 dark:hover:bg-neutral-800 ${fee.status === 'overdue' ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                          <td className="p-4">
                            <div>
                              <span className="font-medium">{fee.worker_name}</span>
                              <p className="text-sm text-neutral-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {fee.worker_phone}</p>
                            </div>
                          </td>
                          <td className="p-4 text-sm">{formatWeek(fee.week_start, fee.week_end)}</td>
                          <td className="p-4 text-center">{fee.jobs_count}</td>
                          <td className="p-4 font-bold text-end" dir="ltr">{fee.amount_due.toFixed(1)} TND</td>
                          <td className="p-4 text-center">{getStatusBadge(fee.status)}</td>
                          <td className="p-4 text-sm text-end">
                            <span className={fee.days_until_due < 0 ? 'text-red-600 font-medium' : ''}>{formatDate(fee.due_date)}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              {fee.status === 'pending_verification' && (
                                <Button size="sm" onClick={() => setSelectedFee(fee)}><Eye className="w-4 h-4 me-1" /> {t.verify}</Button>
                              )}
                              {(fee.status === 'unpaid' || fee.status === 'overdue') && (
                                <Button size="sm" variant="outline" onClick={() => handleSendReminder(fee)} disabled={processingId === fee.id}>
                                  {processingId === fee.id ? <Loader2 className="w-4 h-4 animate-spin" /> : t.sendReminder}
                                </Button>
                              )}
                              {fee.status === 'paid' && <CheckCircle className="w-5 h-5 text-green-500" />}
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

      {selectedFee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className={`flex items-center justify-between`}>
                <CardTitle>{t.verifyPayment}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFee(null)}><XCircle className="w-5 h-5" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div>
                  <p className="font-medium">{selectedFee.worker_name}</p>
                  <p className="text-sm text-neutral-500">{formatWeek(selectedFee.week_start, selectedFee.week_end)}</p>
                </div>
                <span className="text-xl font-bold text-green-600">{selectedFee.amount_due.toFixed(1)} TND</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-500">{t.paymentMethod}</p>
                  <p className="font-medium">{selectedFee.payment_method?.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">{t.paymentReference}</p>
                  <p className="font-medium font-mono">{selectedFee.payment_reference}</p>
                </div>
              </div>

              {selectedFee.payment_proof_url && (
                <div>
                  <p className="text-sm text-neutral-500 mb-2">{t.paymentProof}</p>
                  <div className="border rounded-lg overflow-hidden">
                    <img src={selectedFee.payment_proof_url} alt="Payment proof" className="w-full max-h-64 object-contain bg-neutral-100" />
                  </div>
                </div>
              )}

              <div className={`flex gap-3`}>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleVerify(selectedFee)} disabled={processingId === selectedFee.id}>
                  {processingId === selectedFee.id ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <CheckCircle className="w-4 h-4 me-2" />}
                  {t.confirmVerify}
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleReject(selectedFee)} disabled={processingId === selectedFee.id}>
                  <XCircle className="w-4 h-4 me-2" />
                  {t.confirmReject}
                </Button>
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
