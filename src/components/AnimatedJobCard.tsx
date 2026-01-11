'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Briefcase, Star, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedJobCardProps {
  job: {
    id: string;
    title: string;
    category: string;
    description: string;
    location: string;
    budget: number;
    status: string;
    postedAt: string;
    applicantCount: number;
  };
  onApply?: (job: any) => void;
  onMessage?: (job: any) => void;
  showApplyButton?: boolean;
  showMessageButton?: boolean;
  className?: string;
  locale?: 'en' | 'fr' | 'ar-TN';
}

const AnimatedJobCard: React.FC<AnimatedJobCardProps> = ({
  job,
  onApply,
  onMessage,
  showApplyButton = true,
  showMessageButton = false,
  className = '',
  locale = 'en'
}) => {
  
  const translations = {
    en: { applyNow: 'Apply Now', message: 'Message', applicants: 'applicants' },
    fr: { applyNow: 'Postuler', message: 'Message', applicants: 'candidats' },
    'ar-TN': { applyNow: 'تقدم الآن', message: 'رسالة', applicants: 'متقدمين' },
  };
  const t = translations[locale];
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-purple-100 text-purple-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'plumbing': return 'bg-blue-100 text-blue-700';
      case 'electrical': return 'bg-amber-100 text-amber-700';
      case 'ac': return 'bg-cyan-100 text-cyan-700';
      case 'cleaning': return 'bg-green-100 text-green-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card 
      className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer border border-neutral-200 dark:border-neutral-700',
        className
      )}
    >
      {/* Animated gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent rtl:from-transparent rtl:to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <CardContent className="p-6 relative">
        {/* Header */}
        <div className={`flex items-start justify-between mb-4`}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 transition-colors duration-200">
                {job.title}
              </h3>
              <Badge className={cn('text-xs', getCategoryColor(job.category))}>
                {job.category}
              </Badge>
            </div>
            
            <p className="text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors duration-200">
              {job.description}
            </p>
          </div>
          
          <div className="flex flex-col items-end rtl:items-start gap-2">
            <Badge className={cn('text-xs', getStatusColor(job.status))}>
              {job.status}
            </Badge>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-200">
              TND {job.budget}
            </p>
          </div>
        </div>

        {/* Meta Information */}
        <div className={`flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400 mb-4`}>
          <div className={`flex items-center gap-1 group-hover:text-primary-600 transition-colors duration-200`}>
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
          <div className={`flex items-center gap-1 group-hover:text-primary-600 transition-colors duration-200`}>
            <Calendar className="w-4 h-4" />
            <span>{formatTimeAgo(job.postedAt)}</span>
          </div>
          <div className={`flex items-center gap-1 group-hover:text-primary-600 transition-colors duration-200`}>
            <Briefcase className="w-4 h-4" />
            <span>{job.applicantCount} {t.applicants}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          {showApplyButton && (
            <Button
              onClick={() => onApply?.(job)}
              className="flex-1 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              {t.applyNow}
            </Button>
          )}
          
          {showMessageButton && (
            <Button
              variant="outline"
              onClick={() => onMessage?.(job)}
              className="flex-1 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <MessageCircle className="w-4 h-4 me-2" />
              {t.message}
            </Button>
          )}
        </div>

        {/* Hover effect indicator */}
        <div className="absolute top-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
};

export default AnimatedJobCard;
