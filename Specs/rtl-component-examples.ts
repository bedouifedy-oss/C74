// ============================================
// RTL-Aware Component Examples for Fixy.tn
// ============================================

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { getTextDirection } from '@/lib/i18n-utils';
import { type Locale } from '@/i18n';

// ============================================
// Example 1: Job Card (handles RTL layouts)
// ============================================

interface Job {
  id: string;
  category: string;
  description: string;
  status: string;
  price?: number;
  date: Date;
}

export function JobCard({ job }: { job: Job }) {
  const t = useTranslations('jobs');
  const locale = useLocale() as Locale;
  const isRTL = getTextDirection(locale) === 'rtl';

  return (
    <div className="border rounded-lg p-4 bg-white">
      {/* Header with icon - auto-flips in RTL */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Icon appears on left in LTR, right in RTL */}
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            🔧
          </div>
          <div>
            <h3 className="font-semibold">{t(`services.${job.category}`)}</h3>
            <p className="text-sm text-gray-500">
              {job.date.toLocaleDateString(locale)}
            </p>
          </div>
        </div>
        
        {/* Status badge */}
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {t(`status.${job.status}`)}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-3 line-clamp-2">
        {job.description}
      </p>

      {/* Price - uses RTL-aware spacing */}
      {job.price && (
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-gray-600">{t('price.agreed')}</span>
          <span className="font-bold text-lg">
            {new Intl.NumberFormat(locale, {
              style: 'currency',
              currency: 'TND',
            }).format(job.price)}
          </span>
        </div>
      )}

      {/* Action buttons - margin adjusts for RTL */}
      <div className="flex gap-2 mt-4">
        <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          {t('actions.viewDetails')}
        </button>
      </div>
    </div>
  );
}

// ============================================
// Example 2: Form Input (RTL text alignment)
// ============================================

interface InputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function FormInput({
  label,
  placeholder,
  value,
  onChange,
  error,
  required,
}: InputProps) {
  const locale = useLocale() as Locale;
  const isRTL = getTextDirection(locale) === 'rtl';
  const t = useTranslations('common');

  return (
    <div className="mb-4">
      {/* Label with RTL support */}
      <label className="block mb-2 font-medium">
        {label}
        {required && (
          <span className={`text-red-500 ${isRTL ? 'mr-1' : 'ml-1'}`}>*</span>
        )}
      </label>

      {/* Input with proper text direction */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={isRTL ? 'rtl' : 'ltr'}
        className={`
          w-full px-4 py-2 border rounded-lg
          ${isRTL ? 'text-right' : 'text-left'}
          ${error ? 'border-red-500' : 'border-gray-300'}
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
        `}
      />

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

// ============================================
// Example 3: Navigation Bar (flips direction)
// ============================================

export function NavigationBar() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const isRTL = getTextDirection(locale) === 'rtl';

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - position flips in RTL */}
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-2xl font-bold text-blue-600">
              {t('common.appName')}
            </span>
          </div>

          {/* Navigation Links - order reverses in RTL */}
          <div className={`flex items-center gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <a href="/jobs" className="text-gray-700 hover:text-blue-600">
              {t('jobs.title')}
            </a>
            <a href="/workers" className="text-gray-700 hover:text-blue-600">
              {t('workers.title')}
            </a>
            <a href="/settings" className="text-gray-700 hover:text-blue-600">
              {t('settings.title')}
            </a>
          </div>

          {/* User menu - icon position flips */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 bg-gray-300 rounded-full" />
              <span className="hidden md:block">👤</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ============================================
// Example 4: Price Negotiation Chat (RTL bubbles)
// ============================================

interface Message {
  id: string;
  senderId: string;
  text: string;
  type: 'text' | 'price_proposal';
  amount?: number;
  timestamp: Date;
}

interface ChatBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export function ChatBubble({ message, isOwnMessage }: ChatBubbleProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations('jobs.price');
  const isRTL = getTextDirection(locale) === 'rtl';

  return (
    <div
      className={`flex mb-3 ${
        isOwnMessage
          ? isRTL ? 'justify-start' : 'justify-end'
          : isRTL ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`
          max-w-[70%] rounded-2xl px-4 py-2
          ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-900'
          }
          ${isRTL ? 'text-right' : 'text-left'}
        `}
      >
        {message.type === 'price_proposal' ? (
          <div>
            <p className="font-medium mb-1">{t('proposePrice')}</p>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: 'TND',
              }).format(message.amount!)}
            </p>
            {message.text && (
              <p className="text-sm mt-2 opacity-90">{message.text}</p>
            )}
          </div>
        ) : (
          <p>{message.text}</p>
        )}

        <p
          className={`text-xs mt-1 ${
            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {message.timestamp.toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

// ============================================
// Example 5: Worker Profile Card
// ============================================

interface Worker {
  id: string;
  name: string;
  category: string;
  rating: number;
  completedJobs: number;
  guaranteeEnabled: boolean;
  photoUrl: string;
}

export function WorkerProfileCard({ worker }: { worker: Worker }) {
  const t = useTranslations('workers');
  const locale = useLocale() as Locale;
  const isRTL = getTextDirection(locale) === 'rtl';

  return (
    <div className="bg-white border rounded-lg p-6">
      {/* Header with photo - layout flips in RTL */}
      <div className={`flex items-start gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <img
          src={worker.photoUrl}
          alt={worker.name}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h3 className="text-xl font-bold mb-1">{worker.name}</h3>
          <p className="text-gray-600">{t(`services.${worker.category}`)}</p>
        </div>
      </div>

      {/* Stats - icons adjust for RTL */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-2xl">⭐</span>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="font-bold text-lg">{worker.rating.toFixed(1)}</p>
            <p className="text-sm text-gray-500">{t('rating')}</p>
          </div>
        </div>

        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-2xl">✅</span>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="font-bold text-lg">{worker.completedJobs}</p>
            <p className="text-sm text-gray-500">{t('completedJobs')}</p>
          </div>
        </div>
      </div>

      {/* Guarantee badge - position adjusts */}
      {worker.guaranteeEnabled && (
        <div className={`
          flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg mb-4
          ${isRTL ? 'flex-row-reverse' : ''}
        `}>
          <span className="text-green-600">🛡️</span>
          <span className="text-sm text-green-700 font-medium">
            {t('guaranteeOffered')}
          </span>
        </div>
      )}

      {/* Action button */}
      <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium">
        {t('contactWorker')}
      </button>
    </div>
  );
}

