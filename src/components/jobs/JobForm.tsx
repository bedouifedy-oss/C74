'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Wrench,
  Zap,
  Wind,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Camera,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import type { Locale } from '@/i18n-routing';

const translations = {
  en: {
    // Step titles
    step1Title: 'Select Service',
    step1Desc: 'What type of service do you need?',
    step2Title: 'Describe the Issue',
    step2Desc: 'Tell us about the problem',
    step3Title: 'Location & Time',
    step3Desc: 'Where and when do you need service?',
    step4Title: 'Review & Submit',
    step4Desc: 'Confirm your job request',
    
    // Categories
    plumbing: 'Plumbing',
    plumbingDesc: 'Pipes, faucets, drains, water heaters',
    electrical: 'Electrical',
    electricalDesc: 'Wiring, outlets, lighting, panels',
    ac: 'AC Maintenance',
    acDesc: 'Installation, repair, cleaning',
    cleaning: 'Cleaning',
    cleaningDesc: 'Deep cleaning, regular cleaning',
    
    // Form fields
    description: 'Description',
    descriptionPlaceholder: 'Describe the issue in detail...',
    descriptionHint: 'Include relevant details like when the issue started, what you\'ve tried, etc.',
    address: 'Address',
    addressPlaceholder: 'e.g., Tunis, El Menzah',
    addressDetails: 'Address Details',
    addressDetailsPlaceholder: 'Building, apartment, floor, etc.',
    photos: 'Photos',
    photosHint: 'Upload photos of the issue (optional)',
    addPhotos: 'Add Photos',
    inspectionRequired: 'Inspection needed first',
    inspectionHint: 'Worker will visit to assess before giving a price',
    priceAfterInspection: 'Price after inspection',
    priceAfterInspectionHint: 'Get a quote after the worker sees the issue',
    preferredDate: 'Preferred Date',
    preferredTime: 'Preferred Time',
    morning: 'Morning',
    morningTime: '8AM - 12PM',
    afternoon: 'Afternoon',
    afternoonTime: '12PM - 5PM',
    evening: 'Evening',
    eveningTime: '5PM - 9PM',
    
    // Review step
    reviewTitle: 'Review Your Request',
    service: 'Service',
    issue: 'Issue',
    location: 'Location',
    schedule: 'Schedule',
    options: 'Options',
    
    // Buttons
    back: 'Back',
    next: 'Next',
    submit: 'Submit Request',
    submitting: 'Submitting...',
    
    // Success/Error
    successTitle: 'Job Posted Successfully!',
    successDesc: 'Workers will be notified and can apply to your job.',
    viewJob: 'View Job',
    postAnother: 'Post Another Job',
    errorTitle: 'Something went wrong',
    tryAgain: 'Try Again',
    
    // Validation
    selectCategory: 'Please select a service category',
    enterDescription: 'Please describe the issue',
    enterAddress: 'Please enter your address',
    selectDate: 'Please select a date',
    selectTime: 'Please select a time slot',
  },
  fr: {
    step1Title: 'Sélectionner le Service',
    step1Desc: 'De quel type de service avez-vous besoin?',
    step2Title: 'Décrire le Problème',
    step2Desc: 'Parlez-nous du problème',
    step3Title: 'Lieu et Horaire',
    step3Desc: 'Où et quand avez-vous besoin du service?',
    step4Title: 'Vérifier et Soumettre',
    step4Desc: 'Confirmez votre demande',
    
    plumbing: 'Plomberie',
    plumbingDesc: 'Tuyaux, robinets, drains, chauffe-eau',
    electrical: 'Électricité',
    electricalDesc: 'Câblage, prises, éclairage, panneaux',
    ac: 'Climatisation',
    acDesc: 'Installation, réparation, nettoyage',
    cleaning: 'Nettoyage',
    cleaningDesc: 'Nettoyage en profondeur, régulier',
    
    description: 'Description',
    descriptionPlaceholder: 'Décrivez le problème en détail...',
    descriptionHint: 'Incluez les détails pertinents comme le début du problème, ce que vous avez essayé, etc.',
    address: 'Adresse',
    addressPlaceholder: 'ex: Tunis, El Menzah',
    addressDetails: 'Détails de l\'adresse',
    addressDetailsPlaceholder: 'Bâtiment, appartement, étage, etc.',
    photos: 'Photos',
    photosHint: 'Téléchargez des photos du problème (optionnel)',
    addPhotos: 'Ajouter des Photos',
    inspectionRequired: 'Inspection nécessaire d\'abord',
    inspectionHint: 'Le travailleur visitera pour évaluer avant de donner un prix',
    priceAfterInspection: 'Prix après inspection',
    priceAfterInspectionHint: 'Obtenez un devis après que le travailleur ait vu le problème',
    preferredDate: 'Date Préférée',
    preferredTime: 'Heure Préférée',
    morning: 'Matin',
    morningTime: '8h - 12h',
    afternoon: 'Après-midi',
    afternoonTime: '12h - 17h',
    evening: 'Soir',
    eveningTime: '17h - 21h',
    
    reviewTitle: 'Vérifiez Votre Demande',
    service: 'Service',
    issue: 'Problème',
    location: 'Lieu',
    schedule: 'Horaire',
    options: 'Options',
    
    back: 'Retour',
    next: 'Suivant',
    submit: 'Soumettre la Demande',
    submitting: 'Soumission...',
    
    successTitle: 'Demande Publiée!',
    successDesc: 'Les travailleurs seront notifiés et pourront postuler.',
    viewJob: 'Voir la Demande',
    postAnother: 'Publier une Autre',
    errorTitle: 'Une erreur est survenue',
    tryAgain: 'Réessayer',
    
    selectCategory: 'Veuillez sélectionner une catégorie',
    enterDescription: 'Veuillez décrire le problème',
    enterAddress: 'Veuillez entrer votre adresse',
    selectDate: 'Veuillez sélectionner une date',
    selectTime: 'Veuillez sélectionner un créneau horaire',
  },
  'ar-TN': {
    step1Title: 'اختر الخدمة',
    step1Desc: 'أي نوع من الخدمات تحتاج؟',
    step2Title: 'وصف المشكلة',
    step2Desc: 'أخبرنا عن المشكلة',
    step3Title: 'المكان والوقت',
    step3Desc: 'وين ووقتاش تحتاج الخدمة؟',
    step4Title: 'مراجعة وإرسال',
    step4Desc: 'أكد طلبك',
    
    plumbing: 'السباكة',
    plumbingDesc: 'المواسير، الحنفيات، البالوعات، السخانات',
    electrical: 'الكهرباء',
    electricalDesc: 'التمديدات، المقابس، الإضاءة، اللوحات',
    ac: 'التكييف',
    acDesc: 'التركيب، الإصلاح، التنظيف',
    cleaning: 'التنظيف',
    cleaningDesc: 'تنظيف عميق، تنظيف عادي',
    
    description: 'الوصف',
    descriptionPlaceholder: 'اوصف المشكلة بالتفصيل...',
    descriptionHint: 'اذكر التفاصيل المهمة كيما وقتاش بدات المشكلة، شنوا جربت، إلخ.',
    address: 'العنوان',
    addressPlaceholder: 'مثال: تونس، المنزه',
    addressDetails: 'تفاصيل العنوان',
    addressDetailsPlaceholder: 'العمارة، الشقة، الطابق، إلخ.',
    photos: 'الصور',
    photosHint: 'ارفع صور المشكلة (اختياري)',
    addPhotos: 'أضف صور',
    inspectionRequired: 'معاينة أولاً',
    inspectionHint: 'العامل يجي يشوف قبل ما يعطيك السوم',
    priceAfterInspection: 'السعر بعد المعاينة',
    priceAfterInspectionHint: 'تاخذ السوم بعد ما العامل يشوف المشكلة',
    preferredDate: 'التاريخ المفضل',
    preferredTime: 'الوقت المفضل',
    morning: 'الصباح',
    morningTime: '8 - 12',
    afternoon: 'بعد الظهر',
    afternoonTime: '12 - 5',
    evening: 'المساء',
    eveningTime: '5 - 9',
    
    reviewTitle: 'راجع طلبك',
    service: 'الخدمة',
    issue: 'المشكلة',
    location: 'المكان',
    schedule: 'الموعد',
    options: 'الخيارات',
    
    back: 'رجوع',
    next: 'التالي',
    submit: 'أرسل الطلب',
    submitting: 'جاري الإرسال...',
    
    successTitle: 'تم نشر الطلب!',
    successDesc: 'سيتم إعلام العمال ويمكنهم التقدم لطلبك.',
    viewJob: 'شوف الطلب',
    postAnother: 'انشر طلب آخر',
    errorTitle: 'صار خطأ',
    tryAgain: 'حاول مرة أخرى',
    
    selectCategory: 'اختر نوع الخدمة',
    enterDescription: 'اوصف المشكلة',
    enterAddress: 'ادخل العنوان',
    selectDate: 'اختر التاريخ',
    selectTime: 'اختر الوقت',
  },
};

