'use client';

import React, { useState, useEffect } from 'react';
import { PageLoading, LoadingSpinner, LoadingSkeleton, LoadingCard, LoadingButton } from '@/components/ui/loading';
import { useLoadingState, usePageLoading } from '@/hooks/useLoading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoadingDemo() {
  const { loading: pageLoading } = usePageLoading({ delay: 1000 });
  const { loading: dataLoading, setLoading: setDataLoading } = useLoadingState();
  const { loading: actionLoading, withLoading } = useLoadingState();

  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Simulate page load
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDataLoad = async () => {
    await withLoading(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
    });
  };

  if (pageLoading) {
    return <PageLoading text="Loading beautiful animations..." />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Loading Animations Demo
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Beautiful loading animations that match your website style
          </p>
        </div>

        {/* Loading Spinner Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Loading Spinners</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-8 justify-center">
              <div className="text-center">
                <LoadingSpinner size="sm" text="Small" />
              </div>
              <div className="text-center">
                <LoadingSpinner size="md" text="Medium" />
              </div>
              <div className="text-center">
                <LoadingSpinner size="lg" text="Large" />
              </div>
              <div className="text-center">
                <LoadingSpinner size="xl" text="Extra Large" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Skeleton Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Loading Skeletons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <LoadingSkeleton lines={3} />
            <LoadingSkeleton lines={5} />
            <LoadingSkeleton lines={2} />
          </CardContent>
        </Card>

        {/* Loading Card Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Loading Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </div>
          </CardContent>
        </Card>

        {/* Loading Button Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Loading Buttons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <LoadingButton loading={false}>Normal Button</LoadingButton>
              <LoadingButton loading={true}>Loading Button</LoadingButton>
              <LoadingButton loading={true} disabled>Disabled Loading</LoadingButton>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={handleDataLoad} disabled={dataLoading}>
                {dataLoading ? 'Loading...' : 'Load Data'}
              </Button>
              <Button onClick={actionLoading} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Process Action'}
              </Button>
            </div>
            
            {dataLoading && (
              <div className="flex justify-center p-8">
                <LoadingSpinner size="lg" text="Loading your data..." />
              </div>
            )}
            
            {showContent && !dataLoading && (
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <p className="text-green-800 dark:text-green-200">
                  ✅ Content loaded successfully!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <strong>Page Loading:</strong>
                <pre className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded mt-1">
{`import { PageLoading } from '@/components/ui/loading';
import { usePageLoading } from '@/hooks/useLoading';

export default function MyPage() {
  const { loading } = usePageLoading();
  
  if (loading) {
    return <PageLoading text="Loading..." />;
  }
  
  return <div>Your content</div>;
}`}
                </pre>
              </div>
              
              <div>
                <strong>Loading State:</strong>
                <pre className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded mt-1">
{`import { useLoadingState } from '@/hooks/useLoading';

export default function MyComponent() {
  const { loading, withLoading } = useLoadingState();
  
  const fetchData = async () => {
    await withLoading(async () => {
      const data = await api.getData();
      setData(data);
    });
  };
  
  return (
    <div>
      {loading && <LoadingSpinner />}
      <button onClick={fetchData}>Load Data</button>
    </div>
  );
}`}
                </pre>
              </div>
              
              <div>
                <strong>Loading Button:</strong>
                <pre className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded mt-1">
{`import { LoadingButton } from '@/components/ui/loading';

export default function MyForm() {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.submit();
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <LoadingButton loading={loading} onClick={handleSubmit}>
      {loading ? 'Submitting...' : 'Submit'}
    </LoadingButton>
  );
}`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
