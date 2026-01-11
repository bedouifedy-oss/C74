'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LoadingSpinner } from '@/components/ui/loading';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  withLoading: <T>(fn: () => Promise<T>, minTime?: number) => Promise<T>;
  loadingText: string;
  setLoadingText: (text: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const withLoading = async <T,>(fn: () => Promise<T>, minTime: number = 500): Promise<T> => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const result = await fn();
      
      // Ensure minimum loading time for better UX
      const elapsed = Date.now() - startTime;
      if (elapsed < minTime) {
        await new Promise<void>(resolve => setTimeout(resolve, minTime - elapsed));
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadingContext.Provider value={{
      isLoading,
      setLoading,
      withLoading,
      loadingText,
      setLoadingText
    }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-xl">
            <LoadingSpinner size="lg" text={loadingText} />
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
