'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocale } from '@/hooks/useLocale';
import { Search, MapPin, Star, CheckCircle, MessageCircle, Briefcase, User } from 'lucide-react';
import MessageModal from '@/components/MessageModal';
import { HeaderMenu, getCustomerMenuItems } from '@/components/HeaderMenu';

const translations = {
  en: {
    browseWorkers: 'Browse Workers',
    findProfessionals: 'Find Verified Professionals',
    searchWorkers: 'Search Workers',
    category: 'Category',
    location: 'Location',
    rating: 'Rating',
    allCategories: 'All Categories',
    allLocations: 'All Locations',
    minRating: 'Min Rating',
    contactWorker: 'Contact Worker',
    noWorkers: 'No workers found',
    loading: 'Loading...',
    workersFound: 'workers found',
    verifiedProfessionals: 'Verified Professionals',
    verifiedDesc: 'All workers are background-checked and verified for your safety.',
    quickService: 'Quick Service',
    quickDesc: 'Get connected with professionals in minutes, not days.',
    guarantee: '7-Day Guarantee',
    guaranteeDesc: 'Satisfaction guaranteed or your money back.',
    plumbing: 'Plumbing',
    electrical: 'Electrical',
    ac: 'AC Maintenance',
    cleaning: 'Cleaning',
    createJobOffer: 'Create Job Offer',
    message: 'Message',
    jobDescription: 'Job Description',
    jobAddress: 'Service Address',
    preferredDate: 'Preferred Date',
    preferredTime: 'Preferred Time',
    inspectionRequired: 'Requires inspection first',
    inspectionDesc: 'Worker will visit site first to determine price',
    createOffer: 'Create Offer',
    cancel: 'Cancel',
    backToDashboard: 'Back to Dashboard',
    applications: 'Applications',
    reviews: 'Reviews',
    logout: 'Logout'
  },
  fr: {
    browseWorkers: 'Parcourir les travailleurs',
    findProfessionals: 'Trouver des professionnels vérifiés',
    searchWorkers: 'Rechercher des travailleurs',
    category: 'Catégorie',
    location: 'Lieu',
    rating: 'Évaluation',
    allCategories: 'Toutes les catégories',
    allLocations: 'Tous les lieux',
    minRating: 'Évaluation minimale',
    contactWorker: 'Contacter le travailleur',
    noWorkers: 'Aucun travailleur trouvé',
    loading: 'Chargement...',
    workersFound: 'travailleurs trouvés',
    verifiedProfessionals: 'Professionnels vérifiés',
    verifiedDesc: 'Tous les travailleurs sont vérifiés et contrôlés pour votre sécurité.',
    quickService: 'Service rapide',
    quickDesc: 'Connectez-vous avec des professionnels en quelques minutes, pas des jours.',
    guarantee: 'Garantie 7 jours',
    guaranteeDesc: 'Satisfaction garantie ou remboursé.',
    plumbing: 'Plomberie',
    electrical: 'Électricité',
    ac: 'Climatisation',
    cleaning: 'Nettoyage',
    createJobOffer: "Créer une offre d'emploi",
    message: 'Message',
    jobDescription: 'Description du travail',
    jobAddress: 'Adresse du service',
    preferredDate: 'Date préférée',
    preferredTime: 'Heure préférée',
    inspectionRequired: "Nécessite une inspection d'abord",
    inspectionDesc: "Le travailleur visitera d'abord le site pour déterminer le prix",
    createOffer: 'Créer une offre',
    cancel: 'Annuler',
    backToDashboard: 'Retour au tableau de bord',
    applications: 'Candidatures',
    reviews: 'Avis',
    logout: 'Déconnexion'
  },
  'ar-TN': {
    browseWorkers: 'تصفح العمال',
    findProfessionals: 'ابحث عن محترفين موثوقين',
    searchWorkers: 'البحث عن العمال',
    category: 'الفئة',
    location: 'الموقع',
    rating: 'التقييم',
    allCategories: 'جميع الفئات',
    allLocations: 'جميع المواقع',
    minRating: 'التقييم الأدنى',
    contactWorker: 'تواصل مع العامل',
    noWorkers: 'لم يتم العثور على عمال',
    loading: 'جاري التحميل...',
    workersFound: 'عامل تم العثور عليه',
    verifiedProfessionals: 'محترفون موثوقون',
    verifiedDesc: 'جميع العمال تم فحصهم وتوثيقهم لسلامتك.',
    quickService: 'خدمة سريعة',
    quickDesc: 'تواصل مع المحترفين في دقائق، وليس أيام.',
    guarantee: 'ضمانة 7 أيام',
    guaranteeDesc: 'رضا مضمون أو استرداد أموالك.',
    plumbing: 'سباكة',
    electrical: 'كهرباء',
    ac: 'تكييف',
    cleaning: 'تنظيف',
    createJobOffer: 'إنشاء عرض عمل',
    message: 'رسالة',
    jobDescription: 'وصف العمل',
    jobAddress: 'عنوان الخدمة',
    preferredDate: 'التاريخ المفضل',
    preferredTime: 'الوقت المفضل',
    inspectionRequired: 'يتطلب فحصاً أولاً',
    inspectionDesc: 'سيقوم العامل بزيارة الموقع أولاً لتحديد السعر',
    createOffer: 'إنشاء عرض',
    cancel: 'إلغاء',
    backToDashboard: 'العودة للوحة التحكم',
    applications: 'الطلبات',
    reviews: 'التقييمات',
    logout: 'تسجيل الخروج'
  }
};

