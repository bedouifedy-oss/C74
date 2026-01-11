'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Camera, 
  FileText, 
  Briefcase, 
  Calendar,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Loader2,
  Wrench,
  Zap,
  Wind,
  Sparkles,
  PaintBucket,
  Home,
} from 'lucide-react';
import type { Locale } from '@/i18n-routing';

const translations = {
  en: {
    title: 'Complete Your Profile',
    subtitle: 'Set up your worker account to start receiving job requests',
    
    // Steps
    step1: 'Profile Photo',
    step2: 'ID Verification',
    step3: 'Service Category',
    step4: 'Bio & Experience',
    step5: 'Availability',
    step6: 'Terms & Conditions',
    
    // Step 1
    uploadPhoto: 'Upload Profile Photo',
    photoDesc: 'A clear photo helps customers trust you',
    takePhoto: 'Take Photo',
    chooseFile: 'Choose File',
    photoTip: 'Tip: Use a professional-looking photo with good lighting',
    
    // Step 2
    uploadId: 'Upload ID Document',
    idDesc: 'We need to verify your identity for safety',
    idFront: 'Front of ID',
    idBack: 'Back of ID (optional)',
    idTip: 'Accepted: CIN, Passport, Driver\'s License',
    
    // Step 3
    selectCategory: 'Select Your Service',
    categoryDesc: 'Choose the service you provide',
    plumbing: 'Plumbing',
    electrical: 'Electrical',
    ac: 'AC & Heating',
    cleaning: 'Cleaning',
    painting: 'Painting',
    general: 'General Repairs',
    
    // Step 4
    writeBio: 'Tell Us About Yourself',
    bioDesc: 'Help customers know your experience',
    bioPlaceholder: 'Describe your experience, skills, and what makes you great at your job...',
    yearsExperience: 'Years of Experience',
    
    // Step 5
    setAvailability: 'Set Your Availability',
    availabilityDesc: 'When are you available for jobs?',
    weekdays: 'Weekdays',
    weekends: 'Weekends',
    morning: 'Morning (8am-12pm)',
    afternoon: 'Afternoon (12pm-5pm)',
    evening: 'Evening (5pm-9pm)',
    
    // Step 6
    termsTitle: 'Terms & Conditions',
    termsDesc: 'Please review and agree to our platform terms',
    agreeTerms: 'I agree to the platform Terms & Conditions',
    termsLink: 'View Full Terms & Conditions',
    
    // Navigation
    next: 'Next',
    back: 'Back',
    skip: 'Skip for now',
    complete: 'Complete Setup',
    submitting: 'Submitting...',
    
    // Completion
    allDone: 'You\'re All Set!',
    pendingReview: 'Your profile is pending admin review. You\'ll be notified when approved.',
    goToDashboard: 'Go to Dashboard',
  },
  fr: {
    title: 'Complétez Votre Profil',
    subtitle: 'Configurez votre compte pour commencer à recevoir des demandes',
    
    step1: 'Photo de Profil',
    step2: 'Vérification ID',
    step3: 'Catégorie',
    step4: 'Bio & Expérience',
    step5: 'Disponibilité',
    
    uploadPhoto: 'Télécharger une Photo',
    photoDesc: 'Une photo claire aide les clients à vous faire confiance',
    takePhoto: 'Prendre une Photo',
    chooseFile: 'Choisir un Fichier',
    photoTip: 'Conseil: Utilisez une photo professionnelle avec un bon éclairage',
    
    uploadId: 'Télécharger une Pièce d\'Identité',
    idDesc: 'Nous devons vérifier votre identité pour la sécurité',
    idFront: 'Recto de l\'ID',
    idBack: 'Verso (optionnel)',
    idTip: 'Acceptés: CIN, Passeport, Permis de conduire',
    
    selectCategory: 'Sélectionnez Votre Service',
    categoryDesc: 'Choisissez le service que vous proposez',
    plumbing: 'Plomberie',
    electrical: 'Électricité',
    ac: 'Climatisation',
    cleaning: 'Nettoyage',
    painting: 'Peinture',
    general: 'Réparations Générales',
    
    writeBio: 'Parlez-nous de Vous',
    bioDesc: 'Aidez les clients à connaître votre expérience',
    bioPlaceholder: 'Décrivez votre expérience et vos compétences...',
    yearsExperience: 'Années d\'Expérience',
    
    setAvailability: 'Définir Votre Disponibilité',
    availabilityDesc: 'Quand êtes-vous disponible?',
    weekdays: 'Jours de semaine',
    weekends: 'Week-ends',
    morning: 'Matin (8h-12h)',
    afternoon: 'Après-midi (12h-17h)',
    evening: 'Soir (17h-21h)',
    
    // Step 6
    termsTitle: 'Conditions Générales',
    termsDesc: 'Veuillez consulter et accepter nos conditions générales',
    agreeTerms: 'J\'accepte les Conditions Générales de la plateforme',
    termsLink: 'Voir les Conditions Générales complètes',
    
    next: 'Suivant',
    back: 'Retour',
    skip: 'Passer',
    complete: 'Terminer',
    submitting: 'Envoi...',
    
    allDone: 'C\'est Terminé!',
    pendingReview: 'Votre profil est en attente de validation. Vous serez notifié.',
    goToDashboard: 'Aller au Tableau de Bord',
  },
  'ar-TN': {
    title: 'أكمل ملفك الشخصي',
    subtitle: 'أعدّ حسابك للبدء في استقبال طلبات العمل',
    
    step1: 'صورة شخصية',
    step2: 'التحقق من الهوية',
    step3: 'نوع الخدمة',
    step4: 'السيرة والخبرة',
    step5: 'التوفر',
    
    uploadPhoto: 'ارفع صورة شخصية',
    photoDesc: 'صورة واضحة تساعد الحرفاء على الثقة بك',
    takePhoto: 'التقط صورة',
    chooseFile: 'اختر ملف',
    photoTip: 'نصيحة: استخدم صورة احترافية بإضاءة جيدة',
    
    uploadId: 'ارفع بطاقة الهوية',
    idDesc: 'نحتاج التحقق من هويتك للأمان',
    idFront: 'وجه البطاقة',
    idBack: 'ظهر البطاقة (اختياري)',
    idTip: 'مقبول: بطاقة التعريف، جواز السفر، رخصة السياقة',
    
    selectCategory: 'اختر نوع خدمتك',
    categoryDesc: 'اختر الخدمة التي تقدمها',
    plumbing: 'السباكة',
    electrical: 'الكهرباء',
    ac: 'التكييف',
    cleaning: 'التنظيف',
    painting: 'الدهان',
    general: 'إصلاحات عامة',
    
    writeBio: 'عرّف بنفسك',
    bioDesc: 'ساعد الحرفاء على معرفة خبرتك',
    bioPlaceholder: 'اوصف خبرتك ومهاراتك...',
    yearsExperience: 'سنوات الخبرة',
    
    setAvailability: 'حدد توفرك',
    availabilityDesc: 'متى تكون متاحاً للعمل؟',
    weekdays: 'أيام الأسبوع',
    weekends: 'نهاية الأسبوع',
    morning: 'صباحاً (8-12)',
    afternoon: 'بعد الظهر (12-5)',
    evening: 'مساءً (5-9)',
    
    // Step 6
    termsTitle: 'الشروط والأحكام',
    termsDesc: 'يرجى مراجعة والموافقة على شروط منصتنا',
    agreeTerms: 'أوافق على شروط وأحكام المنصة',
    termsLink: 'عرض الشروط والأحكام الكاملة',
    
    next: 'التالي',
    back: 'رجوع',
    skip: 'تخطي',
    complete: 'إنهاء الإعداد',
    submitting: 'جاري الإرسال...',
    
    allDone: 'تم الإعداد!',
    pendingReview: 'ملفك في انتظار مراجعة الإدارة. سيتم إعلامك عند القبول.',
    goToDashboard: 'اذهب للوحة التحكم',
  },
};

