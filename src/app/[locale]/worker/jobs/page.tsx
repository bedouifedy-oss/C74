'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLocale as useC74Locale } from '@/hooks/useLocale';
import { HeaderMenu, getWorkerMenuItems } from '@/components/HeaderMenu';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Wrench,
  Zap,
  Wind,
  Sparkles,
  Filter,
  Eye,
  CheckCircle,
  Loader2,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import type { Locale } from '@/i18n-routing';

const translations = {
  en: {
    title: 'Available Jobs',
    subtitle: 'Find and apply to jobs in your area',
    searchPlaceholder: 'Search jobs...',
    filterByCategory: 'Filter by Category',
    allCategories: 'All Categories',
    
    // Categories
    plumbing: 'Plumbing',
    electrical: 'Electrical',
    ac: 'AC Maintenance',
    cleaning: 'Cleaning',
    
    // Time slots
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    
    // Job card
    viewDetails: 'View Details',
    applyNow: 'Apply Now',
    applied: 'Applied',
    inspectionRequired: 'Inspection Required',
    priceAfterInspection: 'Quote After Visit',
    postedAgo: 'Posted',
    
    // Empty state
    noJobs: 'No jobs available',
    noJobsDesc: 'Check back later for new job opportunities',
    
    // Loading
    loading: 'Loading jobs...',
    
    // Apply modal
    applyToJob: 'Apply to Job',
    proposedPrice: 'Your Proposed Price (TND)',
    message: 'Message to Customer',
    messagePlaceholder: 'Introduce yourself and explain why you\'re the right person for this job...',
    submitApplication: 'Submit Application',
    submitting: 'Submitting...',
    applicationSuccess: 'Application submitted successfully!',
    applicationError: 'Failed to submit application',
    cancel: 'Cancel',
  },
  fr: {
    title: 'Emplois Disponibles',
    subtitle: 'Trouvez et postulez aux emplois dans votre région',
    searchPlaceholder: 'Rechercher des emplois...',
    filterByCategory: 'Filtrer par Catégorie',
    allCategories: 'Toutes les Catégories',
    
    plumbing: 'Plomberie',
    electrical: 'Électricité',
    ac: 'Climatisation',
    cleaning: 'Nettoyage',
    
    morning: 'Matin',
    afternoon: 'Après-midi',
    evening: 'Soir',
    
    viewDetails: 'Voir Détails',
    applyNow: 'Postuler',
    applied: 'Postulé',
    inspectionRequired: 'Inspection Requise',
    priceAfterInspection: 'Devis Après Visite',
    postedAgo: 'Publié',
    
    noJobs: 'Aucun emploi disponible',
    noJobsDesc: 'Revenez plus tard pour de nouvelles opportunités',
    
    loading: 'Chargement des emplois...',
    
    applyToJob: 'Postuler à l\'emploi',
    proposedPrice: 'Votre Prix Proposé (TND)',
    message: 'Message au Client',
    messagePlaceholder: 'Présentez-vous et expliquez pourquoi vous êtes la bonne personne...',
    submitApplication: 'Soumettre la Candidature',
    submitting: 'Soumission...',
    applicationSuccess: 'Candidature soumise avec succès!',
    applicationError: 'Échec de la soumission',
    cancel: 'Annuler',
  },
  'ar-TN': {
    title: 'الوظائف المتاحة',
    subtitle: 'لقى وقدّم على خدمات في منطقتك',
    searchPlaceholder: 'ابحث عن وظائف...',
    filterByCategory: 'فلتر حسب الفئة',
    allCategories: 'الكل',
    
    plumbing: 'السباكة',
    electrical: 'الكهرباء',
    ac: 'التكييف',
    cleaning: 'التنظيف',
    
    morning: 'الصباح',
    afternoon: 'بعد الظهر',
    evening: 'المساء',
    
    viewDetails: 'شوف التفاصيل',
    applyNow: 'قدّم',
    applied: 'قدّمت',
    inspectionRequired: 'معاينة مطلوبة',
    priceAfterInspection: 'السوم بعد الزيارة',
    postedAgo: 'منشور',
    
    noJobs: 'ما فماش وظائف',
    noJobsDesc: 'ارجع بعد شوية تلقى فرص جديدة',
    
    loading: 'جاري التحميل...',
    
    applyToJob: 'قدّم على الخدمة',
    proposedPrice: 'السعر المقترح (دينار)',
    message: 'رسالة للحريف',
    messagePlaceholder: 'عرّف بروحك وقول علاش انت الشخص المناسب...',
    submitApplication: 'أرسل الطلب',
    submitting: 'جاري الإرسال...',
    applicationSuccess: 'تم إرسال الطلب بنجاح!',
    applicationError: 'فشل في إرسال الطلب',
    cancel: 'إلغاء',
  },
};

