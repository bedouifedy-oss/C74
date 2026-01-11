'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocale as useC74Locale } from '@/hooks/useLocale';
import { HeaderMenu, getWorkerMenuItems } from '@/components/HeaderMenu';
import {
  CreditCard,
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  Upload,
  Loader2,
  FileText,
  Briefcase,
  AlertCircle,
  X,
} from 'lucide-react';
import type { Locale } from '@/i18n-routing';

const translations = {
  en: {
    title: 'My Platform Fees',
    subtitle: 'Track your fees and make payments',
    
    // Stats
    currentWeekFees: 'Current Week',
    pendingPayment: 'Due Payment',
    totalPaid: 'Total Paid',
    dueDate: 'Due Date',
    
    // Fee info
    feeExplanation: 'Platform fee is 10% of each job price (minimum 5 TND per job)',
    weeklyInvoice: 'Fees are invoiced weekly. Payment is due within 30 days.',
    
    // Status
    unpaid: 'Unpaid',
    paid: 'Paid',
    overdue: 'Overdue',
    pendingVerification: 'Pending Verification',
    
    // Timeline warnings
    reminderSent: 'Reminder sent',
    warningSent: 'Warning: Payment overdue',
    suspensionWarning: 'Account will be suspended if not paid',
    daysRemaining: 'days remaining',
    
    // Table
    week: 'Week',
    jobsCompleted: 'Jobs',
    totalEarnings: 'Job Earnings',
    platformFee: 'Platform Fee (10%)',
    status: 'Status',
    actions: 'Actions',
    
    // Payment
    payNow: 'Pay Now',
    uploadProof: 'Upload Payment Proof',
    paymentReference: 'Payment Reference',
    paymentReferencePlaceholder: 'D17/Flouci/Wire reference',
    selectFile: 'Select Screenshot',
    submitPayment: 'Submit Payment',
    submitting: 'Submitting...',
    paymentSubmitted: 'Payment submitted for verification',
    
    // Payment methods
    paymentMethods: 'Payment Methods',
    d17: 'D17',
    flouci: 'Flouci',
    wireTransfer: 'Wire Transfer',
    mandat: 'Mandat',
    
    // Empty
    noFees: 'No fees yet',
    noFeesDesc: 'Complete jobs to see your platform fees here',
    
    // Job details
    jobTitle: 'Job',
    jobPrice: 'Price',
    fee: 'Fee',
  },
  fr: {
    title: 'Mes Frais de Plateforme',
    subtitle: 'Suivez vos frais et effectuez vos paiements',
    
    currentWeekFees: 'Semaine en cours',
    pendingPayment: 'Paiement dû',
    totalPaid: 'Total payé',
    dueDate: 'Date limite',
    
    feeExplanation: 'Les frais de plateforme sont de 10% du prix de chaque travail (minimum 5 TND par travail)',
    weeklyInvoice: 'Les frais sont facturés chaque semaine. Paiement dû sous 30 jours.',
    
    unpaid: 'Non payé',
    paid: 'Payé',
    overdue: 'En retard',
    pendingVerification: 'En attente de vérification',
    
    reminderSent: 'Rappel envoyé',
    warningSent: 'Avertissement: Paiement en retard',
    suspensionWarning: 'Le compte sera suspendu si non payé',
    daysRemaining: 'jours restants',
    
    week: 'Semaine',
    jobsCompleted: 'Travaux',
    totalEarnings: 'Revenus',
    platformFee: 'Frais (10%)',
    status: 'Statut',
    actions: 'Actions',
    
    payNow: 'Payer',
    uploadProof: 'Télécharger la preuve',
    paymentReference: 'Référence de paiement',
    paymentReferencePlaceholder: 'Référence D17/Flouci/Virement',
    selectFile: 'Sélectionner la capture',
    submitPayment: 'Soumettre le paiement',
    submitting: 'Envoi...',
    paymentSubmitted: 'Paiement soumis pour vérification',
    
    paymentMethods: 'Méthodes de paiement',
    d17: 'D17',
    flouci: 'Flouci',
    wireTransfer: 'Virement',
    mandat: 'Mandat',
    
    noFees: 'Aucun frais',
    noFeesDesc: 'Terminez des travaux pour voir vos frais ici',
    
    jobTitle: 'Travail',
    jobPrice: 'Prix',
    fee: 'Frais',
  },
  'ar-TN': {
    title: 'رسوم المنصة',
    subtitle: 'تابع رسومك وادفعها',
    
    currentWeekFees: 'هذا الأسبوع',
    pendingPayment: 'المبلغ المستحق',
    totalPaid: 'إجمالي المدفوع',
    dueDate: 'تاريخ الاستحقاق',
    
    feeExplanation: 'رسوم المنصة 10% من سعر كل خدمة (الحد الأدنى 5 دينار)',
    weeklyInvoice: 'الرسوم تُفوتر أسبوعياً. الدفع خلال 30 يوم.',
    
    unpaid: 'غير مدفوع',
    paid: 'مدفوع',
    overdue: 'متأخر',
    pendingVerification: 'في انتظار التحقق',
    
    reminderSent: 'تم إرسال تذكير',
    warningSent: 'تحذير: الدفع متأخر',
    suspensionWarning: 'سيتم إيقاف الحساب إذا لم يتم الدفع',
    daysRemaining: 'يوم متبقي',
    
    week: 'الأسبوع',
    jobsCompleted: 'الخدمات',
    totalEarnings: 'الأرباح',
    platformFee: 'رسوم المنصة (10%)',
    status: 'الحالة',
    actions: 'الإجراءات',
    
    payNow: 'ادفع الآن',
    uploadProof: 'ارفع إثبات الدفع',
    paymentReference: 'رقم المرجع',
    paymentReferencePlaceholder: 'مرجع D17/فلوسي/تحويل',
    selectFile: 'اختر الصورة',
    submitPayment: 'إرسال الدفع',
    submitting: 'جاري الإرسال...',
    paymentSubmitted: 'تم إرسال الدفع للتحقق',
    
    paymentMethods: 'طرق الدفع',
    d17: 'D17',
    flouci: 'فلوسي',
    wireTransfer: 'تحويل بنكي',
    mandat: 'حوالة',
    
    noFees: 'ما فماش رسوم',
    noFeesDesc: 'كمّل خدمات باش تشوف الرسوم هنا',
    
    jobTitle: 'الخدمة',
    jobPrice: 'السعر',
    fee: 'الرسوم',
  },
};

