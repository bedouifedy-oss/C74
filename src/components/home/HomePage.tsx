'use client';

import Image from 'next/image';
import {Button} from '@/components/ui/button';
import {Link} from '@/lib/i18n';
import {useLocale as useC74Locale} from '@/hooks/useLocale';
import {useTranslations} from 'next-intl';
import {HeaderMenu, getPublicMenuItems} from '@/components/HeaderMenu';

export default function HomePage() {
  const {locale, setLocale} = useC74Locale();
  const t = useTranslations('home');

  return (
    <div
      className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200"
    >
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getPublicMenuItems(locale, 'home')}
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.svg"
              alt="C74 Logo"
              width={96}
              height={96}
              className="h-24 w-auto transition-colors duration-200"
              priority
            />
          </div>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto transition-colors duration-200">
            {t('description')}
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4 justify-center">
              <Link href="/signup?role=customer">
                <Button size="lg">{t('signUpCustomer')}</Button>
              </Link>
              <Link href="/signup?role=worker">
                <Button size="lg" variant="outline">
                  {t('signUpWorker')}
                </Button>
              </Link>
            </div>
            <Link href="/login">
              <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                {t('alreadyHaveAccount') || 'Already have an account? Login'}
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 transition-colors duration-200">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 transition-colors duration-200">
              {t('verifiedProfessionals')}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 transition-colors duration-200">
              {t('verifiedDesc')}
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 transition-colors duration-200">
            <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-secondary-600 dark:text-secondary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 transition-colors duration-200">
              {t('quickService')}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 transition-colors duration-200">
              {t('quickDesc')}
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 transition-colors duration-200">
            <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-accent-600 dark:text-accent-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 transition-colors duration-200">
              {t('guarantee')}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 transition-colors duration-200">
              {t('guaranteeDesc')}
            </p>
          </div>
        </div>

        <div className="text-center bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-12 transition-colors duration-200">
          <h2 className="text-3xl font-bold mb-4 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
            {t('readyToStart')}
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 transition-colors duration-200">
            {t('readyDesc')}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button>{t('signUpNow')}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
