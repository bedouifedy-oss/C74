'use client';

import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading';
import { useLocale } from '@/hooks/useLocale';

interface GlobalPageLoaderProps {
  children: React.ReactNode;
  minLoadingTime?: number;
  showSpinner?: boolean;
}

export function GlobalPageLoader({ 
  children, 
  minLoadingTime = 1000,
  showSpinner = true 
}: GlobalPageLoaderProps) {
  const { locale } = useLocale();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minLoadingTime);

    return () => clearTimeout(timer);
  }, [minLoadingTime]);

  const loadingText = locale === 'ar-TN' 
    ? 'جاري التحميل...' 
    : locale === 'fr' 
      ? 'Chargement...' 
      : 'Loading...';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        {showSpinner && <LoadingSpinner size="xl" text={loadingText} />}
      </div>
    );
  }

  return <>{children}</>;
}

// HOC for easy wrapping
export function withGlobalLoading<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<GlobalPageLoaderProps, 'children'> = {}
) {
  return function WithLoadingComponent(props: P) {
    return (
      <GlobalPageLoader {...options}>
        <Component {...props} />
      </GlobalPageLoader>
    );
  };
}
