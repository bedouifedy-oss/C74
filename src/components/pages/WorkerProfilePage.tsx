'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useLocale } from '@/hooks/useLocale';
import {
  User,
  Calendar,
  Briefcase,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Star,
  Camera,
  Upload
} from 'lucide-react';
import ReviewsDisplay from '@/components/ReviewsDisplay';
import { HeaderMenu, getWorkerMenuItems } from '@/components/HeaderMenu';

const translations = {
  en: {
    profile: 'Worker Profile',
    editProfile: 'Edit Profile',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    personalInfo: 'Personal Information',
    professionalInfo: 'Professional Information',
    availability: 'Availability',
    skills: 'Skills',
    experience: 'Experience',
    category: 'Category',
    fullName: 'Full Name',
    phone: 'Phone Number',
    email: 'Email Address',
    location: 'Location',
    bio: 'Bio',
    hourlyRate: 'Hourly Rate (TND)',
    yearsOfExperience: 'Years of Experience',
    addSkill: 'Add Skill',
    addExperience: 'Add Experience',
    currentJob: 'Current Job',
    previousJob: 'Previous Job',
    companyName: 'Company Name',
    duration: 'Duration',
    description: 'Description',
    available: 'Available',
    notAvailable: 'Not Available',
    remove: 'Remove',
    success: 'Profile updated successfully!',
    error: 'Failed to update profile'
  },
  fr: {
    profile: 'Profil travailleur',
    editProfile: 'Modifier le profil',
    saveChanges: 'Sauvegarder les modifications',
    cancel: 'Annuler',
    personalInfo: 'Informations personnelles',
    professionalInfo: 'Informations professionnelles',
    availability: 'Disponibilité',
    skills: 'Compétences',
    experience: 'Expérience',
    category: 'Catégorie',
    fullName: 'Nom complet',
    phone: 'Numéro de téléphone',
    email: 'Adresse e-mail',
    location: 'Localisation',
    bio: 'Bio',
    hourlyRate: 'Taux horaire (TND)',
    yearsOfExperience: 'Années d\'expérience',
    addSkill: 'Ajouter une compétence',
    addExperience: 'Ajouter une expérience',
    currentJob: 'Emploi actuel',
    previousJob: 'Emploi précédent',
    companyName: 'Nom de l\'entreprise',
    duration: 'Durée',
    description: 'Description',
    available: 'Disponible',
    notAvailable: 'Indisponible',
    remove: 'Supprimer',
    success: 'Profil mis à jour avec succès!',
    error: 'Échec de la mise à jour du profil'
  },
  'ar-TN': {
    profile: 'ملف العامل',
    editProfile: 'تعديل الملف',
    saveChanges: 'حفظ التغييرات',
    cancel: 'إلغاء',
    personalInfo: 'المعلومات الشخصية',
    professionalInfo: 'المعلومات المهنية',
    availability: 'التوفر',
    skills: 'المهارات',
    experience: 'الخبرة',
    category: 'الفئة',
    fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    location: 'الموقع',
    bio: 'السيرة الذاتية',
    hourlyRate: 'سعر الساعة (دينار)',
    yearsOfExperience: 'سنوات الخبرة',
    addSkill: 'إضافة مهارة',
    addExperience: 'إضافة خبرة',
    currentJob: 'الوظيفة الحالية',
    previousJob: 'الوظيفة السابقة',
    companyName: 'اسم الشركة',
    duration: 'المدة',
    description: 'الوصف',
    available: 'متاح',
    notAvailable: 'غير متاح',
    remove: 'إزالة',
    success: 'تم تحديث الملف بنجاح!',
    error: 'فشل في تحديث الملف'
  }
};

type WorkerProfile = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  location: string;
  bio: string;
  hourlyRate: number;
  yearsOfExperience: number;
  category: string;
  photoUrl: string;
  skills: string[];
  experience: Array<{
    id: string;
    type: string;
    companyName: string;
    position: string;
    duration: string;
    description: string;
  }>;
  availability: {
    available: boolean;
    days: string[];
    timeSlots: string[];
  };
  rating: number;
  completedJobs: number;
  verificationStatus: string;
};