type Worker = {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  guaranteeEnabled: boolean;
  city: string;
  hourlyRate?: number;
  profilePhoto?: string | null;
  nextAvailable?: string;
  responseTime?: string;
};

export default function CustomerBrowseWorkersPage() {
  const { locale, setLocale, isClient } = useLocale();
  const t = translations[locale];
  const searchParams = useSearchParams();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageUserId, setMessageUserId] = useState('');
  const [messageUserName, setMessageUserName] = useState('');
  const [messageJobId, setMessageJobId] = useState<string | undefined>(undefined);
  const [currentUserId, setCurrentUserId] = useState('');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobAddress, setJobAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('morning');
  const [inspectionRequired, setInspectionRequired] = useState(false);

  // Auth check
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

    setCurrentUserId(user.id || '');
  }, [isClient, locale]);

  // Sync URL parameters with state
  useEffect(() => {
    const category = searchParams.get('category');
    if (category && category !== selectedCategory) {
      setSelectedCategory(category);
    }
  }, [searchParams, selectedCategory]);

  // Fetch workers from API
  useEffect(() => {
    if (!isClient) return;

    const fetchWorkers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/workers');
        if (response.ok) {
          const data = await response.json();
          console.log('Workers API response:', data);
          console.log('First worker data:', data.workers?.[0]);
          // Transform API data to component format
          const formattedWorkers = (data.workers || []).map((w: any) => {
            console.log('Mapping worker data:', w);
            const formatted = {
              id: w.id,
              name: w.name,
              category: w.category,
              rating: w.rating_avg || 0,
              reviewCount: w.review_count || 0,
              completedJobs: w.completed_jobs || 0,
              guaranteeEnabled: w.guarantee_enabled || false,
              city: w.city || '',
              hourlyRate: w.hourly_rate,
              profilePhoto: w.profile_photo || null,
              nextAvailable: w.next_available || 'Available now',
              responseTime: w.response_time || '1 hour',
            };
            console.log('Formatted worker:', formatted);
            return formatted;
          });
          console.log('Formatted workers:', formattedWorkers);
          setWorkers(formattedWorkers);
        }
      } catch (error) {
        console.error('Error fetching workers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkers();
  }, [isClient]);

  const filteredWorkers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return workers.filter((worker) => {
      const matchesSearch =
        !q ||
        [worker.name, worker.category, worker.city]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));

      const matchesCategory = selectedCategory === 'all' || worker.category === selectedCategory;
      const matchesLocation = selectedLocation === 'all' || worker.city === selectedLocation;
      const matchesRating = minRating === 0 || worker.rating >= minRating;

      const result = matchesSearch && matchesCategory && matchesLocation && matchesRating;
      if (!result) {
        console.log('Worker filtered out:', {
          worker: worker.name,
          workerData: worker,
          matchesSearch,
          matchesCategory,
          matchesLocation,
          matchesRating,
          searchTerm: q,
          selectedCategory,
          selectedLocation,
          minRating,
          workerCategory: worker.category,
          workerCity: worker.city,
          workerRating: worker.rating
        });
      }
      return result;
    });
  }, [workers, minRating, searchTerm, selectedCategory, selectedLocation]);

  console.log('Current filters:', {
    searchTerm,
    selectedCategory,
    selectedLocation,
    minRating,
    filteredWorkersCount: filteredWorkers.length
  });
  console.log('About to render filteredWorkers:', filteredWorkers.length, filteredWorkers);

  const handleMessageWorker = (worker: any) => {
    setMessageUserId(worker.id);
    setMessageUserName(worker.name);
    setMessageJobId(undefined);
    setMessageModalOpen(true);
  };

  const handleBookWorker = (worker: any) => {
    setSelectedWorker(worker);
    setBookingModalOpen(true);
  };

  const handleCreateJobOffer = async () => {
    if (!selectedWorker || !jobDescription || !jobAddress || !preferredDate) {
      alert(
        locale === 'ar-TN'
          ? 'يرجى ملء جميع الحقول'
          : locale === 'fr'
            ? 'Veuillez remplir tous les champs'
            : 'Please fill all fields'
      );
      return;
    }

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          category: selectedWorker.category,
          description: jobDescription,
          address: jobAddress,
          address_details: '',
          photos: [],
          inspection_required: inspectionRequired,
          price_after_inspection: inspectionRequired,
          preferred_date: preferredDate,
          preferred_time_slot: preferredTime
        })
      });

      if (response.ok) {
        const result = await response.json();

        const acceptResponse = await fetch(`/api/jobs/${result.job?.id}/accept`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            worker_id: selectedWorker.id,
            action: 'accept'
          })
        });

        if (acceptResponse.ok) {
          alert(
            locale === 'ar-TN'
              ? 'تم إنشاء عرض العمل بنجاح!'
              : locale === 'fr'
                ? "Offre d'emploi créée avec succès!"
                : 'Job offer created successfully!'
          );

          setMessageUserId(selectedWorker.id);
          setMessageUserName(selectedWorker.name);
          setMessageJobId(result.job_id);
          setMessageModalOpen(true);
          setBookingModalOpen(false);

          setJobDescription('');
          setJobAddress('');
          setPreferredDate('');
          setPreferredTime('morning');
          setInspectionRequired(false);
          setSelectedWorker(null);
        } else {
          alert(
            locale === 'ar-TN'
              ? 'فشل في تعيين العامل'
              : locale === 'fr'
                ? "Échec de l'assignation du travailleur"
                : 'Failed to assign worker'
          );
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create job offer');
      }
    } catch (error) {
      console.error('Error creating job offer:', error);
      alert('Network error. Please try again.');
    }
  };

  const categories = [
    { value: 'all', label: t.allCategories },
    { value: 'plumbing', label: t.plumbing },
    { value: 'electrical', label: t.electrical },
    { value: 'ac', label: t.ac },
    { value: 'cleaning', label: t.cleaning }
  ];

  const locations = [
    { value: 'all', label: t.allLocations },
    { value: 'Tunis', label: 'Tunis' },
    { value: 'Sfax', label: 'Sfax' },
    { value: 'Sousse', label: 'Sousse' },
    { value: 'Monastir', label: 'Monastir' },
    { value: 'Bizerte', label: 'Bizerte' }
  ];

  const ratings = [
    { value: 0, label: t.minRating },
    { value: 3, label: '3+ Stars' },
    { value: 4, label: '4+ Stars' },
    { value: 4.5, label: '4.5+ Stars' }
  ];

  const timeSlots = [
    {
      value: 'morning',
      label:
        locale === 'ar-TN'
          ? 'الصباح (9:00 - 12:00)'
          : locale === 'fr'
            ? 'Matin (9:00 - 12:00)'
            : 'Morning (9:00 - 12:00)'
    },
    {
      value: 'afternoon',
      label:
        locale === 'ar-TN'
          ? 'بعد الظهر (14:00 - 18:00)'
          : locale === 'fr'
            ? 'Après-midi (14:00 - 18:00)'
            : 'Afternoon (14:00 - 18:00)'
    },
    {
      value: 'evening',
      label:
        locale === 'ar-TN'
          ? 'المساء (18:00 - 21:00)'
          : locale === 'fr'
            ? 'Soir (18:00 - 21:00)'
            : 'Evening (18:00 - 21:00)'
    }
  ];

  return (
    <div
      className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200"
    >
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getCustomerMenuItems(locale, 'browse-workers')}
        title={t.browseWorkers}
        subtitle={t.findProfessionals}
      />

      {!isClient && (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
          <div className="text-neutral-600 dark:text-neutral-400">
            {locale === 'ar-TN' ? 'جاري التحميل...' : locale === 'fr' ? 'Chargement...' : 'Loading...'}
          </div>
        </div>
      )}

      {isClient && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{t.verifiedProfessionals}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{t.verifiedDesc}</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{t.quickService}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{t.quickDesc}</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{t.guarantee}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{t.guaranteeDesc}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search
                    className={`absolute ${locale === 'ar-TN' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5`}
                  />
                  <Input
                    type="text"
                    placeholder={t.searchWorkers}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-12 ${locale === 'ar-TN' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>{t.category}</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.allCategories} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t.location}</Label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.allLocations} />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.value} value={location.value}>
                            {location.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t.rating}</Label>
                    <Select value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.minRating} />
                      </SelectTrigger>
                      <SelectContent>
                        {ratings.map((rating) => (
                          <SelectItem key={rating.value} value={rating.value.toString()}>
                            {rating.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setSelectedLocation('all');
                        setMinRating(0);
                      }}
                    >
                      {locale === 'ar-TN' ? 'مسح المرشحات' : locale === 'fr' ? 'Effacer les filtres' : 'Clear Filters'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {filteredWorkers.length} {t.workersFound}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkers.map((worker) => (
              <Card key={worker.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center overflow-hidden">
                      {worker.profilePhoto ? (
                        <img src={worker.profilePhoto} alt={worker.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-neutral-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 mb-1">{worker.name}</h3>
                      <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <span className="text-sm capitalize">{worker.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(worker.rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{worker.rating.toFixed(1)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">{worker.completedJobs} jobs</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{worker.city}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {locale === 'ar-TN' ? 'ساعة' : locale === 'fr' ? 'Heure' : 'Hour'}
                      </span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">
                        {worker.hourlyRate} {locale === 'ar-TN' ? 'د.ت' : 'TND'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {locale === 'ar-TN' ? 'متاح' : locale === 'fr' ? 'Disponible' : 'Available'}
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">{worker.nextAvailable}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {locale === 'ar-TN' ? 'وقت الرد' : locale === 'fr' ? 'Temps de réponse' : 'Response Time'}
                      </span>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{worker.responseTime}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookWorker(worker);
                      }}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <span>{t.createJobOffer}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMessageWorker(worker);
                      }}
                      className="w-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{t.message}</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {bookingModalOpen && selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              {t.createJobOffer} - {selectedWorker.name}
            </h2>

            <div className="space-y-4">
              <div>
                <Label>{t.jobDescription}</Label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  rows={3}
                  placeholder={
                    locale === 'ar-TN'
                      ? 'صف الخدمة المطلوبة'
                      : locale === 'fr'
                        ? 'Décrivez le service requis'
                        : 'Describe the service needed'
                  }
                />
              </div>

              <div>
                <Label>{t.jobAddress}</Label>
                <Input
                  type="text"
                  value={jobAddress}
                  onChange={(e) => setJobAddress(e.target.value)}
                  placeholder={locale === 'ar-TN' ? 'أدخل العنوان' : locale === 'fr' ? "Entrez l'adresse" : 'Enter address'}
                />
              </div>

              <div>
                <Label>{t.preferredDate}</Label>
                <DatePicker
                  id="preferred_date"
                  value={preferredDate}
                  onChange={(date) => setPreferredDate(date)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full"
                  locale={locale}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inspectionRequired"
                    checked={inspectionRequired}
                    onChange={(e) => setInspectionRequired(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <Label htmlFor="inspectionRequired" className="text-sm">
                    {t.inspectionRequired}
                  </Label>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.inspectionDesc}</p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-700 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {locale === 'ar-TN' ? 'التكلفة المقدرة' : locale === 'fr' ? 'Coût estimé' : 'Estimated Cost'}
                  </span>
                  <span className="font-bold text-primary-600 dark:text-primary-400">
                    {locale === 'ar-TN'
                      ? 'سيتم تحديده بعد التفاوض'
                      : locale === 'fr'
                        ? 'Sera déterminé après négociation'
                        : 'Will be determined after negotiation'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setBookingModalOpen(false)} className="flex-1">
                {t.cancel}
              </Button>
              <Button onClick={handleCreateJobOffer} className="flex-1">
                {t.createOffer}
              </Button>
            </div>
          </div>
        </div>
      )}

      <MessageModal
        isOpen={messageModalOpen}
        onClose={() => {
          setMessageModalOpen(false);
          setMessageJobId(undefined);
        }}
        currentUserId={currentUserId}
        otherUserId={messageUserId}
        otherUserName={messageUserName}
        jobId={messageJobId}
        locale={locale}
      />
    </div>
  );
}
