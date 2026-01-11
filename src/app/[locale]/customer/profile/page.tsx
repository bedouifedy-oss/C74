'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/hooks/useLocale';
import { User, Phone, Mail, MapPin, Edit2, Save, X, Camera } from 'lucide-react';
import { HeaderMenu, getCustomerMenuItems } from '@/components/HeaderMenu';

const translations = {
  en: {
    profile: 'My Profile',
    editProfile: 'Edit Profile',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    phone: 'Phone Number',
    email: 'Email Address',
    location: 'Location',
    locationPlaceholder: 'Enter your city',
    success: 'Profile updated successfully!',
    error: 'Failed to update profile',
    changePhoto: 'Change Photo',
    memberSince: 'Member since',
    jobsPosted: 'Jobs Posted',
    reviewsGiven: 'Reviews Given',
  },
  fr: {
    profile: 'Mon Profil',
    editProfile: 'Modifier le profil',
    saveChanges: 'Sauvegarder',
    cancel: 'Annuler',
    personalInfo: 'Informations personnelles',
    fullName: 'Nom complet',
    phone: 'Numéro de téléphone',
    email: 'Adresse email',
    location: 'Localisation',
    locationPlaceholder: 'Entrez votre ville',
    success: 'Profil mis à jour avec succès!',
    error: 'Échec de la mise à jour du profil',
    changePhoto: 'Changer la photo',
    memberSince: 'Membre depuis',
    jobsPosted: 'Emplois publiés',
    reviewsGiven: 'Avis donnés',
  },
  'ar-TN': {
    profile: 'ملفي الشخصي',
    editProfile: 'تعديل الملف',
    saveChanges: 'حفظ التغييرات',
    cancel: 'إلغاء',
    personalInfo: 'المعلومات الشخصية',
    fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    location: 'الموقع',
    locationPlaceholder: 'أدخل مدينتك',
    success: 'تم تحديث الملف بنجاح!',
    error: 'فشل في تحديث الملف',
    changePhoto: 'تغيير الصورة',
    memberSince: 'عضو منذ',
    jobsPosted: 'الوظائف المنشورة',
    reviewsGiven: 'التقييمات المقدمة',
  },
};

type CustomerProfile = {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  avatar_url: string;
  created_at: string;
  jobs_posted: number;
  reviews_given: number;
};

const emptyProfile: CustomerProfile = {
  id: '',
  name: '',
  phone: '',
  email: '',
  location: '',
  avatar_url: '',
  created_at: new Date().toISOString(),
  jobs_posted: 0,
  reviews_given: 0,
};

export default function CustomerProfilePage() {
  const { locale, setLocale, isClient } = useLocale();
  const t = translations[locale];

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile>(emptyProfile);
  const [editedProfile, setEditedProfile] = useState<CustomerProfile>(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
  }, [isClient, locale]);

  // Load profile from localStorage
  useEffect(() => {
    if (!isClient) return;

    const loadProfile = () => {
      try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          const loadedProfile: CustomerProfile = {
            id: user.id || '',
            name: user.name || '',
            phone: user.phone || '',
            email: user.email || '',
            location: user.location || '',
            avatar_url: user.avatar_url || '',
            created_at: user.created_at || new Date().toISOString(),
            jobs_posted: user.jobs_posted || 0,
            reviews_given: user.reviews_given || 0,
          };
          setProfile(loadedProfile);
          setEditedProfile(loadedProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
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
    setIsSaving(true);
    try {
      // Update localStorage
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = {
          ...user,
          name: editedProfile.name,
          email: editedProfile.email,
          location: editedProfile.location,
        };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
      }

      // Update API (if available)
      try {
        await fetch('/api/users/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            name: editedProfile.name,
            email: editedProfile.email,
            location: editedProfile.location,
          }),
        });
      } catch {
        // API might not be available, continue with localStorage update
      }

      setProfile(editedProfile);
      setIsEditing(false);
      alert(t.success);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(t.error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(
        locale === 'ar-TN' ? 'ar-TN' : locale === 'fr' ? 'fr-FR' : 'en-US',
        { year: 'numeric', month: 'long' }
      );
    } catch {
      return '';
    }
  };

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-neutral-50 dark:bg-neutral-900"
    >
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getCustomerMenuItems(locale, 'profile')}
        title={t.profile}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className={`flex items-start gap-6`}>
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 end-0 p-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {profile.name || 'User'}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  {t.memberSince} {formatDate(profile.created_at)}
                </p>

                {/* Stats */}
                <div className={`flex gap-6 mt-4`}>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{profile.jobs_posted}</p>
                    <p className="text-sm text-neutral-500">{t.jobsPosted}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{profile.reviews_given}</p>
                    <p className="text-sm text-neutral-500">{t.reviewsGiven}</p>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div>
                {!isEditing ? (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit2 className={`w-4 h-4 me-2`} />
                    {t.editProfile}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" disabled={isSaving}>
                      <Save className={`w-4 h-4 me-2`} />
                      {t.saveChanges}
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className={`w-4 h-4 me-2`} />
                      {t.cancel}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2`}>
              <User className="w-5 h-5 text-emerald-600" />
              {t.personalInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label>{t.fullName}</Label>
              {isEditing ? (
                <Input
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                />
              ) : (
                <p className="text-neutral-900 dark:text-neutral-100 py-2">
                  {profile.name || '-'}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className={`flex items-center gap-2`}>
                <Phone className="w-4 h-4" />
                {t.phone}
              </Label>
              <p className="text-neutral-900 dark:text-neutral-100 py-2" dir="ltr">
                {profile.phone || '-'}
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className={`flex items-center gap-2`}>
                <Mail className="w-4 h-4" />
                {t.email}
              </Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={editedProfile.email}
                  onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                  dir="ltr"
                />
              ) : (
                <p className="text-neutral-900 dark:text-neutral-100 py-2" dir="ltr">
                  {profile.email || '-'}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className={`flex items-center gap-2`}>
                <MapPin className="w-4 h-4" />
                {t.location}
              </Label>
              {isEditing ? (
                <Input
                  value={editedProfile.location}
                  onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                  placeholder={t.locationPlaceholder}
                />
              ) : (
                <p className="text-neutral-900 dark:text-neutral-100 py-2">
                  {profile.location || '-'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
