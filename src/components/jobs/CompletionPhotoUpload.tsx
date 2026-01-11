'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Camera,
  Upload,
  X,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import type { Locale } from '@/i18n-routing';

const translations = {
  en: {
    title: 'Upload Completion Photos',
    subtitle: 'Show the customer the completed work',
    uploadPhotos: 'Upload Photos',
    uploadDesc: 'Take photos of the completed work',
    takePhoto: 'Take Photo',
    selectFiles: 'Select from Gallery',
    addNotes: 'Add Notes (Optional)',
    notesPlaceholder: 'Describe the work done, any recommendations, etc.',
    photos: 'photos',
    submit: 'Submit & Mark Complete',
    submitting: 'Submitting...',
    cancel: 'Cancel',
    minPhotos: 'Please upload at least 1 photo',
    success: 'Photos submitted successfully!',
  },
  fr: {
    title: 'Télécharger les Photos',
    subtitle: 'Montrez au client le travail terminé',
    uploadPhotos: 'Télécharger des Photos',
    uploadDesc: 'Prenez des photos du travail terminé',
    takePhoto: 'Prendre une Photo',
    selectFiles: 'Sélectionner depuis la Galerie',
    addNotes: 'Ajouter des Notes (Optionnel)',
    notesPlaceholder: 'Décrivez le travail effectué, recommandations...',
    photos: 'photos',
    submit: 'Soumettre & Marquer Terminé',
    submitting: 'Envoi...',
    cancel: 'Annuler',
    minPhotos: 'Veuillez télécharger au moins 1 photo',
    success: 'Photos envoyées avec succès!',
  },
  'ar-TN': {
    title: 'ارفع صور الإنجاز',
    subtitle: 'ورّي الحريف الخدمة المكملة',
    uploadPhotos: 'ارفع صور',
    uploadDesc: 'صور الخدمة المكملة',
    takePhoto: 'التقط صورة',
    selectFiles: 'اختر من المعرض',
    addNotes: 'أضف ملاحظات (اختياري)',
    notesPlaceholder: 'اوصف الخدمة اللي عملتها، توصيات...',
    photos: 'صور',
    submit: 'أرسل وأكمل الطلب',
    submitting: 'جاري الإرسال...',
    cancel: 'إلغاء',
    minPhotos: 'ارفع على الأقل صورة وحدة',
    success: 'تم إرسال الصور بنجاح!',
  },
};

interface CompletionPhotoUploadProps {
  jobId: string;
  locale: Locale;
  onComplete: () => void;
  onCancel: () => void;
}

export function CompletionPhotoUpload({
  jobId,
  locale,
  onComplete,
  onCancel,
}: CompletionPhotoUploadProps) {
  const t = translations[locale];

  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setPhotos(prev => [...prev, ...newPhotos].slice(0, 5)); // Max 5 photos
      setError('');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      setError(t.minPhotos);
      return;
    }

    setIsSubmitting(true);

    try {
      // In production, upload photos to storage first
      // const photoUrls = await uploadPhotos(photos);

      // Then update job status
      await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          status: 'completed',
          completion_notes: notes,
          completion_photos: photos.map((_, i) => `photo_${i}.jpg`), // Placeholder URLs
        }),
      });

      onComplete();
    } catch (err) {
      console.error('Failed to submit completion:', err);
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className={`flex items-center gap-2`}>
          <Camera className="w-5 h-5 text-emerald-500" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.subtitle}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Photo Grid */}
        <div>
          <Label>{t.uploadPhotos}</Label>
          <p className="text-sm text-neutral-500 mb-3">{t.uploadDesc}</p>

          <div className="grid grid-cols-3 gap-3">
            {/* Existing Photos */}
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={photo.preview}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add Photo Button */}
            {photos.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-emerald-500 transition-colors"
              >
                <ImageIcon className="w-8 h-8 text-neutral-400" />
                <span className="text-xs text-neutral-500">
                  {photos.length}/5 {t.photos}
                </span>
              </button>
            )}
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Upload Buttons */}
          <div className={`flex gap-2 mt-4`}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1"
            >
              <Camera className={`w-4 h-4 me-2`} />
              {t.takePhoto}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className={`w-4 h-4 me-2`} />
              {t.selectFiles}
            </Button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label>{t.addNotes}</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.notesPlaceholder}
            rows={3}
            className="mt-2"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* Actions */}
        <div className={`flex gap-3 pt-4`}>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            {t.cancel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
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
        </div>
      </CardContent>
    </Card>
  );
}

export default CompletionPhotoUpload;
