'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div className="relative">
        <div
          className={cn(
            'border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin',
            sizeClasses[size]
          )}
        />
        {/* Inner glow effect */}
        <div
          className={cn(
            'absolute inset-0 border-2 border-transparent rounded-full animate-ping',
            'border-t-primary-400 opacity-30',
            sizeClasses[size]
          )}
        />
      </div>
      {text && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export function LoadingSkeleton({ lines = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1.5s'
          }}
        />
      ))}
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
  children?: React.ReactNode;
}

export function LoadingCard({ className, children }: LoadingCardProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
        <div className="space-y-4">
          {/* Icon placeholder */}
          <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-full mx-auto"></div>
          
          {/* Title placeholder */}
          <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mx-auto"></div>
          
          {/* Count placeholder */}
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

interface PageLoadingProps {
  text?: string;
}

export function PageLoading({ text = 'Loading...' }: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 animate-pulse">
          {text}
        </p>
        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

interface LoadingButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function LoadingButton({ children, loading = false, disabled = false, className }: LoadingButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 relative',
        (loading || disabled) && 'cursor-not-allowed',
        className
      )}
      disabled={loading || disabled}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </div>
      )}
      <span className={loading ? 'invisible' : ''}>{children}</span>
    </button>
  );
}
