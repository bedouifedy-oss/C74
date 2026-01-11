'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, MapPin, Calendar, User, Mail, Phone, CheckCircle, XCircle, MessageSquare, Star, Search } from 'lucide-react';
import MessageModal from '@/components/MessageModal';
import { HeaderMenu, getCustomerMenuItems } from '@/components/HeaderMenu';

import { useLocale } from '@/hooks/useLocale';

const translations = {
  en: {
    applications: 'Job Applications',
    myJobs: 'My Jobs',
    manageApplications: 'Manage Applications',
    searchApplications: 'Search Applications',
    filterByStatus: 'Filter by Status',
    all: 'All',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    applicant: 'Applicant',
    message: 'Message',
    acceptApplication: 'Accept Application',
    rejectApplication: 'Reject Application',
    leaveReview: 'Leave Review',
    contactWorker: 'Contact Worker',
    noApplications: 'No applications yet',
    acceptConfirm: 'Are you sure you want to accept this application?',
    rejectConfirm: 'Are you sure you want to reject this application?',
    applicationAccepted: 'Application accepted successfully!',
    applicationRejected: 'Application rejected successfully!',
    error: 'An error occurred',
    postedOn: 'Posted on'
  },
  fr: {
    applications: 'Candidatures',
    myJobs: 'Mes emplois',
    manageApplications: 'Gérer les candidatures',
    searchApplications: 'Rechercher des candidatures',
    filterByStatus: 'Filtrer par statut',
    all: 'Tous',
    pending: 'En attente',
    accepted: 'Accepté',
    rejected: 'Rejeté',
    applicant: 'Candidat',
    message: 'Message',
    acceptApplication: 'Accepter la candidature',
    rejectApplication: 'Rejeter la candidature',
    leaveReview: 'Laisser un avis',
    contactWorker: 'Contacter le travailleur',
    noApplications: 'Aucune candidature yet',
    acceptConfirm: 'Êtes-vous sûr de vouloir accepter cette candidature?',
    rejectConfirm: 'Êtes-vous sûr de vouloir rejeter cette candidature?',
    applicationAccepted: 'Candidature acceptée avec succès!',
    applicationRejected: 'Candidature rejetée avec succès!',
    error: 'Une erreur est survenue',
    postedOn: 'Publié le'
  },
  'ar-TN': {
    applications: 'الطلبات',
    myJobs: 'وظائفي',
    manageApplications: 'إدارة الطلبات',
    searchApplications: 'البحث عن الطلبات',
    filterByStatus: 'تصفية حسب الحالة',
    all: 'الكل',
    pending: 'معلق',
    accepted: 'مقبول',
    rejected: 'مرفوض',
    applicant: 'المتقدم',
    message: 'الرسالة',
    acceptApplication: 'قبول الطلب',
    rejectApplication: 'رفض الطلب',
    leaveReview: 'ترك تقييم',
    contactWorker: 'تواصل مع العامل',
    noApplications: 'لا توجد طلبات بعد',
    acceptConfirm: 'هل أنت متأكد من قبول هذا الطلب؟',
    rejectConfirm: 'هل أنت متأكد من رفض هذا الطلب؟',
    applicationAccepted: 'تم قبول الطلب بنجاح!',
    applicationRejected: 'تم رفض الطلب بنجاح!',
    error: 'حدث خطأ',
    postedOn: 'نشر في'
  }
};

type Application = {
  id: string;
  job_id: string;
  job_title?: string;
  job_category?: string;
  job_location?: string;
  job_budget?: number;
  worker_id: string;
  worker_name?: string;
  worker_phone?: string;
  worker_email?: string;
  worker_rating?: number;
  worker_completed_jobs?: number;
  status: string;
  message?: string;
  proposed_budget?: number;
  created_at: string;
};

