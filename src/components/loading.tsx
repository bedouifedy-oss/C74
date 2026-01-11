import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-neutral-300 border-t-primary-600',
        sizeClasses[size],
        className
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ className, lines = 3 }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-neutral-200 rounded animate-pulse"
        />
      ))}
    </div>
  );
}

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-neutral-600">{message}</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
