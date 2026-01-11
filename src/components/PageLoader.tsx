'use client';

import React, { useEffect, useState } from 'react';
import { LoadingSpinner, LoadingCard, LoadingSkeleton } from '@/components/ui/loading';
import { useLocale } from '@/hooks/useLocale';

interface PageLoaderProps {
  children: React.ReactNode;
  loadingText?: string;
  minLoadingTime?: number;
  showSkeleton?: boolean;
  skeletonType?: 'dashboard' | 'list' | 'form' | 'simple';
}

const loadingTexts = {
  en: {
    dashboard: 'Loading dashboard...',
    list: 'Loading data...',
    form: 'Loading form...',
    simple: 'Loading...'
  },
  fr: {
    dashboard: 'Chargement du tableau de bord...',
    list: 'Chargement des données...',
    form: 'Chargement du formulaire...',
    simple: 'Chargement...'
  },
  'ar-TN': {
    dashboard: 'جاري تحميل لوحة التحكم...',
    list: 'جاري تحميل البيانات...',
    form: 'جاري تحميل النموذج...',
    simple: 'جاري التحميل...'
  }
};

export function PageLoader({ 
  children, 
  loadingText, 
  minLoadingTime = 800,
  showSkeleton = true,
  skeletonType = 'simple'
}: PageLoaderProps) {
  const { locale } = useLocale();
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowContent(true);
    }, minLoadingTime);

    return () => clearTimeout(timer);
  }, [minLoadingTime]);

  const defaultText = loadingTexts[locale as keyof typeof loadingTexts]?.[skeletonType] || 'Loading...';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center space-y-8">
          <LoadingSpinner size="xl" text={loadingText || defaultText} />
          
          {showSkeleton && (
            <div className="max-w-7xl mx-auto px-4">
              {skeletonType === 'dashboard' && (
                <div className="space-y-8">
                  {/* Dashboard skeleton */}
                  <div className="space-y-4">
                    <LoadingSkeleton lines={1} className="h-8 w-48" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <LoadingCard key={i} className="p-4" />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <LoadingSkeleton lines={2} className="w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <LoadingCard key={i} className="p-6">
                          <div className="space-y-3">
                            <LoadingSkeleton lines={2} />
                            <LoadingSkeleton lines={1} className="w-3/4" />
                          </div>
                        </LoadingCard>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {skeletonType === 'list' && (
                <div className="space-y-4">
                  <LoadingSkeleton lines={1} className="h-6 w-32" />
                  {[1, 2, 3, 4, 5].map((i) => (
                    <LoadingCard key={i} className="p-4">
                      <div className="space-y-2">
                        <LoadingSkeleton lines={1} className="w-3/4" />
                        <LoadingSkeleton lines={1} className="w-1/2" />
                      </div>
                    </LoadingCard>
                  ))}
                </div>
              )}
              
              {skeletonType === 'form' && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <LoadingSkeleton lines={1} className="h-8 w-48" />
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="space-y-2">
                        <LoadingSkeleton lines={1} className="h-4 w-24" />
                        <LoadingSkeleton lines={1} className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {skeletonType === 'simple' && (
                <div className="space-y-4">
                  <LoadingSkeleton lines={3} />
                  <LoadingSkeleton lines={2} className="w-3/4" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// HOC for easy wrapping
export function withPageLoader<T extends object>(
  Component: React.ComponentType<T>,
  options: Omit<PageLoaderProps, 'children'> = {}
) {
  return function WrappedComponent(props: T) {
    return (
      <PageLoader {...options}>
        <Component {...props} />
      </PageLoader>
    );
  };
}