interface Job {
  id: string;
  category: string;
  description: string;
  address: string;
  address_details?: string;
  preferred_date: string;
  preferred_time_slot: string;
  inspection_required?: boolean;
  price_after_inspection?: boolean;
  status: string;
  customer_name: string;
  created_at: string;
  applicant_count: number;
  has_applied?: boolean;
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

export default function WorkerJobsPage() {
  const { locale, setLocale } = useC74Locale();
  const t = translations[locale];

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Apply modal state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [proposedPrice, setProposedPrice] = useState('');
  const [applicationMessage, setApplicationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/jobs?status=requested', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (response.ok) {
        setJobs(data.jobs || []);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else {
      return `<1h`;
    }
  };

  const handleApply = async () => {
    if (!selectedJob || !proposedPrice || !applicationMessage.trim()) return;

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          job_id: selectedJob.id,
          proposed_price: parseFloat(proposedPrice),
          message: applicationMessage,
        }),
      });

      if (response.ok) {
        setSubmitMessage({ type: 'success', text: t.applicationSuccess });
        // Mark job as applied
        setJobs(jobs.map(j => j.id === selectedJob.id ? { ...j, has_applied: true } : j));
        setTimeout(() => {
          setSelectedJob(null);
          setProposedPrice('');
          setApplicationMessage('');
          setSubmitMessage(null);
        }, 1500);
      } else {
        setSubmitMessage({ type: 'error', text: t.applicationError });
      }
    } catch {
      setSubmitMessage({ type: 'error', text: t.applicationError });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (cat: string) => t[cat as keyof typeof t] || cat;
  const getTimeSlotLabel = (slot: string) => t[slot as keyof typeof t] || slot;

  return (
    <div
      className="min-h-screen bg-neutral-50 dark:bg-neutral-900"
    >
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getWorkerMenuItems(locale, 'jobs')}
        title={t.title}
        subtitle={t.subtitle}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 start-3`} />
            <Input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-10"
            />
          </div>
          
          <div className={`flex gap-2 flex-wrap`}>
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              {t.allCategories}
            </Button>
            {['plumbing', 'electrical', 'ac', 'cleaning'].map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1`}
              >
                {categoryIcons[cat]}
                <span className="hidden sm:inline">{getCategoryLabel(cat)}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">{t.loading}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredJobs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-neutral-400" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              {t.noJobs}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              {t.noJobsDesc}
            </p>
          </div>
        )}

        {/* Jobs Grid */}
        {!isLoading && filteredJobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map(job => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className={`flex items-start justify-between`}>
                    <div className={`flex items-center gap-3`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${categoryColors[job.category]}`}>
                        {categoryIcons[job.category]}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{getCategoryLabel(job.category)}</CardTitle>
                        <CardDescription className={`flex items-center gap-1`}>
                          <MapPin className="w-3 h-3" />
                          {job.address}
                        </CardDescription>
                      </div>
                    </div>
                    <span className="text-xs text-neutral-500">
                      {t.postedAgo} {formatTimeAgo(job.created_at)}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-neutral-700 dark:text-neutral-300 text-sm mb-4 line-clamp-2">
                    {job.description}
                  </p>
                  
                  <div className={`flex items-center gap-4 text-sm text-neutral-500 mb-4`}>
                    <span className={`flex items-center gap-1`}>
                      <Calendar className="w-4 h-4" />
                      {new Date(job.preferred_date).toLocaleDateString()}
                    </span>
                    <span className={`flex items-center gap-1`}>
                      <Clock className="w-4 h-4" />
                      {getTimeSlotLabel(job.preferred_time_slot)}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className={`flex gap-2 mb-4 flex-wrap`}>
                    {job.inspection_required && (
                      <Badge variant="outline" className="text-xs">
                        <Eye className={`w-3 h-3 me-1`} />
                        {t.inspectionRequired}
                      </Badge>
                    )}
                    {job.price_after_inspection && (
                      <Badge variant="outline" className="text-xs">
                        {t.priceAfterInspection}
                      </Badge>
                    )}
                    {job.applicant_count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {job.applicant_count} {job.applicant_count === 1 ? 'applicant' : 'applicants'}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={`flex gap-2`}>
                    {job.has_applied ? (
                      <Button disabled className="flex-1">
                        <CheckCircle className={`w-4 h-4 me-1`} />
                        {t.applied}
                      </Button>
                    ) : (
                      <Button onClick={() => setSelectedJob(job)} className="flex-1">
                        {t.applyNow}
                      </Button>
                    )}
                    <Button variant="outline" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>{t.applyToJob}</CardTitle>
              <CardDescription>
                {getCategoryLabel(selectedJob.category)} - {selectedJob.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {submitMessage && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  submitMessage.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  {submitMessage.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  {submitMessage.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">{t.proposedPrice}</label>
                <Input
                  type="number"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  placeholder="50"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t.message}</label>
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder={t.messagePlaceholder}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700"
                />
              </div>

              <div className={`flex gap-3 pt-2`}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedJob(null);
                    setProposedPrice('');
                    setApplicationMessage('');
                    setSubmitMessage(null);
                  }}
                  disabled={isSubmitting}
                >
                  {t.cancel}
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={isSubmitting || !proposedPrice || !applicationMessage.trim()}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className={`w-4 h-4 animate-spin me-2`} />
                      {t.submitting}
                    </>
                  ) : (
                    t.submitApplication
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