const emptyProfile: WorkerProfile = {
  id: '',
  fullName: '',
  phone: '',
  email: '',
  location: '',
  bio: '',
  hourlyRate: 0,
  yearsOfExperience: 0,
  category: '',
  photoUrl: '',
  skills: [],
  experience: [],
  availability: {
    available: true,
    days: [],
    timeSlots: []
  },
  rating: 0,
  completedJobs: 0,
  verificationStatus: 'pending'
};

export default function WorkerProfilePage() {
  const { locale, setLocale, isClient } = useLocale();
  const t = translations[locale];
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<WorkerProfile>(emptyProfile);
  const [editedProfile, setEditedProfile] = useState<WorkerProfile>(emptyProfile);
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

    const user = JSON.parse(userData);
    if (user.role !== 'worker') {
      window.location.href = `/${locale}/customer/dashboard`;
      return;
    }
  }, [isClient, locale]);

  // Fetch current profile data
  useEffect(() => {
    if (!isClient) return;

    const fetchProfile = async () => {
      try {
        // First try to get basic data from localStorage
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          setProfile(prev => ({
            ...prev,
            id: user.id || '',
            fullName: user.name || '',
            phone: user.phone || '',
            email: user.email || '',
          }));
          setEditedProfile(prev => ({
            ...prev,
            id: user.id || '',
            fullName: user.name || '',
            phone: user.phone || '',
            email: user.email || '',
          }));
        }

        // Then try to fetch full profile from API
        const response = await fetch('/api/workers/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (response.ok) {
          const profileData = await response.json();
          if (profileData && profileData.id) {
            setProfile(profileData);
            setEditedProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isClient]);

  const handleEdit = () => {
    setEditedProfile({ ...profile });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/workers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(editedProfile)
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(result.profile);
        setEditedProfile(result.profile);
        setIsEditing(false);
        alert(t.success);
      } else {
        alert(t.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const [newSkill, setNewSkill] = useState('');
  
  const addSkill = () => {
    if (newSkill.trim() && !editedProfile.skills.includes(newSkill.trim())) {
      setEditedProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addSkill();
    }
  };

  const removeSkill = (index: number) => {
    setEditedProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addExperience = (type: 'current' | 'previous') => {
    const newExperience = {
      id: `exp_${Date.now()}`,
      type,
      companyName: '',
      position: '',
      duration: '',
      description: ''
    };
    setEditedProfile((prev) => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setEditedProfile((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp))
    }));
  };

  const removeExperience = (index: number) => {
    setEditedProfile((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  
  const currentProfile = isEditing ? editedProfile : profile;

  return (
    <div
      className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200"
    >
      {/* Header */}
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getWorkerMenuItems(locale, 'profile')}
        title={t.profile}
        subtitle={currentProfile.fullName}
      />

      {!isClient && (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
          <div className="text-neutral-600 dark:text-neutral-400">
            {locale === 'ar-TN' ? 'جاري التحميل...' : locale === 'fr' ? 'Chargement...' : 'Loading...'}
          </div>
        </div>
      )}

      {isClient && (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t.personalInfo}
                </CardTitle>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit2 className="w-4 h-4 me-2" />
                    {t.editProfile}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave} disabled={isLoading}>
                      <Save className="w-4 h-4 me-2" />
                      {t.saveChanges}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="w-4 h-4 me-2" />
                      {t.cancel}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Photo */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center overflow-hidden">
                    {currentProfile.photoUrl ? (
                      <img src={currentProfile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-neutral-400" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-colors">
                      <Camera className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditedProfile(prev => ({ ...prev, photoUrl: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">{currentProfile.fullName}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {locale === 'ar-TN' ? 'صورة الملف الشخصي' : locale === 'fr' ? 'Photo de profil' : 'Profile Photo'}
                  </p>
                  {isEditing && (
                    <p className="text-xs text-neutral-400 mt-1">
                      {locale === 'ar-TN' ? 'انقر على الكاميرا للتغيير' : locale === 'fr' ? 'Cliquez sur la caméra pour changer' : 'Click camera to change'}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t.fullName}</Label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.fullName}
                      onChange={(e) => setEditedProfile((prev) => ({ ...prev, fullName: e.target.value }))}
                    />
                  ) : (
                    <p className="text-neutral-700 dark:text-neutral-300">{currentProfile.fullName}</p>
                  )}
                </div>
                <div>
                  <Label>{t.phone}</Label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.phone}
                      onChange={(e) => setEditedProfile((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  ) : (
                    <p className="text-neutral-700 dark:text-neutral-300">{currentProfile.phone}</p>
                  )}
                </div>
                <div>
                  <Label>{t.email}</Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <p className="text-neutral-700 dark:text-neutral-300">{currentProfile.email}</p>
                  )}
                </div>
                <div>
                  <Label>{t.location}</Label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.location}
                      onChange={(e) => setEditedProfile((prev) => ({ ...prev, location: e.target.value }))}
                    />
                  ) : (
                    <p className="text-neutral-700 dark:text-neutral-300">{currentProfile.location}</p>
                  )}
                </div>
              </div>
              <div>
                <Label>{t.bio}</Label>
                {isEditing ? (
                  <Textarea
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile((prev) => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                  />
                ) : (
                  <p className="text-neutral-700 dark:text-neutral-300">{currentProfile.bio}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                {t.professionalInfo}
              </CardTitle>
            </CardHeader>
            <CardContent className="mb-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t.category}</Label>
                  {isEditing ? (
                    <Select value={editedProfile.category} onValueChange={(value) => setEditedProfile((prev) => ({ ...prev, category: value }))}>
                      <SelectTrigger className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plumbing">
                          {locale === 'ar-TN' ? 'السباكة' : locale === 'fr' ? 'Plomberie' : 'Plumbing'}
                        </SelectItem>
                        <SelectItem value="electricity">
                          {locale === 'ar-TN' ? 'الكهرباء' : locale === 'fr' ? 'Électricité' : 'Electricity'}
                        </SelectItem>
                        <SelectItem value="ac">
                          {locale === 'ar-TN' ? 'تكييف الهواء' : locale === 'fr' ? 'Climatisation' : 'AC Maintenance'}
                        </SelectItem>
                        <SelectItem value="cleaning">
                          {locale === 'ar-TN' ? 'التنظيف' : locale === 'fr' ? 'Nettoyage' : 'Cleaning'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-neutral-700 dark:text-neutral-300">
                      {currentProfile.category ? 
                        (currentProfile.category === 'plumbing' ? 
                          (locale === 'ar-TN' ? 'السباكة' : locale === 'fr' ? 'Plomberie' : 'Plumbing') :
                          currentProfile.category === 'electricity' ?
                          (locale === 'ar-TN' ? 'الكهرباء' : locale === 'fr' ? 'Électricité' : 'Electricity') :
                          currentProfile.category === 'ac' ?
                          (locale === 'ar-TN' ? 'تكييف الهواء' : locale === 'fr' ? 'Climatisation' : 'AC Maintenance') :
                          currentProfile.category === 'cleaning' ?
                          (locale === 'ar-TN' ? 'التنظيف' : locale === 'fr' ? 'Nettoyage' : 'Cleaning') :
                          currentProfile.category
                        ) : 
                        (locale === 'ar-TN' ? 'غير محدد' : locale === 'fr' ? 'Non spécifié' : 'Not specified')
                      }
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t.hourlyRate}</Label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editedProfile.hourlyRate || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d+$/.test(value)) {
                          setEditedProfile((prev) => ({ ...prev, hourlyRate: value === '' ? 0 : parseInt(value) }));
                        }
                      }}
                      placeholder={locale === 'ar-TN' ? 'سعر الساعة' : locale === 'fr' ? 'Taux horaire' : 'Hourly rate'}
                    />
                  ) : (
                    <p className="text-neutral-700 dark:text-neutral-300">TND {currentProfile.hourlyRate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t.yearsOfExperience}</Label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editedProfile.yearsOfExperience || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d+$/.test(value)) {
                          setEditedProfile((prev) => ({ ...prev, yearsOfExperience: value === '' ? 0 : parseInt(value) }));
                        }
                      }}
                      placeholder={locale === 'ar-TN' ? 'سنوات الخبرة' : locale === 'fr' ? 'Années d\'expérience' : 'Years of experience'}
                    />
                  ) : (
                    <p className="text-neutral-700 dark:text-neutral-300">
                      {currentProfile.yearsOfExperience}{' '}
                      {locale === 'ar-TN' ? 'سنوات' : locale === 'fr' ? 'ans' : 'years'}
                    </p>
                  )}
                </div>

                {/* Skills */}
                <div className="space-y-2 mb-4">
                  <Label className="text-sm font-medium">{t.skills}</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {currentProfile.skills.map((skill: string, index: number) => (
                      <div
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm ${
                          isEditing
                            ? 'bg-primary-100 text-primary-700 flex items-center gap-1'
                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {skill}
                        {isEditing && (
                          <button onClick={() => removeSkill(index)} className="text-primary-500 hover:text-primary-700">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={handleSkillKeyPress}
                        placeholder={locale === 'ar-TN' ? 'أدخل المهارة' : locale === 'fr' ? 'Entrez la compétence' : 'Enter skill'}
                        className="flex-1"
                      />
                      <Button type="button" onClick={addSkill} disabled={!newSkill.trim()}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Experience */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">{t.experience}</Label>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="default" onClick={() => addExperience('current')}>
                          <Plus className="w-4 h-4 me-1" />
                          {t.currentJob}
                        </Button>
                        <Button type="button" variant="outline" size="default" onClick={() => addExperience('previous')}>
                          <Plus className="w-4 h-4 me-1" />
                          {t.previousJob}
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {currentProfile.experience.map((exp: any, index: number) => (
                      <div key={exp.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${exp.type === 'current' ? 'bg-green-500' : 'bg-neutral-400'}`} />
                            <span className="font-medium">{exp.position}</span>
                            <span className="text-neutral-500 text-sm">at {exp.companyName}</span>
                          </div>
                          {isEditing && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeExperience(index)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {isEditing ? (
                          <div className="space-y-3">
                            <Input
                              placeholder={t.companyName}
                              value={editedProfile.experience[index].companyName}
                              onChange={(e) => updateExperience(index, 'companyName', e.target.value)}
                            />
                            <Input
                              placeholder={t.position}
                              value={editedProfile.experience[index].position}
                              onChange={(e) => updateExperience(index, 'position', e.target.value)}
                            />
                            <Input
                              placeholder={t.duration}
                              value={editedProfile.experience[index].duration}
                              onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                            />
                            <Textarea
                              placeholder={t.description}
                              value={editedProfile.experience[index].description}
                              onChange={(e) => updateExperience(index, 'description', e.target.value)}
                              rows={2}
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{exp.duration}</p>
                            <p className="text-neutral-700 dark:text-neutral-300">{exp.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              {locale === 'ar-TN' ? 'التقييمات والمراجعات' : locale === 'fr' ? 'Évaluations et avis' : 'Reviews & Ratings'}
            </CardTitle>
            <CardDescription>
              {locale === 'ar-TN'
                ? 'ما يقوله العملاء عن خدماتي'
                : locale === 'fr'
                  ? 'Ce que les clients disent de mes services'
                  : 'What customers say about my services'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewsDisplay workerId={profile.id} locale={locale} />
          </CardContent>
        </Card>
      </div>
    )}
  </div>
);
}