const categories = [
  { key: 'plumbing', icon: Wrench, color: 'bg-blue-100 text-blue-600' },
  { key: 'electrical', icon: Zap, color: 'bg-amber-100 text-amber-600' },
  { key: 'ac', icon: Wind, color: 'bg-cyan-100 text-cyan-600' },
  { key: 'cleaning', icon: Sparkles, color: 'bg-emerald-100 text-emerald-600' },
  { key: 'painting', icon: PaintBucket, color: 'bg-purple-100 text-purple-600' },
  { key: 'general', icon: Home, color: 'bg-neutral-100 text-neutral-600' },
];

interface OnboardingWizardProps {
  locale: Locale;
  onComplete: () => void;
}

export function OnboardingWizard({ locale, onComplete }: OnboardingWizardProps) {
  const t = translations[locale];
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Form data
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [bio, setBio] = useState('');
  const [yearsExp, setYearsExp] = useState('');
  const [availability, setAvailability] = useState({
    weekdays: { morning: true, afternoon: true, evening: false },
    weekends: { morning: false, afternoon: true, evening: false },
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  const totalSteps = 6;
  const steps = [t.step1, t.step2, t.step3, t.step4, t.step5, t.step6];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleAvailability = (day: 'weekdays' | 'weekends', slot: 'morning' | 'afternoon' | 'evening') => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], [slot]: !prev[day][slot] }
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (!token || !userData) {
        throw new Error('Authentication required');
      }

      const user = JSON.parse(userData);
      
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add profile photo if available
      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
      }
      
      // Add ID documents if available
      if (idFront) {
        formData.append('id_front', idFront);
      }
      if (idBack) {
        formData.append('id_back', idBack);
      }
      
      // Add other form data
      formData.append('category', selectedCategory);
      formData.append('bio', bio);
      formData.append('years_experience', yearsExp);
      formData.append('availability', JSON.stringify(availability));
      formData.append('terms_accepted', termsAccepted.toString());
      formData.append('onboarding_completed', 'true');
      
      const response = await fetch('/api/workers/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      // Update user data to reflect onboarding completion
      const updatedUser = { ...user, onboarding_completed: true };
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      setIsSubmitting(false);
      setIsComplete(true);
      
    } catch (error) {
      console.error('Profile update error:', error);
      setIsSubmitting(false);
      // You could add error state and display it to user
      alert(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t.allDone}</h2>
            <p className="text-neutral-500 mb-6">{t.pendingReview}</p>
            <Button onClick={onComplete} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {t.goToDashboard}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-neutral-900 dark:to-neutral-800 p-4">
      <div className="max-w-lg mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{t.title}</h1>
          <p className="text-neutral-500 mt-1">{t.subtitle}</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, idx) => (
              <div 
                key={idx}
                className={`flex-1 text-center text-xs ${
                  idx + 1 <= currentStep ? 'text-emerald-600 font-medium' : 'text-neutral-400'
                }`}
              >
                {idx + 1 === currentStep && step}
              </div>
            ))}
          </div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <p className="text-center text-sm text-neutral-500 mt-2">
            {currentStep} / {totalSteps}
          </p>
        </div>

        {/* Step Content */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            {/* Step 1: Profile Photo */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">{t.uploadPhoto}</h3>
                  <p className="text-sm text-neutral-500">{t.photoDesc}</p>
                </div>
                
                <div className="flex flex-col items-center gap-4">
                  {profilePhotoPreview ? (
                    <img 
                      src={profilePhotoPreview} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-emerald-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      <User className="w-16 h-16 text-neutral-300" />
                    </div>
                  )}
                  
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    <Button variant="outline" asChild>
                      <span><Upload className={`w-4 h-4 me-2`} />{t.chooseFile}</span>
                    </Button>
                  </label>
                </div>
                
                <p className="text-xs text-neutral-400 text-center">{t.photoTip}</p>
              </div>
            )}

            {/* Step 2: ID Verification */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">{t.uploadId}</h3>
                  <p className="text-sm text-neutral-500">{t.idDesc}</p>
                </div>
                
                <div className="grid gap-4">
                  <div>
                    <Label>{t.idFront} *</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500">
                      <input type="file" accept="image/*" className="hidden" id="id-front" onChange={(e) => setIdFront(e.target.files?.[0] || null)} />
                      <label htmlFor="id-front" className="cursor-pointer">
                        {idFront ? (
                          <p className="text-emerald-600">{idFront.name}</p>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                            <p className="text-sm text-neutral-500">{t.chooseFile}</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <Label>{t.idBack}</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500">
                      <input type="file" accept="image/*" className="hidden" id="id-back" onChange={(e) => setIdBack(e.target.files?.[0] || null)} />
                      <label htmlFor="id-back" className="cursor-pointer">
                        {idBack ? (
                          <p className="text-emerald-600">{idBack.name}</p>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                            <p className="text-sm text-neutral-500">{t.chooseFile}</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-neutral-400 text-center">{t.idTip}</p>
              </div>
            )}

            {/* Step 3: Category Selection */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Briefcase className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">{t.selectCategory}</h3>
                  <p className="text-sm text-neutral-500">{t.categoryDesc}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(cat => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => setSelectedCategory(cat.key)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSelected 
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full ${cat.color} flex items-center justify-center mx-auto mb-2`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <p className={`text-sm font-medium ${isSelected ? 'text-emerald-600' : ''}`}>
                          {t[cat.key as keyof typeof t]}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Bio */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <User className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">{t.writeBio}</h3>
                  <p className="text-sm text-neutral-500">{t.bioDesc}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bio">{t.writeBio}</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={t.bioPlaceholder}
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="years">{t.yearsExperience}</Label>
                    <Input
                      id="years"
                      type="number"
                      min="0"
                      max="50"
                      value={yearsExp}
                      onChange={(e) => setYearsExp(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Availability */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">{t.setAvailability}</h3>
                  <p className="text-sm text-neutral-500">{t.availabilityDesc}</p>
                </div>
                
                <div className="space-y-4">
                  {(['weekdays', 'weekends'] as const).map(day => (
                    <div key={day} className="p-4 border rounded-lg">
                      <p className="font-medium mb-3">{t[day]}</p>
                      <div className="flex flex-wrap gap-2">
                        {(['morning', 'afternoon', 'evening'] as const).map(slot => (
                          <button
                            key={slot}
                            onClick={() => toggleAvailability(day, slot)}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                              availability[day][slot]
                                ? 'bg-emerald-500 text-white'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                            }`}
                          >
                            {t[slot]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Terms & Conditions */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    {t.termsTitle}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {t.termsDesc}
                  </p>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                    Platform Terms & Conditions
                  </h4>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-3">
                    <p>
                      <strong>1. Service Agreement:</strong> By using this platform, you agree to provide professional services to customers with honesty and integrity.
                    </p>
                    <p>
                      <strong>2. Payment Terms:</strong> All payments are processed through the platform. You agree to the platform's fee structure and payment schedule.
                    </p>
                    <p>
                      <strong>3. Professional Conduct:</strong> You must maintain professional behavior, arrive on time, and complete work as agreed with customers.
                    </p>
                    <p>
                      <strong>4. Privacy & Data:</strong> You agree to protect customer privacy and not share personal information without consent.
                    </p>
                    <p>
                      <strong>5. Dispute Resolution:</strong> Any disputes will be handled through the platform's resolution process.
                    </p>
                    <p>
                      <strong>6. Platform Policies:</strong> You agree to follow all platform policies regarding cancellations, refunds, and service quality.
                    </p>
                  </div>
                  <button 
                    type="button"
                    className="text-emerald-600 hover:text-emerald-700 text-sm mt-3 underline"
                    onClick={() => window.open('/terms', '_blank')}
                  >
                    {t.termsLink}
                  </button>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-emerald-600 border-neutral-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="terms" className="text-sm text-neutral-600 dark:text-neutral-400">
                    {t.agreeTerms}
                  </label>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className={`flex items-center justify-between mt-8`}>
              {currentStep > 1 ? (
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className={`w-4 h-4 me-2 rtl:rotate-180`} />
                  {t.back}
                </Button>
              ) : (
                <div />
              )}
              
              {currentStep < totalSteps ? (
                <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">
                  {t.next}
                  <ArrowRight className={`w-4 h-4 ms-2 rtl:rotate-180`} />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={isSubmitting || (currentStep === 6 && !termsAccepted)} className="bg-emerald-600 hover:bg-emerald-700">
                  {isSubmitting ? (
                    <>
                      <Loader2 className={`w-4 h-4 animate-spin me-2`} />
                      {t.submitting}
                    </>
                  ) : (
                    <>
                      <CheckCircle className={`w-4 h-4 me-2`} />
                      {t.complete}
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OnboardingWizard;