type Category = 'plumbing' | 'electrical' | 'ac' | 'cleaning';
type TimeSlot = 'morning' | 'afternoon' | 'evening';

interface JobFormData {
  category: Category | null;
  description: string;
  address: string;
  address_details: string;
  photos: string[];
  inspection_required: boolean;
  price_after_inspection: boolean;
  preferred_date: string;
  preferred_time_slot: TimeSlot | null;
}

interface JobFormProps {
  locale: Locale;
  onSuccess?: (jobId: string) => void;
  onCancel?: () => void;
}

const categories: { id: Category; icon: React.ReactNode; color: string }[] = [
  { id: 'plumbing', icon: <Wrench className="w-8 h-8" />, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' },
  { id: 'electrical', icon: <Zap className="w-8 h-8" />, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400' },
  { id: 'ac', icon: <Wind className="w-8 h-8" />, color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-400' },
  { id: 'cleaning', icon: <Sparkles className="w-8 h-8" />, color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' },
];

export default function JobForm({ locale, onSuccess, onCancel }: JobFormProps) {
  const t = translations[locale];
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<JobFormData>({
    category: null,
    description: '',
    address: '',
    address_details: '',
    photos: [],
    inspection_required: false,
    price_after_inspection: false,
    preferred_date: '',
    preferred_time_slot: null,
  });

  const updateField = <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.category) {
          setError(t.selectCategory);
          return false;
        }
        break;
      case 2:
        if (!formData.description.trim()) {
          setError(t.enterDescription);
          return false;
        }
        break;
      case 3:
        if (!formData.address.trim()) {
          setError(t.enterAddress);
          return false;
        }
        if (!formData.preferred_date) {
          setError(t.selectDate);
          return false;
        }
        if (!formData.preferred_time_slot) {
          setError(t.selectTime);
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'demo'}`,
        },
        body: JSON.stringify({
          category: formData.category,
          description: formData.description,
          address: formData.address,
          address_details: formData.address_details,
          photos: formData.photos,
          inspection_required: formData.inspection_required,
          price_after_inspection: formData.price_after_inspection,
          preferred_date: formData.preferred_date,
          preferred_time_slot: formData.preferred_time_slot,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSuccess(true);
        setCreatedJobId(result.job?.id || null);
        onSuccess?.(result.job?.id);
      } else {
        setError(result.error || t.errorTitle);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(t.errorTitle);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: null,
      description: '',
      address: '',
      address_details: '',
      photos: [],
      inspection_required: false,
      price_after_inspection: false,
      preferred_date: '',
      preferred_time_slot: null,
    });
    setStep(1);
    setSuccess(false);
    setCreatedJobId(null);
    setError(null);
  };

  const getCategoryLabel = (cat: Category) => t[cat as keyof typeof t] as string;
  const getCategoryDesc = (cat: Category) => t[`${cat}Desc` as keyof typeof t] as string;

  const getTimeSlotLabel = (slot: TimeSlot) => {
    const labels = { morning: t.morning, afternoon: t.afternoon, evening: t.evening };
    return labels[slot];
  };

  const getTimeSlotTime = (slot: TimeSlot) => {
    const times = { morning: t.morningTime, afternoon: t.afternoonTime, evening: t.eveningTime };
    return times[slot];
  };

  // Get min date (today)
  const today = new Date().toISOString().split('T')[0];

  // Success state
  if (success) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            {t.successTitle}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {t.successDesc}
          </p>
          <div className={`flex gap-3 justify-center`}>
            {createdJobId && (
              <Button
                variant="outline"
                onClick={() => window.location.href = `/${locale}/customer/jobs/${createdJobId}`}
              >
                <Eye className={`w-4 h-4 me-2`} />
                {t.viewJob}
              </Button>
            )}
            <Button onClick={resetForm}>
              {t.postAnother}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col items-center z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  s < step
                    ? 'bg-green-500 text-white'
                    : s === step
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                }`}
              >
                {s < step ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              <span className="text-xs mt-2 text-neutral-600 dark:text-neutral-400 hidden sm:block">
                {s === 1 && t.step1Title}
                {s === 2 && t.step2Title}
                {s === 3 && t.step3Title}
                {s === 4 && t.step4Title}
              </span>
            </div>
          ))}
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-neutral-200 dark:bg-neutral-700 -z-0">
            <div
              className="h-full bg-primary-600 transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3`}>
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700 dark:text-red-400">{error}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && t.step1Title}
            {step === 2 && t.step2Title}
            {step === 3 && t.step3Title}
            {step === 4 && t.step4Title}
          </CardTitle>
          <CardDescription>
            {step === 1 && t.step1Desc}
            {step === 2 && t.step2Desc}
            {step === 3 && t.step3Desc}
            {step === 4 && t.step4Desc}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Step 1: Category Selection */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateField('category', cat.id)}
                  className={`p-6 rounded-xl border-2 transition-all text-center ${
                    formData.category === cat.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full ${cat.color} flex items-center justify-center mx-auto mb-3`}>
                    {cat.icon}
                  </div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                    {getCategoryLabel(cat.id)}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {getCategoryDesc(cat.id)}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Description */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="description" className="text-base font-medium">
                  {t.description} *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder={t.descriptionPlaceholder}
                  className="mt-2 min-h-[150px]"
                />
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {t.descriptionHint}
                </p>
              </div>

              <div>
                <Label className="text-base font-medium">{t.photos}</Label>
                <div className="mt-2 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-8 text-center">
                  <Camera className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                  <Button variant="outline" size="sm">
                    <Camera className={`w-4 h-4 me-2`} />
                    {t.addPhotos}
                  </Button>
                  <p className="mt-2 text-sm text-neutral-500">{t.photosHint}</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800`}>
                  <input
                    type="checkbox"
                    checked={formData.inspection_required}
                    onChange={(e) => {
                      updateField('inspection_required', e.target.checked);
                      updateField('price_after_inspection', e.target.checked);
                    }}
                    className="w-5 h-5 rounded border-neutral-300"
                  />
                  <div>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {t.inspectionRequired}
                    </span>
                    <p className="text-sm text-neutral-500">{t.inspectionHint}</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Location & Time */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="address" className="text-base font-medium">
                  <MapPin className={`w-4 h-4 inline me-2`} />
                  {t.address} *
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder={t.addressPlaceholder}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="address_details" className="text-base font-medium">
                  {t.addressDetails}
                </Label>
                <Input
                  id="address_details"
                  value={formData.address_details}
                  onChange={(e) => updateField('address_details', e.target.value)}
                  placeholder={t.addressDetailsPlaceholder}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="date" className="text-base font-medium">
                  <Calendar className={`w-4 h-4 inline me-2`} />
                  {t.preferredDate} *
                </Label>
                <DatePicker
                  id="date"
                  value={formData.preferred_date}
                  onChange={(date) => updateField('preferred_date', date)}
                  min={today}
                  className="mt-2"
                  locale={locale}
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  <Clock className={`w-4 h-4 inline me-2`} />
                  {t.preferredTime} *
                </Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {(['morning', 'afternoon', 'evening'] as TimeSlot[]).map((slot) => (
                    <button
                      key={slot}
                      onClick={() => updateField('preferred_time_slot', slot)}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        formData.preferred_time_slot === slot
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300'
                      }`}
                    >
                      <span className="font-medium text-neutral-900 dark:text-neutral-100 block">
                        {getTimeSlotLabel(slot)}
                      </span>
                      <span className="text-sm text-neutral-500">{getTimeSlotTime(slot)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {t.reviewTitle}
              </h3>

              <div className="space-y-4">
                <div className={`flex justify-between items-start p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg`}>
                  <div>
                    <span className="text-sm text-neutral-500">{t.service}</span>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {formData.category && getCategoryLabel(formData.category)}
                    </p>
                  </div>
                  <Badge className={categories.find(c => c.id === formData.category)?.color}>
                    {formData.category && categories.find(c => c.id === formData.category)?.icon}
                  </Badge>
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <span className="text-sm text-neutral-500">{t.issue}</span>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                    {formData.description}
                  </p>
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <span className="text-sm text-neutral-500">{t.location}</span>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                    {formData.address}
                    {formData.address_details && ` - ${formData.address_details}`}
                  </p>
                </div>

                <div className={`flex gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg`}>
                  <div className="flex-1">
                    <span className="text-sm text-neutral-500">{t.preferredDate}</span>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                      {formData.preferred_date}
                    </p>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-neutral-500">{t.preferredTime}</span>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                      {formData.preferred_time_slot && getTimeSlotLabel(formData.preferred_time_slot)}
                    </p>
                  </div>
                </div>

                {(formData.inspection_required || formData.price_after_inspection) && (
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <span className="text-sm text-neutral-500">{t.options}</span>
                    <div className={`flex gap-2 mt-2 flex-wrap`}>
                      {formData.inspection_required && (
                        <Badge variant="outline">{t.inspectionRequired}</Badge>
                      )}
                      {formData.price_after_inspection && (
                        <Badge variant="outline">{t.priceAfterInspection}</Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        {/* Navigation Buttons */}
        <div className={`px-6 pb-6 flex gap-3`}>
          {step > 1 && (
            <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
              <ArrowLeft className="w-4 h-4 me-2 rtl:rotate-180" />
              {t.back}
            </Button>
          )}
          
          {onCancel && step === 1 && (
            <Button variant="outline" onClick={onCancel}>
              {t.back}
            </Button>
          )}

          <div className="flex-1" />

          {step < 4 && (
            <Button onClick={nextStep}>
              {t.next}
              <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
            </Button>
          )}

          {step === 4 && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className={`w-4 h-4 animate-spin me-2`} />
                  {t.submitting}
                </>
              ) : (
                <>
                  <CheckCircle className={`w-4 h-4 me-2`} />
                  {t.submit}
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
