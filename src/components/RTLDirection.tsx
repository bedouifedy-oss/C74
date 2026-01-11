'use client';
import { useLocale as useC74Locale } from '@/hooks/useLocale';
import { useEffect } from 'react';

export function RTLDirection({ children }: { children: React.ReactNode }) {
  const { locale } = useC74Locale();
  
  useEffect(() => {
    document.documentElement.dir = locale === 'ar-TN' ? 'rtl' : 'ltr';
  }, [locale]);

  return <>{children}</>;
}
