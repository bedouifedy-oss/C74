'use client';

import { useEffect } from 'react';
import { useRouter } from '@/lib/i18n';
import { useLocale as useC74Locale } from '@/hooks/useLocale';

// This page is deprecated - redirect to /admin/fees
// Workers pay fees TO the platform (not payouts FROM platform)
export default function AdminPayoutsPage() {
  const router = useRouter();
  const { locale } = useC74Locale();

  useEffect(() => {
    router.replace(`/${locale}/admin/fees`);
  }, [router, locale]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-neutral-500">Redirecting to Fee Collection...</p>
    </div>
  );
}
