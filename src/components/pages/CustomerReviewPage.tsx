'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/hooks/useLocale';
import RatingComponent from '@/components/RatingComponent';
import ReviewsDisplay from '@/components/ReviewsDisplay';
import { ArrowLeft, Star, CheckCircle } from 'lucide-react';
import { HeaderMenu, getCustomerMenuItems } from '@/components/HeaderMenu';

const translations = {
  en: {
    leaveReview: 'Leave a Review',
    reviewSuccess: 'Review submitted successfully!',
    reviewError: 'Failed to submit review',
    backToDashboard: 'Back to Dashboard',
    completedJobs: 'Completed Jobs',
    selectJob: 'Select a job to review',
    noCompletedJobs: 'No completed jobs to review yet',
    jobCompleted: 'Job Completed',
    reviewWorker: 'Review Worker',
    existingReviews: 'Existing Reviews',
    writeReview: 'Write a Review',
    viewReviews: 'View Reviews'
  },
  fr: {
    leaveReview: 'Laisser un avis',
    reviewSuccess: 'Avis soumis avec succès!',
    reviewError: "Échec de la soumission de l'avis",
    backToDashboard: 'Retour au tableau de bord',
    completedJobs: 'Emplois terminés',
    selectJob: 'Sélectionner un emploi à évaluer',
    noCompletedJobs: 'Aucun emploi terminé à évaluer yet',
    jobCompleted: 'Emploi terminé',
    reviewWorker: 'Évaluer le travailleur',
    existingReviews: 'Avis existants',
    writeReview: 'Écrire un avis',
    viewReviews: 'Voir les avis'
  },
  'ar-TN': {
    leaveReview: 'اترك تقييم',
    reviewSuccess: 'تم تقديم التقييم بنجاح!',
    reviewError: 'فشل في تقديم التقييم',
    backToDashboard: 'العودة للوحة التحكم',
    completedJobs: 'الوظائف المكتملة',
    selectJob: 'اختر وظيفة للتقييم',
    noCompletedJobs: 'لا توجد وظائف مكتملة للتقييم بعد',
    jobCompleted: 'الوظيفة مكتملة',
    reviewWorker: 'قيم العامل',
    existingReviews: 'التقييمات الموجودة',
    writeReview: 'اكتب تقييم',
    viewReviews: 'عرض التقييمات'
  }
};

type CompletedJob = {
  id: string;
  title?: string;
  category?: string;
  budget?: number;
  location?: string;
  completedAt?: string;
  workerId?: string;
  workerName?: string;
  workerRating?: number;
  status: string;
};

export default function CustomerReviewPage() {
  const { locale, setLocale, isClient } = useLocale();
  const t = translations[locale];

  const [selectedJob, setSelectedJob] = useState<CompletedJob | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([]);
  const [customerId, setCustomerId] = useState<string>('');

  // Check if user is logged in and is a customer
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
      return;
    }
    setCustomerId(user.id || '');
  }, [isClient, locale]);

  // Fetch completed jobs
  useEffect(() => {
    if (!isClient) return;

    const fetchCompletedJobs = async () => {
      try {
        const response = await fetch('/api/jobs?status=completed', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCompletedJobs(data.jobs || []);
        }
      } catch (error) {
        console.error('Error fetching completed jobs:', error);
      }
    };

    fetchCompletedJobs();
  }, [isClient]);

  const handleJobSelect = (job: CompletedJob) => {
    setSelectedJob(job);
    setShowReviewForm(true);
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setSelectedJob(null);
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <div
      className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200"
    >
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getCustomerMenuItems(locale, 'reviews')}
        title={t.leaveReview}
        subtitle={t.completedJobs}
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
          {showReviewForm && selectedJob ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                  <ArrowLeft className="w-4 h-4 me-2" />
                  {t.backToDashboard}
                </Button>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{t.reviewWorker}</h2>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {selectedJob.title} - {selectedJob.workerName}
                  </p>
                </div>
              </div>

              <RatingComponent
                jobId={selectedJob.id}
                workerId={selectedJob.workerId || ''}
                workerName={selectedJob.workerName || ''}
                jobTitle={selectedJob.title || ''}
                onReviewSubmitted={handleReviewSubmitted}
                locale={locale}
              />
            </div>
          ) : (
            <div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">{t.selectJob}</h2>

                {completedJobs.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <CheckCircle className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">{t.noCompletedJobs}</h3>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {locale === 'ar-TN'
                          ? 'أكمل بعض الوظائف أولاً لتتمكن من تقييم العمال'
                          : locale === 'fr'
                            ? "Terminez quelques emplois d'abord pour pouvoir évaluer les travailleurs"
                            : 'Complete some jobs first to be able to rate workers'}
                      </p>
                      <Button onClick={() => (window.location.href = `/${locale}/customer/dashboard`)}>{t.backToDashboard}</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {completedJobs.map((job) => (
                      <Card
                        key={job.id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleJobSelect(job)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{job.title}</h3>
                              <p className="text-neutral-600 dark:text-neutral-400 mb-2 line-clamp-2">
                                {job.location} • TND {job.budget}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                {t.jobCompleted}
                              </div>
                            </div>
                            <div className="text-end">
                              <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                {job.workerRating}
                              </div>
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">{job.workerName}</p>
                            </div>
                          </div>
                          <Button className="w-full mt-4">{t.reviewWorker}</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-12">
                <ReviewsDisplay customerId={customerId} showWriteReview={false} locale={locale} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
