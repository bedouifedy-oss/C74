import React from 'react';
import Image from 'next/image';
import { Star, MapPin, CheckCircle, Shield, Wrench, Zap, Wind, Sparkles, MessageCircle, Clock } from 'lucide-react';

// ============================================
// 1. WORKER CARD COMPONENT
// The most important component for your marketplace
// ============================================

interface WorkerCardProps {
  worker: {
    id: string;
    name: string;
    category: 'plumbing' | 'electrical' | 'ac' | 'cleaning';
    rating: number;
    reviewCount: number;
    completedJobs: number;
    guaranteeEnabled: boolean;
    photoUrl: string;
    city: string;
  };
  locale?: 'en' | 'fr' | 'ar-TN';
  onClick?: () => void;
}

const categoryIcons = {
  plumbing: Wrench,
  electrical: Zap,
  ac: Wind,
  cleaning: Sparkles,
};

const categoryLabels = {
  en: {
    plumbing: 'Plumbing',
    electrical: 'Electrical',
    ac: 'AC Maintenance',
    cleaning: 'Cleaning',
  },
  fr: {
    plumbing: 'Plomberie',
    electrical: 'Électricité',
    ac: 'Climatisation',
    cleaning: 'Nettoyage',
  },
  'ar-TN': {
    plumbing: 'سباكة',
    electrical: 'كهرباء',
    ac: 'تكييف',
    cleaning: 'تنظيف',
  },
};

export function WorkerCard({ worker, locale = 'en', onClick }: WorkerCardProps) {
  const Icon = categoryIcons[worker.category];
  const labels = categoryLabels[locale];
  
  
  // Generate initials from worker name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };
  
  const initials = getInitials(worker.name);
  
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-200"
    >
      {/* Header with Photo */}
      <div className="flex items-start gap-4 mb-4">
        {worker.photoUrl ? (
          <Image 
            src={worker.photoUrl}
            alt={worker.name}
            width={64}
            height={64}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-primary-100"
            unoptimized
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary-100 ring-2 ring-primary-200 flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-lg">
              {initials}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 mb-1 transition-colors duration-200">
            {worker.name}
          </h3>
          <div className={`flex items-center gap-2 text-neutral-600 dark:text-neutral-400`}>
            <Icon className="size-4 text-primary-500" />
            <span className="text-sm">
              {labels[worker.category]}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Rating */}
        <div className={`flex items-center gap-2`}>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`size-4 ${
                  i < Math.floor(worker.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-neutral-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {worker.rating.toFixed(1)} ({worker.reviewCount})
          </span>
        </div>

        {/* Completed Jobs */}
        <div className={`flex items-center gap-2`}>
          <CheckCircle className="size-4 text-green-500" />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {worker.completedJobs} {locale === 'ar-TN' ? 'أعمال' : locale === 'fr' ? 'travaux' : 'jobs'}
          </span>
        </div>
      </div>

      {/* Location */}
      <div className={`flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-3`}>
        <MapPin className="size-4" />
        <span>{worker.city}</span>
      </div>

      {/* Guarantee Badge */}
      {worker.guaranteeEnabled && (
        <div className={`
          flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4
                 `}>
          <Shield className="size-4 text-green-600" />
          <span className="text-sm text-green-700 dark:text-green-300 font-medium">
            {locale === 'ar-TN' ? 'ضمان 7 أيام' : locale === 'fr' ? 'Garantie 7 jours' : '7-Day Guarantee'}
          </span>
        </div>
      )}

      {/* Contact Button */}
      <button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
        <MessageCircle className="size-5" />
        <span>{locale === 'ar-TN' ? 'اتصل' : locale === 'fr' ? 'Contacter' : 'Contact'}</span>
      </button>
    </div>
  );
}

// ============================================
// 1. WORKER CARD COMPONENT
// For displaying worker profiles with RTL support
// ============================================

interface JobCardProps {
  job: {
    id: string;
    title: string;
    category: 'plumbing' | 'electrical' | 'ac' | 'cleaning';
    description: string;
    budget: number;
    location: string;
    postedAt: string;
    status: 'open' | 'in_progress' | 'completed';
    applicantCount: number;
  };
  locale?: 'en' | 'fr' | 'ar-TN';
  onClick?: () => void;
}

const statusLabels = {
  en: {
    open: 'Open',
    in_progress: 'In Progress',
    completed: 'Completed',
  },
  fr: {
    open: 'Ouvert',
    in_progress: 'En cours',
    completed: 'Terminé',
  },
  'ar-TN': {
    open: 'مفتوح',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتمل',
  },
};

const statusColors = {
  open: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
};

export function JobCard({ job, locale = 'en', onClick }: JobCardProps) {
  const Icon = categoryIcons[job.category];
  const labels = categoryLabels[locale];
  const statusLabel = statusLabels[locale][job.status];
  
  
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-3`}>
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <Icon className="size-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              {labels[job.category]}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {new Date(job.postedAt).toLocaleDateString(locale)}
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[job.status]}`}>
          {statusLabel}
        </span>
      </div>

      {/* Description */}
      <p className="text-neutral-700 dark:text-neutral-300 mb-3 line-clamp-2">
        {job.description}
      </p>

      {/* Location */}
      <div className={`flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-4`}>
        <MapPin className="size-4" />
        <span className="truncate">{job.location}</span>
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-600`}>
        <div>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {locale === 'ar-TN' ? 'الميزانية' : locale === 'fr' ? 'Budget' : 'Budget'}
          </span>
          <p className="font-bold text-lg text-primary-600 dark:text-primary-400">
            TND {job.budget}
          </p>
        </div>

        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          {job.applicantCount} {locale === 'ar-TN' ? 'متقدمون' : locale === 'fr' ? 'candidats' : 'applicants'}
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full mt-4 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-semibold transition-colors">
        {locale === 'ar-TN' ? 'عرض التفاصيل' : locale === 'fr' ? 'Voir les détails' : 'View Details'}
      </button>
    </div>
  );
}
