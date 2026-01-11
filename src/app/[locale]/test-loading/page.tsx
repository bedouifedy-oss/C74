'use client';

import React, { useState, useEffect } from 'react';
import { LoadingSpinner, PageLoading } from '@/components/ui/loading';
import { useLoadingState, usePageLoading } from '@/hooks/useLoading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoadingTest() {
  const { loading: pageLoading } = usePageLoading({ delay: 2000 });
  const { loading: dataLoading, withLoading } = useLoadingState();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleTest = async () => {
    await withLoading(async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
    });
  };

  if (pageLoading) {
    return <PageLoading text="Testing loading animations..." />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading Animation Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <LoadingSpinner size="xl" text="Loading spinner test..." />
            </div>
            
            <div className="flex justify-center">
              <Button onClick={handleTest} disabled={dataLoading}>
                {dataLoading ? 'Loading...' : 'Test Loading State'}
              </Button>
            </div>
            
            {dataLoading && (
              <div className="flex justify-center">
                <LoadingSpinner size="lg" text="Processing your request..." />
              </div>
            )}
            
            {showContent && (
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg text-center">
                <p className="text-green-800 dark:text-green-200">
                  ✅ Loading animations are working!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