interface JobFee {
  jobId: string;
  jobTitle: string;
  jobPrice: number;
  fee: number; // 10% min 5 TND
  completedAt: string;
}

interface WeeklyInvoice {
  id: string;
  weekStart: string;
  weekEnd: string;
  jobs: JobFee[];
  totalEarnings: number;
  totalFees: number;
  status: 'unpaid' | 'paid' | 'overdue' | 'pending_verification';
  dueDate: string;
  daysUntilDue: number;
  reminderSentAt?: string;
  warningSentAt?: string;
  paidAt?: string;
  paymentProofUrl?: string;
  paymentReference?: string;
}

// Calculate fee: 10% of job price, minimum 5 TND
function calculateFee(jobPrice: number): number {
  const percentFee = jobPrice * 0.10;
  return Math.max(percentFee, 5);
}

export default function WorkerFeesPage() {
  const { locale, setLocale, isClient } = useC74Locale();
  const t = translations[locale];

  const [invoices, setInvoices] = useState<WeeklyInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<WeeklyInvoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'d17' | 'flouci' | 'wire' | 'mandat'>('d17');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isClient) return;

    const loadInvoices = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/fees/my-invoices', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setInvoices([]);
          return;
        }

        const data = await response.json();
        setInvoices(data.invoices || []);
      } catch (error) {
        console.error('Error loading invoices:', error);
        setInvoices([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoices();
  }, []);

  const stats = {
    currentWeek: invoices.find(i => i.status === 'unpaid')?.totalFees || 0,
    pendingTotal: invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').reduce((sum, i) => sum + i.totalFees, 0),
    totalPaid: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalFees, 0),
    overdueCount: invoices.filter(i => i.status === 'overdue').length,
  };

  const getStatusBadge = (status: WeeklyInvoice['status']) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">{t.paid}</Badge>;
      case 'overdue': return <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">{t.overdue}</Badge>;
      case 'pending_verification': return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">{t.pendingVerification}</Badge>;
      case 'unpaid':
      default: return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">{t.unpaid}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      locale === 'ar-TN' ? 'ar-TN' : locale === 'fr' ? 'fr-FR' : 'en-US',
      { month: 'short', day: 'numeric' }
    );
  };

  const formatWeek = (start: string, end: string) => {
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const handleSubmitPayment = async () => {
    if (!selectedInvoice || !paymentReference.trim()) return;
    
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      const url = `/api/fees/${selectedInvoice.id}/submit-payment`;
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      let body: BodyInit;
      if (paymentFile) {
        const formData = new FormData();
        formData.append('payment_method', paymentMethod);
        formData.append('payment_reference', paymentReference.trim());
        formData.append('payment_proof', paymentFile);
        body = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          payment_method: paymentMethod,
          payment_reference: paymentReference.trim(),
        });
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to submit payment');
      }

      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === selectedInvoice.id
            ? { ...inv, status: 'pending_verification' as const, paymentReference: paymentReference.trim() }
            : inv
        )
      );

      setSubmitMessage(t.paymentSubmitted);
      setTimeout(() => {
        setSelectedInvoice(null);
        setPaymentReference('');
        setPaymentFile(null);
        setSubmitMessage(null);
      }, 2000);
    } catch (error) {
      console.error('Submit payment error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-neutral-50 dark:bg-neutral-900"
    >
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getWorkerMenuItems(locale, 'fees')}
        title={t.title}
        subtitle={t.subtitle}
      />

      {isClient && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Fee Explanation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              <strong>ℹ️</strong> {t.feeExplanation}
            </p>
            <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">{t.weeklyInvoice}</p>
          </div>

          {/* Overdue Warning */}
          {stats.overdueCount > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className={`flex items-center gap-3`}>
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-300">{t.warningSent}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{t.suspensionWarning}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className={`flex items-center gap-3`}>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {stats.currentWeek.toFixed(0)} <span className="text-sm font-normal">TND</span>
                    </p>
                    <p className="text-sm text-neutral-500">{t.currentWeekFees}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={stats.pendingTotal > 0 ? 'border-amber-300' : ''}>
              <CardContent className="p-4">
                <div className={`flex items-center gap-3`}>
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">
                      {stats.pendingTotal.toFixed(0)} <span className="text-sm font-normal">TND</span>
                    </p>
                    <p className="text-sm text-neutral-500">{t.pendingPayment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className={`flex items-center gap-3`}>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.totalPaid.toFixed(0)} <span className="text-sm font-normal">TND</span>
                    </p>
                    <p className="text-sm text-neutral-500">{t.totalPaid}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className={`flex items-center gap-3`}>
                  <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{t.paymentMethods}</p>
                    <p className="text-xs text-neutral-500">D17, Flouci, Wire</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2`}>
                <FileText className="w-5 h-5" />
                {t.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-12 text-center text-neutral-500">Loading...</div>
              ) : invoices.length === 0 ? (
                <div className="py-12 text-center">
                  <Briefcase className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="font-medium text-neutral-700 dark:text-neutral-300">{t.noFees}</p>
                  <p className="text-sm text-neutral-500 mt-1">{t.noFeesDesc}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map(invoice => (
                    <div
                      key={invoice.id}
                      className={`border rounded-lg p-4 ${
                        invoice.status === 'overdue' ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : ''
                      }`}
                    >
                      <div className={`flex items-center justify-between mb-3`}>
                        <div>
                          <p className="font-medium text-lg">{formatWeek(invoice.weekStart, invoice.weekEnd)}</p>
                          <p className="text-sm text-neutral-500">
                            {invoice.jobs.length} {t.jobsCompleted} • {t.totalEarnings}: {invoice.totalEarnings} TND
                          </p>
                        </div>
                        <div className={`flex items-center gap-3`}>
                          {getStatusBadge(invoice.status)}
                          <span className="text-xl font-bold">{invoice.totalFees.toFixed(1)} TND</span>
                        </div>
                      </div>

                      {/* Jobs breakdown */}
                      <div className="bg-neutral-50 dark:bg-neutral-800 rounded p-3 mb-3">
                        {invoice.jobs.map(job => (
                          <div key={job.jobId} className={`flex justify-between text-sm py-1`}>
                            <span>{job.jobTitle}</span>
                            <span className="text-neutral-500">
                              {job.jobPrice} TND → <span className="text-primary-600 font-medium">{job.fee} TND</span>
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Timeline warning */}
                      {invoice.status === 'overdue' && (
                        <div className={`flex items-center gap-2 text-sm text-red-600 mb-3`}>
                          <AlertCircle className="w-4 h-4" />
                          <span>{t.warningSent}</span>
                        </div>
                      )}

                      {invoice.status === 'unpaid' && invoice.daysUntilDue > 0 && (
                        <div className={`flex items-center gap-2 text-sm text-neutral-500 mb-3`}>
                          <Clock className="w-4 h-4" />
                          <span>{invoice.daysUntilDue} {t.daysRemaining}</span>
                        </div>
                      )}

                      {/* Actions */}
                      {(invoice.status === 'unpaid' || invoice.status === 'overdue') && (
                        <Button 
                          onClick={() => setSelectedInvoice(invoice)}
                          className="w-full"
                          variant={invoice.status === 'overdue' ? 'destructive' : 'default'}
                        >
                          <Upload className={`w-4 h-4 me-2`} />
                          {t.payNow}
                        </Button>
                      )}

                      {invoice.status === 'pending_verification' && (
                        <div className={`flex items-center gap-2 text-blue-600`}>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t.pendingVerification}</span>
                        </div>
                      )}

                      {invoice.status === 'paid' && (
                        <div className={`flex items-center gap-2 text-green-600`}>
                          <CheckCircle className="w-4 h-4" />
                          <span>{t.paid} - {formatDate(invoice.paidAt!)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className={`flex items-center justify-between`}>
                <CardTitle>{t.uploadProof}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <CardDescription>
                {formatWeek(selectedInvoice.weekStart, selectedInvoice.weekEnd)} • <strong>{selectedInvoice.totalFees.toFixed(1)} TND</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {submitMessage ? (
                <div className="py-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-green-600 font-medium">{submitMessage}</p>
                </div>
              ) : (
                <>
                  {/* Payment Methods Info */}
                  <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                    <p className="text-sm font-medium mb-2">{t.paymentMethods}:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {t.d17}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        {t.flouci}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        {t.wireTransfer}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        {t.mandat}
                      </div>
                    </div>
                  </div>

                  {/* Payment Reference */}
                  <div className="space-y-2">
                    <Label htmlFor="payment-method">{t.paymentMethods}</Label>
                    <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
                      <SelectTrigger className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">
                          {locale === 'ar-TN' ? 'تحويل بنكي' : locale === 'fr' ? 'Virement bancaire' : 'Bank Transfer'}
                        </SelectItem>
                        <SelectItem value="credit_card">
                          {locale === 'ar-TN' ? 'بطاقة ائتمان' : locale === 'fr' ? 'Carte de crédit' : 'Credit Card'}
                        </SelectItem>
                        <SelectItem value="cash">
                          {locale === 'ar-TN' ? 'نقدي' : locale === 'fr' ? 'Espèces' : 'Cash'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference">{t.paymentReference}</Label>
                    <Input
                      id="reference"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder={t.paymentReferencePlaceholder}
                    />
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>{t.selectFile}</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary-500">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="payment-proof"
                        onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                      />
                      <label htmlFor="payment-proof" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                        {paymentFile ? (
                          <p className="text-sm text-green-600">{paymentFile.name}</p>
                        ) : (
                          <p className="text-sm text-neutral-500">{t.selectFile}</p>
                        )}
                      </label>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleSubmitPayment}
                    disabled={isSubmitting || !paymentReference.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin me-2" />
                        {t.submitting}
                      </>
                    ) : (
                      t.submitPayment
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
