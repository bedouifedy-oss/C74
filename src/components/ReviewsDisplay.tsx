'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, ThumbsUp, User, Calendar } from 'lucide-react';

interface ReviewsDisplayProps {
  workerId?: string;
  jobId?: string;
  customerId?: string;
  showWriteReview?: boolean;
  onWriteReview?: () => void;
  className?: string;
  locale?: 'en' | 'fr' | 'ar-TN';
}

const translations = {
  en: {
    reviewsSummary: 'Reviews Summary',
    review: 'review',
    reviews: 'reviews',
    writeReview: 'Write a Review',
    noReviews: 'No reviews yet',
    beFirst: 'Be the first to share your experience!',
    writeFirst: 'Write the First Review',
    communication: 'Communication',
    punctuality: 'Punctuality',
    quality: 'Quality',
    helpful: 'Helpful',
    loading: 'Loading reviews...',
  },
  fr: {
    reviewsSummary: 'R\u00e9sum\u00e9 des avis',
    review: 'avis',
    reviews: 'avis',
    writeReview: '\u00c9crire un avis',
    noReviews: 'Pas encore d\'avis',
    beFirst: 'Soyez le premier \u00e0 partager votre exp\u00e9rience !',
    writeFirst: '\u00c9crire le premier avis',
    communication: 'Communication',
    punctuality: 'Ponctualit\u00e9',
    quality: 'Qualit\u00e9',
    helpful: 'Utile',
    loading: 'Chargement des avis...',
  },
  'ar-TN': {
    reviewsSummary: '\u0645\u0644\u062e\u0635 \u0627\u0644\u062a\u0642\u064a\u064a\u0645\u0627\u062a',
    review: '\u062a\u0642\u064a\u064a\u0645',
    reviews: '\u062a\u0642\u064a\u064a\u0645\u0627\u062a',
    writeReview: '\u0627\u0643\u062a\u0628 \u062a\u0642\u064a\u064a\u0645',
    noReviews: '\u0644\u0627 \u062a\u0648\u062c\u062f \u062a\u0642\u064a\u064a\u0645\u0627\u062a \u0628\u0639\u062f',
    beFirst: '\u0643\u0646 \u0623\u0648\u0644 \u0645\u0646 \u064a\u0634\u0627\u0631\u0643 \u062a\u062c\u0631\u0628\u062a\u0647!',
    writeFirst: '\u0627\u0643\u062a\u0628 \u0623\u0648\u0644 \u062a\u0642\u064a\u064a\u0645',
    communication: '\u0627\u0644\u062a\u0648\u0627\u0635\u0644',
    punctuality: '\u0627\u0644\u0627\u0644\u062a\u0632\u0627\u0645 \u0628\u0627\u0644\u0645\u0648\u0627\u0639\u064a\u062f',
    quality: '\u0627\u0644\u062c\u0648\u062f\u0629',
    helpful: '\u0645\u0641\u064a\u062f',
    loading: '\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u062a\u0642\u064a\u064a\u0645\u0627\u062a...',
  },
};

interface Review {
  id: string;
  rating: number;
  review: string;
  communication?: number;
  punctuality?: number;
  quality?: number;
  createdAt: string;
  helpful: number;
  customerName: string;
  customerAvatar?: string;
}

const ReviewsDisplay: React.FC<ReviewsDisplayProps> = ({
  workerId,
  jobId,
  customerId,
  showWriteReview = false,
  onWriteReview,
  className = '',
  locale = 'en'
}) => {
  const t = translations[locale];
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setReviews([]);
          return;
        }

        const params = new URLSearchParams();
        if (workerId) params.append('workerId', workerId);
        if (jobId) params.append('jobId', jobId);
        if (customerId) params.append('customerId', customerId);

        const response = await fetch(`/api/reviews?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [workerId, jobId, customerId]);

  const handleHelpful = async (reviewId: string) => {
    // In a real implementation, this would call an API to mark review as helpful
    setHelpfulVotes(prev => ({ ...prev, [reviewId]: !prev[reviewId] }));
  };

  const renderStars = (rating: number, size: 'small' | 'medium' = 'small') => {
    const starSize = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-neutral-300 dark:text-neutral-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-neutral-500 dark:text-neutral-400">
            {t.loading}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Summary */}
      {reviews.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className={`flex items-center justify-between`}>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  {t.reviewsSummary}
                </h3>
                <div className={`flex items-center gap-4`}>
                  <div className={`flex items-center gap-2`}>
                    <span className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                      {calculateAverageRating()}
                    </span>
                    <div>{renderStars(Number(calculateAverageRating()))}</div>
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-400">
                    {reviews.length} {reviews.length === 1 ? t.review : t.reviews}
                  </div>
                </div>
              </div>
              {showWriteReview && onWriteReview && (
                <Button onClick={onWriteReview}>
                  {t.writeReview}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              {t.noReviews}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              {t.beFirst}
            </p>
            {showWriteReview && onWriteReview && (
              <Button onClick={onWriteReview}>
                {t.writeFirst}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className={`flex items-start justify-between mb-4`}>
                  <div className={`flex items-center gap-3`}>
                    <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {review.customerName}
                      </h4>
                      <div className={`flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400`}>
                        <Calendar className="w-4 h-4" />
                        {new Date(review.createdAt).toLocaleDateString(locale)}
                      </div>
                    </div>
                  </div>
                  <div className="text-end">
                    {renderStars(review.rating)}
                  </div>
                </div>

                {/* Sub-ratings */}
                {(review.communication || review.punctuality || review.quality) && (
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    {review.communication && (
                      <div className="text-center">
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{t.communication}</div>
                        <div className="flex justify-center">
                          {renderStars(review.communication, 'small')}
                        </div>
                      </div>
                    )}
                    {review.punctuality && (
                      <div className="text-center">
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{t.punctuality}</div>
                        <div className="flex justify-center">
                          {renderStars(review.punctuality, 'small')}
                        </div>
                      </div>
                    )}
                    {review.quality && (
                      <div className="text-center">
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{t.quality}</div>
                        <div className="flex justify-center">
                          {renderStars(review.quality, 'small')}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  {review.review}
                </p>

                <div className="flex items-center justify-start rtl:justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHelpful(review.id)}
                    className={`flex items-center gap-1 ${
                      helpfulVotes[review.id] ? 'text-primary-600' : 'text-neutral-500'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {t.helpful} ({review.helpful + (helpfulVotes[review.id] ? 1 : 0)})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsDisplay;
