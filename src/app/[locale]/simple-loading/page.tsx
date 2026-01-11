'use client';

import React, { useState } from 'react';

export default function SimpleLoadingTest() {
  const [loading, setLoading] = useState(false);

  const testLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Simple Loading Test</h1>
        
        <div className="text-center space-y-6">
          {loading ? (
            <div className="space-y-4">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">Loading...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto">
                <div className="w-6 h-6 bg-primary-600 rounded-full"></div>
              </div>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">Ready!</p>
            </div>
          )}
          
          <button
            onClick={testLoading}
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Test Loading'}
          </button>
        </div>
      </div>
    </div>
  );
}
