'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Wrench,
  Zap,
  Wind,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Star,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertCircle,
  Loader2,
  Eye,
  Flag,
  PlayCircle,
} from 'lucide-react';
import type { Locale } from '@/i18n-routing';
import { ReportIssueModal } from '@/components/ReportIssueModal';

const translations = {
  en: {
    jobDetails: 'Job Details',
    status: 'Status',
    category: 'Category',
    description: 'Description',
    location: 'Location',
    schedule: 'Schedule',
    options: 'Options',
    inspectionRequired: 'Inspection Required',
    priceAfterInspection: 'Price After Inspection',
    postedOn: 'Posted on',
    
    // Status labels
    requested: 'Waiting for Workers',
    accepted: 'Accepted',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    disputed: 'Disputed',
    
    // Time slots
    morning: 'Morning (8AM-12PM)',
    afternoon: 'Afternoon (12PM-5PM)',
    evening: 'Evening (5PM-9PM)',
    
    // Categories
    plumbing: 'Plumbing',
    electrical: 'Electrical',
    ac: 'AC Maintenance',
    cleaning: 'Cleaning',
    
    // Applications section
    applications: 'Applications',
    noApplications: 'No applications yet',
    waitingForWorkers: 'Waiting for workers to apply...',
    proposedPrice: 'Proposed Price',
    acceptApplication: 'Accept',
    rejectApplication: 'Reject',
    viewProfile: 'View Profile',
    completedJobs: 'jobs completed',
    
    // Assigned worker
    assignedWorker: 'Assigned Worker',
    priceAgreed: 'Agreed Price',
    contactWorker: 'Contact Worker',
    
    // Actions
    cancelJob: 'Cancel Job',
    markInProgress: 'Mark In Progress',
    markCompleted: 'Mark Completed',
    reportIssue: 'Report Issue',
    leaveReview: 'Leave Review',
    
    // Confirmations
    confirmCancel: 'Are you sure you want to cancel this job?',
    confirmAccept: 'Accept this worker for the job?',
    
    // Messages
    applicationAccepted: 'Application accepted!',
    applicationRejected: 'Application rejected',
    jobCancelled: 'Job cancelled',
    statusUpdated: 'Status updated',
    errorOccurred: 'An error occurred',
  },
  fr: {
    jobDetails: 'Détails du Travail',
    status: 'Statut',
    category: 'Catégorie',
    description: 'Description',
    location: 'Lieu',
    schedule: 'Horaire',
    options: 'Options',
    inspectionRequired: 'Inspection Requise',
    priceAfterInspection: 'Prix Après Inspection',
    postedOn: 'Publié le',
    
    requested: 'En attente de travailleurs',
    accepted: 'Accepté',
    scheduled: 'Planifié',
    in_progress: 'En Cours',
    completed: 'Terminé',
    cancelled: 'Annulé',
    disputed: 'Litigieux',
    
    morning: 'Matin (8h-12h)',
    afternoon: 'Après-midi (12h-17h)',
    evening: 'Soir (17h-21h)',
    
    plumbing: 'Plomberie',
    electrical: 'Électricité',
    ac: 'Climatisation',
    cleaning: 'Nettoyage',
    
    applications: 'Candidatures',
    noApplications: 'Aucune candidature pour le moment',
    waitingForWorkers: 'En attente de candidatures...',
    proposedPrice: 'Prix Proposé',
    acceptApplication: 'Accepter',
    rejectApplication: 'Refuser',
    viewProfile: 'Voir Profil',
    completedJobs: 'travaux terminés',
    
    assignedWorker: 'Travailleur Assigné',
    priceAgreed: 'Prix Convenu',
    contactWorker: 'Contacter',
    
    cancelJob: 'Annuler',
    markInProgress: 'Marquer En Cours',
    markCompleted: 'Marquer Terminé',
    reportIssue: 'Signaler un Problème',
    leaveReview: 'Laisser un Avis',
    
    confirmCancel: 'Êtes-vous sûr de vouloir annuler ce travail?',
    confirmAccept: 'Accepter ce travailleur?',
    
    applicationAccepted: 'Candidature acceptée!',
    applicationRejected: 'Candidature refusée',
    jobCancelled: 'Travail annulé',
    statusUpdated: 'Statut mis à jour',
    errorOccurred: 'Une erreur est survenue',
  },
  'ar-TN': {
    jobDetails: 'تفاصيل الطلب',
    status: 'الحالة',
    category: 'الفئة',
    description: 'الوصف',
    location: 'المكان',
    schedule: 'الموعد',
    options: 'الخيارات',
    inspectionRequired: 'معاينة مطلوبة',
    priceAfterInspection: 'السعر بعد المعاينة',
    postedOn: 'تم النشر في',
    
    requested: 'في انتظار العمال',
    accepted: 'مقبول',
    scheduled: 'مجدول',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    disputed: 'متنازع عليه',
    
    morning: 'الصباح (8-12)',
    afternoon: 'بعد الظهر (12-5)',
    evening: 'المساء (5-9)',
    
    plumbing: 'السباكة',
    electrical: 'الكهرباء',
    ac: 'التكييف',
    cleaning: 'التنظيف',
    
    applications: 'الطلبات',
    noApplications: 'ما فماش طلبات بعد',
    waitingForWorkers: 'في انتظار طلبات العمال...',
    proposedPrice: 'السعر المقترح',
    acceptApplication: 'قبول',
    rejectApplication: 'رفض',
    viewProfile: 'شوف الملف',
    completedJobs: 'خدمة مكملة',
    
    assignedWorker: 'العامل المكلف',
    priceAgreed: 'السعر المتفق عليه',
    contactWorker: 'تواصل',
    
    cancelJob: 'إلغاء',
    markInProgress: 'علّم قيد التنفيذ',
    markCompleted: 'علّم مكتمل',
    reportIssue: 'بلّغ عن مشكلة',
    leaveReview: 'اترك تقييم',
    
    confirmCancel: 'متأكد تحب تلغي هذا الطلب؟',
    confirmAccept: 'تقبل هذا العامل؟',
    
    applicationAccepted: 'تم قبول الطلب!',
    applicationRejected: 'تم رفض الطلب',
    jobCancelled: 'تم إلغاء الطلب',
    statusUpdated: 'تم تحديث الحالة',
    errorOccurred: 'صار خطأ',
  },
};

