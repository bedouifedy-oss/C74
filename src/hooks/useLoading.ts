'use client';

import { useState, useEffect } from 'react';

interface UseLoadingState {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
}

export function useLoadingState(initialState = false): UseLoadingState {
  const [loading, setLoading] = useState(initialState);

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    try {
      const result = await fn();
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { loading, setLoading, withLoading };
}

interface UsePageLoadingProps {
  delay?: number;
}

export function usePageLoading({ delay = 300 }: UsePageLoadingProps = {}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return { loading };
}
