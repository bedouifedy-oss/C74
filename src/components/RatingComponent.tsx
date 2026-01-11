'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, Clock, CheckCircle } from 'lucide-react';

interface RatingComponentProps {
  jobId: string;
  workerId: string;
  workerName: string;
  jobTitle: string;
  onReviewSubmitted?: () => void;
  className?: string;
  locale?: 'en' | 'fr' | 'ar-TN';
}

const translations = {
  en: {
    rateWorker: 'Rate',
    shareExperience: 'Share your experience with',
    forJob: 'for:',
    overallRating: 'Overall Rating',
    selectRating: 'Select rating',
    communication: 'Communication',
    punctuality: 'Punctuality',
    qualityOfWork: 'Quality of Work',
    yourReview: 'Your Review',
    reviewPlaceholder: 'Share your experience with this worker...',
    submitting: 'Submitting...',
    submitReview: 'Submit Review',
    thankYou: 'Thank you for your review!',
    feedbackHelps: 'Your feedback helps',
    provideBetter: 'provide better service.',
    pleaseProvide: 'Please provide a rating and review',
    pleaseLogin: 'Please log in to submit a review',
    failedSubmit: 'Failed to submit review',
  },
  fr: {
    rateWorker: 'Évaluer',
    shareExperience: 'Partagez votre expérience avec',
    forJob: 'pour:',
    overallRating: 'Note globale',
    selectRating: 'Sélectionner une note',
    communication: 'Communication',
    punctuality: 'Ponctualité',
    qualityOfWork: 'Qualité du travail',
    yourReview: 'Votre avis',
    reviewPlaceholder: 'Partagez votre expérience avec ce travailleur...',
    submitting: 'Envoi en cours...',
    submitReview: 'Soumettre l\'avis',
    thankYou: 'Merci pour votre avis !',
    feedbackHelps: 'Vos commentaires aident',
    provideBetter: 'à fournir un meilleur service.',
    pleaseProvide: 'Veuillez fournir une note et un avis',
    pleaseLogin: 'Veuillez vous connecter pour soumettre un avis',
    failedSubmit: 'Échec de la soumission de l\'avis',
  },
  'ar-TN': {
    rateWorker: 'قيّم',
    shareExperience: 'شارك تجربتك مع',
    forJob: 'للعمل:',
    overallRating: 'التقييم العام',
    selectRating: 'اختر التقييم',
    communication: 'التواصل',
    punctuality: 'الالتزام بالمواعيد',
    qualityOfWork: 'جودة العمل',
    yourReview: 'تقييمك',
    reviewPlaceholder: 'شارك تجربتك مع هذا العامل...',
    submitting: 'جاري الإرسال...',
    submitReview: 'إرسال التقييم',
    thankYou: 'شكراً على تقييمك!',
    feedbackHelps: 'ملاحظاتك تساعد',
    provideBetter: 'على تقديم خدمة أفضل.',
    pleaseProvide: 'يرجى تقديم تقييم ومراجعة',
    pleaseLogin: 'يرجى تسجيل الدخول لإرسال تقييم',
    failedSubmit: 'فشل إرسال التقييم',
  },
};

const RatingComponent: React.FC<RatingComponentProps> = ({
  jobId,
  workerId,
  workerName,
  jobTitle,
  onReviewSubmitted,
  className = '',
  locale = 'en'
}) => {
  const t = translations[locale];
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [subRatings, setSubRatings] = useState({
    communication: 0,
    punctuality: 0,
    quality: 0
  });
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleSubRatingChange = (category: string, value: number) => {
    setSubRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0 || !review.trim()) {
      alert(t.pleaseProvide);
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (!token || !userData) {
        alert(t.pleaseLogin);
        return;
      }

      const user = JSON.parse(userData);
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId,
          workerId,
          customerId: user.id,
          rating,
          review: review.trim(),
          communication: subRatings.communication || null,
          punctuality: subRatings.punctuality || null,
          quality: subRatings.quality || null
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        onReviewSubmitted?.();
      } else {
        const error = await response.json();
        alert(error.error || t.failedSubmit);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(t.failedSubmit);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            {t.thankYou}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            {t.feedbackHelps} {workerName} {t.provideBetter}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t.rateWorker} {workerName}</CardTitle>
        <CardDescription>
          {t.shareExperience} {workerName} {t.forJob} {jobTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div>
            <Label className="text-base font-medium mb-3 block">{t.overallRating}</Label>
            <div className={`flex items-center gap-2`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-colors"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => handleRatingClick(star)}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-neutral-300 dark:text-neutral-600'
                    } transition-colors`}
                  />
                </button>
              ))}
              <span className={`text-lg font-medium text-neutral-700 dark:text-neutral-300 ms-2`}>
                {rating > 0 ? `${rating}.0` : t.selectRating}
              </span>
            </div>
          </div>

          {/* Sub-ratings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">{t.communication}</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 transition-colors"
                    onClick={() => handleSubRatingChange('communication', star)}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= subRatings.communication
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-neutral-300 dark:text-neutral-600'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">{t.punctuality}</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 transition-colors"
                    onClick={() => handleSubRatingChange('punctuality', star)}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= subRatings.punctuality
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-neutral-300 dark:text-neutral-600'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">{t.qualityOfWork}</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 transition-colors"
                    onClick={() => handleSubRatingChange('quality', star)}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= subRatings.quality
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-neutral-300 dark:text-neutral-600'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <Label htmlFor="review" className="text-base font-medium mb-2 block">
              {t.yourReview}
            </Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder={t.reviewPlaceholder}
              rows={4}
              className="resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0 || !review.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Clock className={`w-4 h-4 me-2 animate-spin`} />
                {t.submitting}
              </>
            ) : (
              <>
                <MessageSquare className={`w-4 h-4 me-2`} />
                {t.submitReview}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RatingComponent;
