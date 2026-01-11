'use client';

import { useLocale as useC74Locale } from '@/hooks/useLocale';
import { HeaderMenu, getWorkerMenuItems } from '@/components/HeaderMenu';
import AvailabilityCalendar from '@/components/worker/AvailabilityCalendar';

const pageTranslations = {
  en: {
    title: 'My Availability',
    subtitle: 'Manage when you can accept jobs',
  },
  fr: {
    title: 'Ma Disponibilité',
    subtitle: 'Gérez vos heures de travail',
  },
  'ar-TN': {
    title: 'توفري',
    subtitle: 'حدد وقتاش تنجم تخدم',
  },
};

export default function WorkerAvailabilityPage() {
  const { locale, setLocale, isClient } = useC74Locale();
  const t = pageTranslations[locale];

  return (
    <div
      className="min-h-screen bg-neutral-50 dark:bg-neutral-900"
    >
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getWorkerMenuItems(locale, 'availability')}
        title={t.title}
        subtitle={t.subtitle}
      />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {isClient && (
          <AvailabilityCalendar locale={locale} />
        )}
      </div>
    </div>
  );
}
