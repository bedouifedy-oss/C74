import { useEffect, useState } from 'react';
import { useLocale as useNextIntlLocale } from 'next-intl';
import { usePathname, useRouter } from '@/lib/i18n';
import type { Locale } from '@/i18n-routing';

export function useLocale() {
  const locale = useNextIntlLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return { locale, setLocale, isClient };
}
