'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from '@/lib/i18n';
import { useLocale as useC74Locale } from '@/hooks/useLocale';
import { HeaderMenu, getCustomerMenuItems } from '@/components/HeaderMenu';
import JobDetails from '@/components/jobs/JobDetails';

const pageTranslations = {
  en: {
    title: 'Job Details',
    subtitle: 'View and manage your job request',
    backToDashboard: 'Back to Dashboard',
    loading: 'Loading job details...',
    notFound: 'Job not found',
    notFoundDesc: 'The job you are looking for does not exist or has been removed.',
    errorLoading: 'Error loading job',
    tryAgain: 'Try Again',
  },
  fr: {
    title: 'Détails du Travail',
    subtitle: 'Voir et gérer votre demande',
    backToDashboard: 'Retour au tableau de bord',
    loading: 'Chargement des détails...',
    notFound: 'Travail non trouvé',
    notFoundDesc: 'Le travail que vous recherchez n\'existe pas ou a été supprimé.',
    errorLoading: 'Erreur de chargement',
    tryAgain: 'Réessayer',
  },
  'ar-TN': {
    title: 'تفاصيل الطلب',
    subtitle: 'شوف وتصرف في طلبك',
    backToDashboard: 'رجوع للوحة التحكم',
    loading: 'جاري التحميل...',
    notFound: 'الطلب غير موجود',
    notFoundDesc: 'الطلب اللي تحوس عليه ما موجودش أو تم حذفه.',
    errorLoading: 'خطأ في التحميل',
    tryAgain: 'حاول مرة أخرى',
  },
};

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const { locale, setLocale } = useC74Locale();
  const t = pageTranslations[locale];

  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      
      if (response.ok && data.job) {
        setJob(data.job);
      } else {
        setError(data.error || t.notFound);
      }
    } catch (err) {
      console.error('Error fetching job:', err);
      setError(t.errorLoading);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  return (
    <div
      className="min-h-screen bg-neutral-50 dark:bg-neutral-900"
    >
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getCustomerMenuItems(locale, 'job-details')}
        title={t.title}
        subtitle={t.subtitle}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/customer/dashboard"
          className={`inline-flex items-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 mb-6`}
        >
          <ArrowLeft className={`w-4 h-4 me-2 rtl:rotate-180`} />
          {t.backToDashboard}
        </Link>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">{t.loading}</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">😕</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              {t.notFound}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {t.notFoundDesc}
            </p>
            <div className={`flex gap-3 justify-center`}>
              <Link href="/customer/dashboard">
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  {t.backToDashboard}
                </button>
              </Link>
              <button 
                onClick={fetchJob}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                {t.tryAgain}
              </button>
            </div>
          </div>
        )}

        {/* Job Details */}
        {!isLoading && !error && job && (
          <JobDetails
            job={job}
            locale={locale}
            isCustomer={true}
            onRefresh={fetchJob}
          />
        )}
      </div>
    </div>
  );
}
