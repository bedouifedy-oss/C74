import React from 'react';
import { Star, MapPin, CheckCircle, Shield, MessageCircle, Clock, TrendingUp, Wrench, Zap, Wind, Sparkles } from 'lucide-react';

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
  const isRTL = locale === 'ar-TN';
  
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-6
        ${isRTL ? 'text-right' : 'text-left'}
      `}
    >
      {/* Header with Photo */}
      <div className={`flex items-start gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <img 
          src={worker.photoUrl || '/placeholder-avatar.png'}
          alt={worker.name}
          className="w-16 h-16 rounded-full object-cover ring-2 ring-primary-100"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-neutral-900 mb-1">
            {worker.name}
          </h3>
          <div className={`flex items-center gap-2 text-neutral-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Icon className="size-4 text-primary-500" />
            <span className="text-sm">
              {categoryLabels[locale][worker.category]}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Rating */}
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
          <span className="text-sm font-medium text-neutral-700">
            {worker.rating.toFixed(1)} ({worker.reviewCount})
          </span>
        </div>

        {/* Completed Jobs */}
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CheckCircle className="size-4 text-success-500" />
          <span className="text-sm text-neutral-600">
            {worker.completedJobs} {locale === 'ar-TN' ? 'أعمال' : locale === 'fr' ? 'travaux' : 'jobs'}
          </span>
        </div>
      </div>

      {/* Location */}
      <div className={`flex items-center gap-2 text-sm text-neutral-600 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <MapPin className="size-4" />
        <span>{worker.city}</span>
      </div>

      {/* Guarantee Badge */}
      {worker.guaranteeEnabled && (
        <div className={`
          flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg mb-4
          ${isRTL ? 'flex-row-reverse' : ''}
        `}>
          <Shield className="size-4 text-green-600" />
          <span className="text-sm text-green-700 font-medium">
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
// 2. JOB CARD COMPONENT
// Shows job requests for workers/customers
// ============================================

interface JobCardProps {
  job: {
    id: string;
    category: 'plumbing' | 'electrical' | 'ac' | 'cleaning';
    description: string;
    address: string;
    status: 'requested' | 'accepted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    priceAgreed?: number;
    scheduledDate?: Date;
    createdAt: Date;
  };
  locale?: 'en' | 'fr' | 'ar-TN';
  userRole: 'customer' | 'worker';
  onClick?: () => void;
}

const statusColors = {
  requested: 'bg-amber-100 text-amber-700',
  accepted: 'bg-blue-100 text-blue-700',
  scheduled: 'bg-purple-100 text-purple-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-neutral-100 text-neutral-600',
};

const statusLabels = {
  en: {
    requested: 'Requested',
    accepted: 'Accepted',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  },
  fr: {
    requested: 'Demandée',
    accepted: 'Acceptée',
    scheduled: 'Programmée',
    in_progress: 'En cours',
    completed: 'Terminée',
    cancelled: 'Annulée',
  },
  'ar-TN': {
    requested: 'مطلوب',
    accepted: 'مقبول',
    scheduled: 'مجدول',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتمل',
    cancelled: 'ملغى',
  },
};

export function JobCard({ job, locale = 'en', userRole, onClick }: JobCardProps) {
  const Icon = categoryIcons[job.category];
  const isRTL = locale === 'ar-TN';
  
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow
        ${isRTL ? 'text-right' : 'text-left'}
      `}
    >
      {/* Header */}
      <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <Icon className="size-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">
              {categoryLabels[locale][job.category]}
            </h3>
            <p className="text-xs text-neutral-500">
              {job.createdAt.toLocaleDateString(locale)}
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[job.status]}`}>
          {statusLabels[locale][job.status]}
        </span>
      </div>

      {/* Description */}
      <p className="text-neutral-700 mb-3 line-clamp-2">
        {job.description}
      </p>

      {/* Location */}
      <div className={`flex items-center gap-2 text-sm text-neutral-600 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <MapPin className="size-4" />
        <span className="truncate">{job.address}</span>
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between pt-3 border-t border-neutral-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {job.priceAgreed ? (
          <div>
            <span className="text-xs text-neutral-500">
              {locale === 'ar-TN' ? 'السعر المتفق عليه' : locale === 'fr' ? 'Prix convenu' : 'Agreed Price'}
            </span>
            <p className="font-bold text-lg text-primary-600">
              {job.priceAgreed.toFixed(2)} {locale === 'ar-TN' ? 'د.ت' : 'TND'}
            </p>
          </div>
        ) : (
          <span className="text-sm text-neutral-500">
            {locale === 'ar-TN' ? 'السعر قيد المفاوضة' : locale === 'fr' ? 'Prix à négocier' : 'Price to be agreed'}
          </span>
        )}

        {job.scheduledDate && (
          <div className={`flex items-center gap-2 text-sm text-neutral-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Clock className="size-4" />
            <span>{job.scheduledDate.toLocaleDateString(locale)}</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button className="w-full mt-4 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-semibold transition-colors">
        {locale === 'ar-TN' ? 'عرض التفاصيل' : locale === 'fr' ? 'Voir les détails' : 'View Details'}
      </button>
    </div>
  );
}

// ============================================
// 3. MESSAGE BUBBLE COMPONENT
// WhatsApp-style chat for price negotiation
// ============================================

interface MessageBubbleProps {
  message: {
    id: string;
    senderId: string;
    text: string;
    type: 'text' | 'price_proposal';
    amount?: number;
    timestamp: Date;
    read: boolean;
  };
  isOwnMessage: boolean;
  locale?: 'en' | 'fr' | 'ar-TN';
}

export function MessageBubble({ message, isOwnMessage, locale = 'en' }: MessageBubbleProps) {
  const isRTL = locale === 'ar-TN';
  
  return (
    <div className={`flex mb-3 ${isOwnMessage ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')}`}>
      <div className={`
        max-w-[75%] rounded-2xl px-4 py-2
        ${isOwnMessage ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-900'}
        ${isRTL ? 'text-right' : 'text-left'}
      `}>
        {message.type === 'price_proposal' ? (
          <div>
            <p className="font-medium text-sm mb-1">
              {locale === 'ar-TN' ? 'عرض سعر' : locale === 'fr' ? 'Proposition de prix' : 'Price Proposal'}
            </p>
            <p className="text-2xl font-bold">
              {message.amount?.toFixed(2)} {locale === 'ar-TN' ? 'د.ت' : 'TND'}
            </p>
            {message.text && (
              <p className="text-sm mt-2 opacity-90">{message.text}</p>
            )}
          </div>
        ) : (
          <p>{message.text}</p>
        )}
        
        <div className={`flex items-center gap-1 mt-1 text-xs ${isOwnMessage ? 'text-primary-100' : 'text-neutral-500'}`}>
          <span>
            {message.timestamp.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOwnMessage && message.read && <span>✓✓</span>}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 4. RATING STARS COMPONENT
// Reusable rating display
// ============================================

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  locale?: 'en' | 'fr' | 'ar-TN';
}

export function RatingStars({ rating, count, size = 'md', showNumber = true, locale = 'en' }: RatingStarsProps) {
  const sizes = {
    sm: 'size-3',
    md: 'size-4',
    lg: 'size-5',
  };
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${sizes[size]} ${
              i < Math.floor(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-neutral-300'
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-neutral-700">
          {rating.toFixed(1)}
          {count && ` (${count})`}
        </span>
      )}
    </div>
  );
}

// ============================================
// 5. DEMO PAGE WITH ALL COMPONENTS
// ============================================

export default function ComponentShowcase() {
  const [locale, setLocale] = React.useState<'en' | 'fr' | 'ar-TN'>('en');
  
  // Sample data
  const sampleWorker = {
    id: '1',
    name: locale === 'ar-TN' ? 'أحمد بن علي' : 'Ahmed Ben Ali',
    category: 'plumbing' as const,
    rating: 4.8,
    reviewCount: 23,
    completedJobs: 45,
    guaranteeEnabled: true,
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    city: locale === 'ar-TN' ? 'المروج' : 'Mourouj',
  };

  const sampleJob = {
    id: '1',
    category: 'electrical' as const,
    description: locale === 'ar-TN' 
      ? 'مشكلة في الإضاءة في غرفة المعيشة'
      : locale === 'fr'
      ? 'Problème d\'éclairage dans le salon'
      : 'Living room lighting issue',
    address: locale === 'ar-TN' ? 'المروج 5، تونس' : 'Mourouj 5, Tunis',
    status: 'accepted' as const,
    priceAgreed: 45.00,
    scheduledDate: new Date(2025, 0, 20),
    createdAt: new Date(2025, 0, 15),
  };

  const sampleMessages = [
    {
      id: '1',
      senderId: 'worker',
      text: locale === 'ar-TN' ? 'مرحبا، يمكنني المساعدة' : locale === 'fr' ? 'Bonjour, je peux aider' : 'Hello, I can help',
      type: 'text' as const,
      timestamp: new Date(),
      read: true,
    },
    {
      id: '2',
      senderId: 'customer',
      text: locale === 'ar-TN' ? 'ما هو السعر؟' : locale === 'fr' ? 'Quel est le prix?' : 'What\'s the price?',
      type: 'text' as const,
      timestamp: new Date(),
      read: true,
    },
    {
      id: '3',
      senderId: 'worker',
      text: locale === 'ar-TN' ? 'عرض السعر' : locale === 'fr' ? 'Proposition' : 'My proposal',
      type: 'price_proposal' as const,
      amount: 45.00,
      timestamp: new Date(),
      read: false,
    },
  ];

  return (
    <div className={`min-h-screen bg-neutral-50 p-4 ${locale === 'ar-TN' ? 'text-right' : 'text-left'}`} dir={locale === 'ar-TN' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className={`flex items-center justify-between mb-6 ${locale === 'ar-TN' ? 'flex-row-reverse' : ''}`}>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">C74 Components</h1>
            <p className="text-neutral-600">
              {locale === 'ar-TN' ? 'معاينة المكونات' : locale === 'fr' ? 'Aperçu des composants' : 'Component Preview'}
            </p>
          </div>
          
          {/* Language Switcher */}
          <div className="flex gap-2">
            {(['en', 'fr', 'ar-TN'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLocale(lang)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  locale === lang
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'fr' ? 'FR' : 'AR'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Components Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Worker Card */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Worker Card</h2>
          <WorkerCard worker={sampleWorker} locale={locale} />
        </div>

        {/* Job Card */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Job Card</h2>
          <JobCard job={sampleJob} locale={locale} userRole="customer" />
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Chat Messages</h2>
          <div className="bg-white rounded-lg shadow p-6">
            {sampleMessages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwnMessage={idx % 2 === 1}
                locale={locale}
              />
            ))}
          </div>
        </div>

        {/* Rating Component */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Rating Stars</h2>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <p className="text-sm text-neutral-600 mb-2">Small</p>
              <RatingStars rating={4.5} count={12} size="sm" locale={locale} />
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-2">Medium (Default)</p>
              <RatingStars rating={4.8} count={23} size="md" locale={locale} />
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-2">Large</p>
              <RatingStars rating={5.0} count={50} size="lg" locale={locale} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}