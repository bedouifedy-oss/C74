'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/hooks/useLocale';
import { Link } from '@/lib/i18n';
import { 
  MapPin, 
  Calendar, 
  Briefcase, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  TrendingUp,
  Search
} from 'lucide-react';
import { HeaderMenu, getWorkerMenuItems } from '@/components/HeaderMenu';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import WorkerApplicationsView from '@/components/worker/WorkerApplicationsView';

type JobApplication = {
  id: string;
  job_id: string;
  worker_id: string;
  message?: string;
  proposed_budget?: number;
  status: string;
  created_at: string;
  job_title?: string;
  job_category?: string;
  job_location?: string;
  job_budget?: number;
};

const translations = {
  en: {
    dashboard: 'Worker Dashboard',
    welcome: 'Welcome back!',
    
    // Stats
    pendingApplications: 'Pending',
    acceptedApplications: 'Accepted',
    rejectedApplications: 'Rejected',
    totalApplications: 'Total Applications',
    
    // Sections
    browseJobs: 'Browse Available Jobs',
    browseJobsDesc: 'Find new job opportunities in your area',
    findJobs: 'Find Jobs',
    
    recentApplications: 'Recent Applications',
    viewAllApplications: 'View All',
    noApplications: 'No applications yet',
    noApplicationsDesc: 'Start applying to jobs to see your applications here',
    
    // Application status
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    appliedOn: 'Applied',
  },
  fr: {
    dashboard: 'Tableau de bord',
    welcome: 'Bon retour!',
    
    pendingApplications: 'En attente',
    acceptedApplications: 'Acceptées',
    rejectedApplications: 'Refusées',
    totalApplications: 'Total des candidatures',
    
    browseJobs: 'Parcourir les emplois',
    browseJobsDesc: 'Trouvez de nouvelles opportunités dans votre région',
    findJobs: 'Trouver des emplois',
    
    recentApplications: 'Candidatures récentes',
    viewAllApplications: 'Voir tout',
    noApplications: 'Aucune candidature',
    noApplicationsDesc: 'Commencez à postuler pour voir vos candidatures ici',
    
    pending: 'En attente',
    accepted: 'Acceptée',
    rejected: 'Refusée',
    appliedOn: 'Postulé le',
  },
  'ar-TN': {
    dashboard: 'لوحة التحكم',
    welcome: 'مرحباً بعودتك!',
    
    pendingApplications: 'قيد الانتظار',
    acceptedApplications: 'مقبولة',
    rejectedApplications: 'مرفوضة',
    totalApplications: 'مجموع الطلبات',
    
    browseJobs: 'تصفح الوظائف',
    browseJobsDesc: 'لقى فرص خدمة جديدة في منطقتك',
    findJobs: 'لقى خدمات',
    
    recentApplications: 'آخر الطلبات',
    viewAllApplications: 'شوف الكل',
    noApplications: 'ما فماش طلبات',
    noApplicationsDesc: 'قدّم على خدمات باش تشوف طلباتك هنا',
    
    pending: 'قيد الانتظار',
    accepted: 'مقبول',
    rejected: 'مرفوض',
    appliedOn: 'قدّمت في',
  }
};

export default function WorkerDashboardPage() {
  const { locale, setLocale, isClient } = useLocale();
  const t = translations[locale];

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in and is a worker
  useEffect(() => {
    if (!isClient) return;

    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (!token || !userData) {
      window.location.href = `/${locale}/signup`;
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user.role !== 'worker') {
        window.location.href = `/${locale}/customer/dashboard`;
        return;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      window.location.href = `/${locale}/signup`;
      return;
    }
  }, [isClient, locale]);

  // Fetch applications
  useEffect(() => {
    if (!isClient) return;

    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/applications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setApplications(data.applications || []);
        } else {
          setApplications([]);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [isClient]);

  const stats = {
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    total: applications.length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
      case 'accepted': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return t.pending;
      case 'accepted': return t.accepted;
      case 'rejected': return t.rejected;
      default: return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      locale === 'ar-TN' ? 'ar-TN' : locale === 'fr' ? 'fr-FR' : 'en-US',
      { month: 'short', day: 'numeric' }
    );
  };

  const recentApplications = applications.slice(0, 5);

  return (
    <div
      className="min-h-screen bg-neutral-50 dark:bg-neutral-900"
    >
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getWorkerMenuItems(locale, 'dashboard')}
        title={t.dashboard}
        subtitle={t.welcome}
      />

      {!isClient && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-neutral-600 dark:text-neutral-400">Loading...</div>
        </div>
      )}

      {isClient && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className={`flex items-center gap-3`}>
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.pending}</p>
                    <p className="text-sm text-neutral-500">{t.pendingApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className={`flex items-center gap-3`}>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.accepted}</p>
                    <p className="text-sm text-neutral-500">{t.acceptedApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className={`flex items-center gap-3`}>
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.rejected}</p>
                    <p className="text-sm text-neutral-500">{t.rejectedApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className={`flex items-center gap-3`}>
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.total}</p>
                    <p className="text-sm text-neutral-500">{t.totalApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Browse Jobs CTA */}
          <Card className="mb-8 bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0">
            <CardContent className="p-6">
              <div className={`flex items-center justify-between`}>
                <div className={`flex items-center gap-4`}>
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <Search className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{t.browseJobs}</h3>
                    <p className="text-primary-100">{t.browseJobsDesc}</p>
                  </div>
                </div>
                <Link href="/worker/jobs">
                  <Button variant="secondary" size="lg" className={`flex items-center gap-2`}>
                    {t.findJobs}
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Applications, Offers, and Contracts */}
          <WorkerApplicationsView />
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav locale={locale} userRole="worker" />
    </div>
  );
}