export default function CustomerApplicationsPage() {
  const { locale, setLocale, isClient } = useLocale();
  const t = translations[locale];

  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageUserId, setMessageUserId] = useState('');
  const [messageUserName, setMessageUserName] = useState('');

  // Check if user is logged in and is a customer (only on initial mount)
  useEffect(() => {
    if (!isClient) return;

    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (!token || !userData) {
      window.location.href = `/${locale}/signup`;
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'customer') {
      window.location.href = `/${locale}/worker/dashboard`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]); // Only run on mount, not on locale change

  // Fetch applications
  useEffect(() => {
    if (!isClient) return;

    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        const user = userData ? JSON.parse(userData) : null;
        
        const response = await fetch('/api/applications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setApplications(data.applications || []);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    fetchApplications();
  }, [isClient]);

  const filteredApplications = applications.filter((app) => {
    const workerName = app.worker_name || '';
    const jobTitle = app.job_title || '';
    const message = app.message || '';

    const matchesSearch =
      workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleAcceptApplication = async (applicationId: string) => {
    if (!confirm(t.acceptConfirm)) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/applications/${applicationId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        setApplications((apps) => apps.map((app) => (app.id === applicationId ? { ...app, status: 'accepted' } : app)));
        alert(t.applicationAccepted);
      } else {
        alert(t.error);
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      alert(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    if (!confirm(t.rejectConfirm)) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/applications/${applicationId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        setApplications((apps) => apps.map((app) => (app.id === applicationId ? { ...app, status: 'rejected' } : app)));
        alert(t.applicationRejected);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageWorker = (application: Application) => {
    setMessageUserId(application.worker_id);
    setMessageUserName(application.worker_name || '');
    setMessageModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t.pending;
      case 'accepted':
        return t.accepted;
      case 'rejected':
        return t.rejected;
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200">
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getCustomerMenuItems(locale, 'applications')}
        title={t.manageApplications}
        subtitle={t.myJobs}
      />

      {!isClient && (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
          <div className="text-neutral-600 dark:text-neutral-400">
            {locale === 'ar-TN' ? 'جاري التحميل...' : locale === 'fr' ? 'Chargement...' : 'Loading...'}
          </div>
        </div>
      )}

      {isClient && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4"
                />
                <Input
                  type="text"
                  placeholder={t.searchApplications}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ps-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    <SelectItem value="pending">{t.pending}</SelectItem>
                    <SelectItem value="accepted">{t.accepted}</SelectItem>
                    <SelectItem value="rejected">{t.rejected}</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">{t.noApplications}</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {locale === 'ar-TN'
                  ? 'لا توجد طلبات جديدة حتى الآن'
                  : locale === 'fr'
                    ? 'Aucune nouvelle candidature pour le moment'
                    : 'No new applications yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{application.job_title}</h4>
                      <div className="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {application.job_location || 'Location not specified'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          TND {application.job_budget || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {t.postedOn} {new Date(application.created_at).toLocaleDateString(locale)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-semibold text-neutral-900 dark:text-neutral-100">{t.applicant}</h5>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                            {getStatusLabel(application.status)}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900 dark:text-neutral-100">{application.worker_name}</p>
                              <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                {application.worker_rating} ({application.worker_completed_jobs}{' '}
                                {locale === 'ar-TN' ? 'وظيفة' : locale === 'fr' ? 'emplois' : 'jobs'})
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-neutral-400" />
                              <span>{application.worker_phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-neutral-400" />
                              <span>{application.worker_email}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">{t.message}</h5>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-4">{application.message}</p>

                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={() => handleMessageWorker(application)}>
                            <MessageSquare className="w-4 h-4 me-2" />
                            {t.contactWorker}
                          </Button>

                          {application.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => handleAcceptApplication(application.id)}
                                disabled={isLoading}
                              >
                                <CheckCircle className="w-4 h-4 me-2" />
                                {t.acceptApplication}
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleRejectApplication(application.id)}
                                disabled={isLoading}
                              >
                                <XCircle className="w-4 h-4 me-2" />
                                {t.rejectApplication}
                              </Button>
                            </>
                          )}

                          {application.status === 'accepted' && (
                            <Button variant="outline" className="flex-1">
                              <Star className="w-4 h-4 me-2" />
                              {t.leaveReview}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <MessageModal
        isOpen={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        currentUserId={(() => {
          try {
            const userData = localStorage.getItem('user_data');
            const user = userData ? JSON.parse(userData) : null;
            return user?.id || '';
          } catch {
            return '';
          }
        })()}
        otherUserId={messageUserId}
        otherUserName={messageUserName}
        locale={locale}
      />
    </div>
  );
}
