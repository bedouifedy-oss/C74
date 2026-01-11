'use client';

import { useLocale } from '@/hooks/useLocale';
import { HeaderMenu, getPublicMenuItems } from '@/components/HeaderMenu';

export default function ShowcasePage() {
  const { locale, setLocale } = useLocale();
  
  const t = {
    en: { title: 'Component Showcase', subtitle: 'Browse C74 UI components' },
    fr: { title: 'Vitrine des composants', subtitle: 'Parcourir les composants C74' },
    'ar-TN': { title: 'عرض المكونات', subtitle: 'تصفح مكونات C74' },
  }[locale];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getPublicMenuItems(locale, 'showcase')}
        title={t.title}
        subtitle={t.subtitle}
      />
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-neutral-600 dark:text-neutral-400">
          {locale === 'ar-TN' ? 'صفحة العرض قيد الإنشاء' : locale === 'fr' ? 'Page en construction' : 'Showcase page coming soon'}
        </p>
      </div>
    </div>
  );
}
