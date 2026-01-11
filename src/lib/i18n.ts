import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { defaultLocale, locales } from '@/i18n-routing';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation(routing);
