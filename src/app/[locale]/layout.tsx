import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ThemeProvider } from '@/components/theme-provider';
import { Inter } from 'next/font/google';
import { RTLDirection } from '@/components/RTLDirection';
import { AppDirectionProvider } from '@/components/DirectionProvider';
import type { ReactNode } from 'react';
import { locales } from '@/i18n-routing';

const inter = Inter({ subsets: ['latin'] });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as (typeof locales)[number];
  
  if (!locales.includes(locale)) notFound();
  
  setRequestLocale(locale);
  const messages = await getMessages();
  
  const direction = locale === 'ar-TN' ? 'rtl' : 'ltr';

  return (
    <ThemeProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <AppDirectionProvider direction={direction}>
          <RTLDirection>
            <div className={`min-h-screen ${inter.className}`}>
              {children}
            </div>
          </RTLDirection>
        </AppDirectionProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
