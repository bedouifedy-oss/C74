'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLoading } from '@/contexts/LoadingContext';

interface UseDataFetcherOptions<T> {
  initialData?: T;
  minLoadingTime?: number;
  loadingText?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseDataFetcherResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setData: (data: T) => void;
}

export function useDataFetcher<T>(
  fetchFn: () => Promise<T>,
  options: UseDataFetcherOptions<T> = {}
): UseDataFetcherResult<T> {
  const {
    initialData = null,
    minLoadingTime = 800,
    loadingText,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const { setLoading, setLoadingText, withLoading } = useLoading();

  const fetchData = useCallback(async () => {
    try {
      if (loadingText) {
        setLoadingText(loadingText);
      }
      
      const result = await withLoading(fetchFn, minLoadingTime);
      setData(result);
      setError(null);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      onError?.(error);
    }
  }, [fetchFn, minLoadingTime, loadingText, setLoading, setLoadingText, withLoading, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading: false, // Loading is handled by the global context
    error,
    refetch: fetchData,
    setData
  };
}

// For multiple data fetching
export function useMultiDataFetcher<T extends Record<string, any>>(
  fetchFunctions: { [K in keyof T]: () => Promise<T[K]> },
  options: UseDataFetcherOptions<T> = {}
) {
  const [data, setData] = useState<Partial<T>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof T, Error>>>({});
  const { setLoading, setLoadingText, withLoading } = useLoading();

  const fetchAll = useCallback(async () => {
    const { minLoadingTime = 800, loadingText } = options;
    
    try {
      if (loadingText) {
        setLoadingText(loadingText);
      }
      
      const results = await withLoading(async () => {
        const promises = Object.entries(fetchFunctions).map(async ([key, fn]) => {
          const result = await fn();
          return [key, result] as const;
        });
        
        const resolved = await Promise.all(promises);
        return Object.fromEntries(resolved) as T;
      }, minLoadingTime);
      
      setData(results);
      setErrors({});
      options.onSuccess?.(results);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error('Multi data fetch error:', err);
      options.onError?.(error);
    }
  }, [fetchFunctions, options, minLoadingTime, loadingText, setLoading, setLoadingText, withLoading]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    data: data as T,
    loading: false,
    errors,
    refetch: fetchAll
  };
}
