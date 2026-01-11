'use client';

import { useEffect } from 'react';
import { useLocale } from '@/hooks/useLocale';

export default function CustomerBrowseWorkersPage() {
  const { locale, isClient } = useLocale();

  useEffect(() => {
    if (!isClient) return;
    window.location.href = `/${locale}/customer/browse-workers`;
  }, [isClient, locale]);

  return null;
}
