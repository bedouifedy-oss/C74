'use client';

import { useEffect, useState } from 'react';
import { useLocale as useC74Locale } from '@/hooks/useLocale';
import { HeaderMenu, getCustomerMenuItems } from '@/components/HeaderMenu';
import Inbox from '@/components/messaging/Inbox';

const pageTranslations = {
  en: {
    title: 'Messages',
    subtitle: 'Chat with workers about your jobs',
  },
  fr: {
    title: 'Messages',
    subtitle: 'Discutez avec les travailleurs',
  },
  'ar-TN': {
    title: 'الرسائل',
    subtitle: 'تحدث مع العمال بخصوص طلباتك',
  },
};

export default function CustomerInboxPage() {
  const { locale, setLocale, isClient } = useC74Locale();
  const t = pageTranslations[locale];
  
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    if (!isClient) return;
    
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserId(user.id || '');
      } catch {
        // Use default
      }
    }
  }, [isClient]);

  return (
    <div
      className="min-h-screen bg-neutral-50 dark:bg-neutral-900"
    >
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getCustomerMenuItems(locale, 'inbox')}
        title={t.title}
        subtitle={t.subtitle}
      />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {isClient && (
          <Inbox
            locale={locale}
            userId={userId}
            userRole="customer"
          />
        )}
      </div>
    </div>
  );
}
