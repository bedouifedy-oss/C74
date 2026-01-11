'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/hooks/useLocale';
import { withGlobalLoading } from '@/components/GlobalPageLoader';
import JobForm from '@/components/jobs/JobForm';
import {
  Plus,
  Search,
  MapPin,
  Calendar,
  CheckCircle,
  PlayCircle,
  Flag,
  Wrench,
  Zap,
  Wind,
  Sparkles,
  Briefcase,
  X,
  MessageSquare
} from 'lucide-react';
import NotificationDropdown from '@/components/NotificationDropdown';
import MessageModal from '@/components/MessageModal';
import { HeaderMenu, getCustomerMenuItems } from '@/components/HeaderMenu';
import { Link } from '@/lib/i18n';
import { MobileBottomNav } from '@/components/MobileBottomNav';

const translations = {
  en: {
    dashboard: 'Customer Dashboard',
    welcome: 'Welcome back!',
    myJobs: 'My Jobs',
    postNewJob: 'Post New Job',
    activeJobs: 'Active Jobs',
    completedJobs: 'Completed Jobs',
    jobTitle: 'Job Title',
    description: 'Description',
    location: 'Location',
    budget: 'Budget (TND)',
    postJob: 'Post Job',
    cancel: 'Cancel',
    searchJobs: 'Search Jobs',
    filter: 'Filter',
    noJobs: 'No jobs posted yet',
    postedOn: 'Posted on',
    status: 'Status',
    applicants: 'Applicants',
    markInProgress: 'Mark In Progress',
    markCompleted: 'Mark Completed',
    cancelJob: 'Cancel Job',
    browseWorkers: 'Browse Workers',
    category: 'Category',
    plumbing: 'Plumbing',
    electrical: 'Electrical',
    ac: 'AC Maintenance',
    cleaning: 'Cleaning',
    selectCategory: 'Select category',
    preferredDate: 'Preferred Date',
    preferredTime: 'Preferred Time'
  },
  fr: {
    dashboard: 'Tableau de bord client',
    welcome: 'Bon retour!',
    myJobs: 'Mes emplois',
    postNewJob: 'Publier un nouvel emploi',
    activeJobs: 'Emplois actifs',
    completedJobs: 'Emplois terminés',
    jobTitle: "Titre de l'emploi",
    description: 'Description',
    location: 'Lieu',
    budget: 'Budget (TND)',
    postJob: 'Publier',
    cancel: 'Annuler',
    searchJobs: 'Rechercher des emplois',
    filter: 'Filtrer',
    noJobs: 'Aucun emploi publié yet',
    postedOn: 'Publié le',
    status: 'Statut',
    applicants: 'Candidats',
    markInProgress: 'Marquer en cours',
    markCompleted: 'Marquer terminé',
    cancelJob: "Annuler l'emploi",
    browseWorkers: 'Parcourir les travailleurs',
    category: 'Catégorie',
    plumbing: 'Plomberie',
    electrical: 'Électrique',
    ac: 'Maintenance AC',
    cleaning: 'Nettoyage',
    selectCategory: 'Sélectionner une catégorie',
    preferredDate: 'Date préférée',
    preferredTime: 'Heure préférée'
  },
  'ar-TN': {
    dashboard: 'لوحة تحكم العميل',
    welcome: 'مرحباً بعودتك!',
    myJobs: 'وظائفي',
    postNewJob: 'نشر وظيفة جديدة',
    activeJobs: 'الوظائف النشطة',
    completedJobs: 'الوظائف المكتملة',
    jobTitle: 'عنوان الوظيفة',
    description: 'الوصف',
    location: 'الموقع',
    budget: 'الميزانية (دينار)',
    postJob: 'نشر',
    cancel: 'إلغاء',
    searchJobs: 'البحث عن وظائف',
    filter: 'تصفية',
    noJobs: 'لم يتم نشر أي وظائف بعد',
    postedOn: 'نشر في',
    status: 'الحالة',
    applicants: 'المتقدمون',
    markInProgress: 'تحديد قيد التنفيذ',
    markCompleted: 'تحديد مكتمل',
    cancelJob: 'إلغاء الوظيفة',
    browseWorkers: 'تصفح العمال',
    category: 'الفئة',
    plumbing: 'السباكة',
    electrical: 'الكهرباء',
    ac: 'صيانة المكيف',
    cleaning: 'التنظيف',
    selectCategory: 'اختر الفئة',
    preferredDate: 'التاريخ المفضل',
    preferredTime: 'الوقت المفضل'
  }
};

type CustomerJob = {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  postedAt?: string;
  created_at: string;
  applicant_count?: number;
};