interface Application {
  id: string;
  worker_id: string;
  worker_name: string;
  worker_rating: number;
  worker_completed_jobs: number;
  proposed_price: number;
  message: string;
  status: string;
  created_at: string;
}

interface Job {
  id: string;
  category: string;
  description: string;
  address: string;
  address_details?: string;
  photos?: string[];
  inspection_required?: boolean;
  price_after_inspection?: boolean;
  preferred_date: string;
  preferred_time_slot: string;
  status: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  worker_id?: string;
  worker_name?: string;
  worker_phone?: string;
  worker_rating?: number;
  price_agreed?: number;
  created_at: string;
  updated_at: string;
  applicant_count: number;
  applications?: Application[];
}

interface JobDetailsProps {
  job: Job;
  locale: Locale;
  isCustomer?: boolean;
  onRefresh?: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  plumbing: <Wrench className="w-5 h-5" />,
  electrical: <Zap className="w-5 h-5" />,
  ac: <Wind className="w-5 h-5" />,
  cleaning: <Sparkles className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  plumbing: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  electrical: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400',
  ac: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-400',
  cleaning: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
};

const statusColors: Record<string, string> = {
  requested: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  accepted: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  in_progress: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  cancelled: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  disputed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function JobDetails({ job, locale, isCustomer = true, onRefresh }: JobDetailsProps) {
  const t = translations[locale];
  
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'ar-TN' ? 'ar-TN' : locale === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleAcceptApplication = async (applicationId: string) => {
    if (!confirm(t.confirmAccept)) return;
    
    setIsLoading(applicationId);
    try {
      const response = await fetch(`/api/applications/${applicationId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: t.applicationAccepted });
        onRefresh?.();
      } else {
        setMessage({ type: 'error', text: t.errorOccurred });
      }
    } catch {
      setMessage({ type: 'error', text: t.errorOccurred });
    } finally {
      setIsLoading(null);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    setIsLoading(applicationId);
    try {
      const response = await fetch(`/api/applications/${applicationId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: t.applicationRejected });
        onRefresh?.();
      } else {
        setMessage({ type: 'error', text: t.errorOccurred });
      }
    } catch {
      setMessage({ type: 'error', text: t.errorOccurred });
    } finally {
      setIsLoading(null);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (newStatus === 'cancelled' && !confirm(t.confirmCancel)) return;
    
    setIsLoading(newStatus);
    try {
      const response = await fetch(`/api/jobs/${job.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: t.statusUpdated });
        onRefresh?.();
      } else {
        setMessage({ type: 'error', text: t.errorOccurred });
      }
    } catch {
      setMessage({ type: 'error', text: t.errorOccurred });
    } finally {
      setIsLoading(null);
    }
  };

  const getStatusLabel = (status: string) => t[status as keyof typeof t] || status;
  const getCategoryLabel = (cat: string) => t[cat as keyof typeof t] || cat;
  const getTimeSlotLabel = (slot: string) => t[slot as keyof typeof t] || slot;

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <span className={message.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
            {message.text}
          </span>
        </div>
      )}

      {/* Main Job Card */}
      <Card>
        <CardHeader>
          <div className={`flex items-start justify-between`}>
            <div className={`flex items-center gap-3`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${categoryColors[job.category] || 'bg-neutral-100'}`}>
                {categoryIcons[job.category]}
              </div>
              <div>
                <CardTitle>{getCategoryLabel(job.category)}</CardTitle>
                <CardDescription>{t.postedOn} {formatDate(job.created_at)}</CardDescription>
              </div>
            </div>
            <Badge className={statusColors[job.status]}>
              {getStatusLabel(job.status)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">{t.description}</h4>
            <p className="text-neutral-900 dark:text-neutral-100">{job.description}</p>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">{t.location}</h4>
            <div className={`flex items-center gap-2`}>
              <MapPin className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-900 dark:text-neutral-100">
                {job.address}
                {job.address_details && ` - ${job.address_details}`}
              </span>
            </div>
          </div>

          {/* Schedule */}
          <div className={`grid grid-cols-2 gap-4 `}>
            <div>
              <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                <Calendar className={`w-4 h-4 inline me-1`} />
                {t.schedule}
              </h4>
              <p className="text-neutral-900 dark:text-neutral-100">{formatDate(job.preferred_date)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                <Clock className={`w-4 h-4 inline me-1`} />
                {getTimeSlotLabel(job.preferred_time_slot)}
              </h4>
            </div>
          </div>

          {/* Options */}
          {(job.inspection_required || job.price_after_inspection) && (
            <div>
              <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">{t.options}</h4>
              <div className={`flex gap-2 flex-wrap`}>
                {job.inspection_required && (
                  <Badge variant="outline">
                    <Eye className={`w-3 h-3 me-1`} />
                    {t.inspectionRequired}
                  </Badge>
                )}
                {job.price_after_inspection && (
                  <Badge variant="outline">{t.priceAfterInspection}</Badge>
                )}
              </div>
            </div>
          )}

          {/* Assigned Worker (if job is in progress or completed) */}
          {job.worker_id && job.worker_name && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-3">{t.assignedWorker}</h4>
              <div className={`flex items-center justify-between`}>
                <div className={`flex items-center gap-3`}>
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-green-600 text-white">
                      {job.worker_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">{job.worker_name}</p>
                    <div className={`flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400`}>
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{job.worker_rating}</span>
                    </div>
                  </div>
                </div>
                <div className={`text-end me-2`}>
                  {job.price_agreed && (
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {job.price_agreed} TND
                    </p>
                  )}
                  <Button size="sm" variant="outline" className="mt-2">
                    <Phone className={`w-4 h-4 me-1`} />
                    {t.contactWorker}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {isCustomer && (
            <div className={`flex gap-2 flex-wrap pt-4 border-t`}>
              {job.status === 'requested' && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleUpdateStatus('cancelled')}
                  disabled={isLoading === 'cancelled'}
                >
                  {isLoading === 'cancelled' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className={`w-4 h-4 me-1`} />}
                  {t.cancelJob}
                </Button>
              )}
              {job.status === 'accepted' && (
                <Button 
                  size="sm"
                  onClick={() => handleUpdateStatus('in_progress')}
                  disabled={isLoading === 'in_progress'}
                >
                  {isLoading === 'in_progress' ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className={`w-4 h-4 me-1`} />}
                  {t.markInProgress}
                </Button>
              )}
              {job.status === 'in_progress' && (
                <>
                  <Button 
                    size="sm"
                    onClick={() => handleUpdateStatus('completed')}
                    disabled={isLoading === 'completed'}
                  >
                    {isLoading === 'completed' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className={`w-4 h-4 me-1`} />}
                    {t.markCompleted}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowReportModal(true)}>
                    <Flag className={`w-4 h-4 me-1`} />
                    {t.reportIssue}
                  </Button>
                </>
              )}
              {job.status === 'completed' && (
                <>
                  <Button size="sm">
                    <Star className={`w-4 h-4 me-1`} />
                    {t.leaveReview}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowReportModal(true)}>
                    <Flag className={`w-4 h-4 me-1`} />
                    {t.reportIssue}
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applications Section (only for requested jobs) */}
      {job.status === 'requested' && isCustomer && (
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2`}>
              <User className="w-5 h-5" />
              {t.applications} ({job.applicant_count || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!job.applications || job.applications.length === 0) ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">{t.noApplications}</p>
                <p className="text-sm text-neutral-500 mt-1">{t.waitingForWorkers}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {job.applications.map((app) => (
                  <div 
                    key={app.id} 
                    className={`p-4 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors `}
                  >
                    <div className={`flex items-start justify-between`}>
                      <div className={`flex items-center gap-3`}>
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary-600 text-white">
                            {app.worker_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">{app.worker_name}</p>
                          <div className={`flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400`}>
                            <span className={`flex items-center gap-1`}>
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              {app.worker_rating}
                            </span>
                            <span>{app.worker_completed_jobs} {t.completedJobs}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-end me-2`}>
                        <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          {app.proposed_price} TND
                        </p>
                        <p className="text-xs text-neutral-500">{t.proposedPrice}</p>
                      </div>
                    </div>
                    
                    <p className="mt-3 text-neutral-700 dark:text-neutral-300 text-sm">
                      "{app.message}"
                    </p>
                    
                    <div className={`flex gap-2 mt-4`}>
                      <Button 
                        size="sm"
                        onClick={() => handleAcceptApplication(app.id)}
                        disabled={isLoading === app.id}
                      >
                        {isLoading === app.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className={`w-4 h-4 me-1`} />
                        )}
                        {t.acceptApplication}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRejectApplication(app.id)}
                        disabled={isLoading === app.id}
                      >
                        <XCircle className={`w-4 h-4 me-1`} />
                        {t.rejectApplication}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className={`w-4 h-4 me-1`} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        jobId={job.id}
        jobTitle={job.category}
        locale={locale}
        isWithinGuarantee={job.status === 'completed' || job.status === 'in_progress'}
      />
    </div>
  );
}
