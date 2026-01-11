// ============================================
// FILE: i18n.ts (root of project)
// ============================================
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Supported locales
export const locales = ['en', 'fr', 'ar-TN'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'ar-TN';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'Africa/Tunis',
    now: new Date(),
  };
});

// ============================================
// FILE: middleware.ts (root of project)
// ============================================
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // Always show locale in URL
  localeDetection: true, // Auto-detect from browser
});

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (Next.js internals)
  // - static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

// ============================================
// FILE: app/[locale]/layout.tsx
// ============================================
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  const messages = await getMessages();

  // Set dir and lang attributes for RTL support
  const dir = locale === 'ar-TN' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// ============================================
// FILE: lib/i18n-utils.ts
// Helper functions for i18n
// ============================================

import { Locale } from '@/i18n';

/**
 * Get language name in its native script
 */
export function getLanguageName(locale: Locale): string {
  const names: Record<Locale, string> = {
    en: 'English',
    fr: 'Français',
    'ar-TN': 'العربية',
  };
  return names[locale];
}

/**
 * Get text direction for locale
 */
export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar-TN' ? 'rtl' : 'ltr';
}

/**
 * Format date according to locale
 */
export function formatDate(
  date: Date,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
}

/**
 * Format time according to locale
 */
export function formatTime(
  date: Date,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
}

/**
 * Format currency (Tunisian Dinar)
 */
export function formatCurrency(
  amount: number,
  locale: Locale
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'TND',
  }).format(amount);
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string, locale: Locale): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Tunisia format: +216 XX XXX XXX
  if (cleaned.startsWith('216')) {
    const number = cleaned.slice(3);
    return `+216 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
  }
  
  return phone;
}

// ============================================
// FILE: components/LanguageSwitcher.tsx
// Language selector component
// ============================================
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import { getLanguageName } from '@/lib/i18n-utils';

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: Locale) => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    
    // Navigate to new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <div className="flex gap-2">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLanguageChange(loc)}
          className={`px-3 py-1 rounded ${
            locale === loc
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {getLanguageName(loc)}
        </button>
      ))}
    </div>
  );
}

// ============================================
// FILE: package.json additions
// ============================================
/*
Add these dependencies:

{
  "dependencies": {
    "next-intl": "^3.0.0"
  }
}

Install with:
npm install next-intl
*/

// ============================================
// FILE: tailwind.config.ts additions
// ============================================
/*
Add RTL support to your Tailwind config:

module.exports = {
  // ... existing config
  plugins: [
    require('tailwindcss-rtl'),
  ],
}

Install plugin:
npm install tailwindcss-rtl -D

Now you can use:
- rtl:mr-4 (margin-right in RTL)
- ltr:ml-4 (margin-left in LTR)
*/