function CustomerDashboardPageSimple() {
  const { locale, setLocale, isClient } = useLocale();
  const t = translations[locale];
  const [showPostForm, setShowPostForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState<CustomerJob[]>([]);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    location: '',
    address_details: '',
    category: '',
    preferred_date: '',
    preferred_time: '',
    budget: ''
  });

  // Check if user is logged in
  useEffect(() => {
    if (!isClient) return;

    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (!token || !userData) {
      window.location.href = `/${locale}/login`;
      return;
    }

    // Fetch jobs
    fetchJobs();
  }, [locale, isClient]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      if (!token || !userData) return;

      const user = JSON.parse(userData);
      const jobsResponse = await fetch(`/api/jobs/customer/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(jobsData.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      if (!token || !userData) return;

      const user = JSON.parse(userData);
      
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newJob,
          customer_id: user.id,
          budget: parseFloat(newJob.budget)
        })
      });

      if (response.ok) {
        setShowPostForm(false);
        setNewJob({
          title: '',
          description: '',
          location: '',
          address_details: '',
          category: '',
          preferred_date: '',
          preferred_time: '',
          budget: ''
        });
        fetchJobs(); // Refresh jobs list
        alert(locale === 'ar-TN' ? 'تم نشر الوظيفة بنجاح!' : 
              locale === 'fr' ? 'Emploi publié avec succès!' : 
              'Job posted successfully!');
      } else {
        const error = await response.json();
        alert(error.error || (locale === 'ar-TN' ? 'فشل نشر الوظيفة' : 
                            locale === 'fr' ? 'Échec de la publication' : 
                            'Failed to post job'));
      }
    } catch (error) {
      console.error('Error posting job:', error);
      alert(locale === 'ar-TN' ? 'حدث خطأ' : 
            locale === 'fr' ? 'Une erreur est survenue' : 
            'An error occurred');
    }
  };

  const handleJobSuccess = (jobId: string) => {
    setShowPostForm(false);
    fetchJobs(); // Refresh jobs list
    // Optionally show success message or navigate to job
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return locale === 'ar-TN' ? 'مفتوح' : locale === 'fr' ? 'Ouvert' : 'Open';
      case 'in_progress': return locale === 'ar-TN' ? 'قيد التنفيذ' : locale === 'fr' ? 'En cours' : 'In Progress';
      case 'completed': return locale === 'ar-TN' ? 'مكتمل' : locale === 'fr' ? 'Terminé' : 'Completed';
      case 'cancelled': return locale === 'ar-TN' ? 'ملغي' : locale === 'fr' ? 'Annulé' : 'Cancelled';
      default: return status;
    }
  };

  const getCurrentUserId = (): string => {
    if (typeof window === 'undefined') return '';
    try {
      const userData = localStorage.getItem('user_data');
      const user = userData ? JSON.parse(userData) : null;
      return user?.id || '';
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getCustomerMenuItems(locale, 'dashboard')}
        title={t.dashboard}
        subtitle={t.welcome}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Browse Workers Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              {t.browseWorkers}
            </CardTitle>
            <CardDescription>
              {locale === 'ar-TN'
                ? 'ابحث عن محترفين موثوقين لإكمال مشاريعك'
                : locale === 'fr'
                  ? 'Trouvez des professionnels vérifiés pour réaliser vos projets'
                  : 'Find verified professionals to complete your projects'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-4">
                {locale === 'ar-TN'
                  ? 'اختر الفئة المناسبة واحصل على محترفين موثوقين'
                  : locale === 'fr'
                    ? 'Choisissez la catégorie appropriée et trouvez des professionnels vérifiés'
                    : 'Choose the right category and get verified professionals'}
              </p>
              <Button onClick={() => (window.location.href = `/${locale}/customer/browse-workers`)}>
                {locale === 'ar-TN' ? 'عرض جميع العمال' : locale === 'fr' ? 'Voir tous les travailleurs' : 'View All Workers'}
              </Button>
            </div>
            
            {/* Worker Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
                onClick={() => (window.location.href = `/${locale}/customer/browse-workers?category=plumbing`)}
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{t.plumbing}</h3>
              </div>
              <div 
                className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
                onClick={() => (window.location.href = `/${locale}/customer/browse-workers?category=electrical`)}
              >
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{t.electrical}</h3>
              </div>
              <div 
                className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
                onClick={() => (window.location.href = `/${locale}/customer/browse-workers?category=ac`)}
              >
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Wind className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{t.ac}</h3>
              </div>
              <div 
                className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
                onClick={() => (window.location.href = `/${locale}/customer/browse-workers?category=cleaning`)}
              >
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{t.cleaning}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>{t.myJobs}</CardTitle>
                <CardDescription>
                  {locale === 'ar-TN'
                    ? 'إدارة جميع وظائفك وتطبيقات العمال'
                    : locale === 'fr'
                      ? 'Gérez tous vos emplois et les candidatures des travailleurs'
                      : 'Manage all your jobs and worker applications'}
                </CardDescription>
              </div>
              <Button onClick={() => setShowPostForm(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {t.postNewJob}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <Input
                  placeholder={t.searchJobs}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Jobs List */}
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">{t.noJobs}</h3>
                <Button onClick={() => setShowPostForm(true)} className="mt-4">
                  {t.postNewJob}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 mb-2">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {getStatusLabel(job.status)}
                        </span>
                      </div>
                      
                      <p className="text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                        {job.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {t.applicants}: {job.applicant_count || 0}
                        </div>
                        <div className="text-lg font-bold text-primary-600">TND {job.budget}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Message Modal */}
      <MessageModal
        isOpen={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        currentUserId={getCurrentUserId()}
        otherUserId=""
        otherUserName=""
        locale={locale}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav locale={locale} userRole="customer" />

      {/* Post Job Wizard */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <JobForm
              locale={locale}
              onSuccess={handleJobSuccess}
              onCancel={() => setShowPostForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Export with HOC for automatic loading
export default withGlobalLoading(CustomerDashboardPageSimple, {
  minLoadingTime: 1200,
  showSpinner: true
});
