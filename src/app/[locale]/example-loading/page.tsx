'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/PageLoader';
import { useLoading } from '@/contexts/LoadingContext';
import { useDataFetcher } from '@/hooks/useDataFetcher';

// Example API calls
const fetchUserData = async () => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { name: 'John Doe', email: 'john@example.com' };
};

export default function ExampleLoadingPage() {
  const { setLoading, setLoadingText, withLoading } = useLoading();

  // Automatic loading with data fetching
  const { data: userData, refetch: refetchUser } = useDataFetcher(fetchUserData, {
    loadingText: 'Loading user profile...',
    minLoadingTime: 1000
  });

  // Manual loading control
  const handleManualLoad = async () => {
    await withLoading(async () => {
      setLoadingText('Processing your request...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }, 1500);
  };

  return (
    <PageLoader 
      skeletonType="dashboard" 
      loadingText="Loading example page..."
      minLoadingTime={800}
    >
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Global Loading Example</h1>
        
        {/* User Data Section */}
        <Card>
          <CardHeader>
            <CardTitle>User Profile (Auto-loaded)</CardTitle>
          </CardHeader>
          <CardContent>
            {userData ? (
              <div>
                <p><strong>Name:</strong> {userData.name}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <Button onClick={refetchUser} className="mt-2">
                  Refresh User Data
                </Button>
              </div>
            ) : (
              <p>Loading user data...</p>
            )}
          </CardContent>
        </Card>

        {/* Manual Loading Section */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Loading Example</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Click the button to see the global loading overlay:</p>
            <Button onClick={handleManualLoad} className="mt-2">
              Start Manual Loading
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use Global Loading</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <strong>1. PageLoader Component:</strong>
                <pre className="bg-gray-100 p-2 rounded mt-1">
{`<PageLoader skeletonType="dashboard">
  <YourPage />
</PageLoader>`}
                </pre>
              </div>
              
              <div>
                <strong>2. useDataFetcher Hook:</strong>
                <pre className="bg-gray-100 p-2 rounded mt-1">
{`const { data, refetch } = useDataFetcher(fetchFn, {
  loadingText: 'Loading data...',
  minLoadingTime: 1000
});`}
                </pre>
              </div>
              
              <div>
                <strong>3. Manual Loading:</strong>
                <pre className="bg-gray-100 p-2 rounded mt-1">
{`const { withLoading } = useLoading();
await withLoading(async () => {
  // Your async operation
}, 1000);`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLoader>
  );
}