// ============================================
// Example 6: Date/Time Selector (localized)
// ============================================

export function DateTimePicker() {
  const t = useTranslations('jobs');
  const tTime = useTranslations('timeSlots');
  const locale = useLocale() as Locale;
  const isRTL = getTextDirection(locale) === 'rtl';

  const timeSlots = ['morning', 'afternoon', 'evening'] as const;

  return (
    <div className="space-y-4">
      {/* Date input */}
      <div>
        <label className="block mb-2 font-medium">
          {t('selectDate')}
        </label>
        <input
          type="date"
          className={`
            w-full px-4 py-2 border rounded-lg
            ${isRTL ? 'text-right' : 'text-left'}
          `}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Time slot buttons */}
      <div>
        <label className="block mb-2 font-medium">
          {t('selectTime')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {timeSlots.map((slot) => (
            <button
              key={slot}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500"
            >
              <span className="block text-sm font-medium">
                {tTime(slot)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Example 7: Notification Badge (RTL positioning)
// ============================================

export function NotificationBadge({ count }: { count: number }) {
  const locale = useLocale() as Locale;
  const isRTL = getTextDirection(locale) === 'rtl';

  if (count === 0) return null;

  return (
    <div className="relative inline-block">
      <button className="p-2 rounded-full hover:bg-gray-100">
        🔔
      </button>
      
      {/* Badge position adjusts for RTL */}
      <span
        className={`
          absolute top-0 w-5 h-5 bg-red-500 text-white text-xs
          flex items-center justify-center rounded-full
          ${isRTL ? 'left-0' : 'right-0'}
        `}
      >
        {count > 9 ? '9+' : count}
      </span>
    </div>
  );
}

// ============================================
// Example 8: Status Timeline (RTL direction)
// ============================================

interface TimelineStep {
  status: string;
  label: string;
  completed: boolean;
  active: boolean;
}

export function StatusTimeline({ steps }: { steps: TimelineStep[] }) {
  const locale = useLocale() as Locale;
  const isRTL = getTextDirection(locale) === 'rtl';

  return (
    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
      {steps.map((step, index) => (
        <div key={step.status} className="flex items-center flex-1">
          {/* Circle */}
          <div className="flex flex-col items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${
                  step.completed
                    ? 'bg-green-500 text-white'
                    : step.active
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }
              `}
            >
              {step.completed ? '✓' : index + 1}
            </div>
            <span className="text-xs mt-1 text-center">{step.label}</span>
          </div>

          {/* Line between steps */}
          {index < steps.length - 1 && (
            <div
              className={`
                flex-1 h-1 mx-2
                ${step.completed ? 'bg-green-500' : 'bg-gray-300'}
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
}