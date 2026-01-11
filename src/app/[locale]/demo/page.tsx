'use client';

import { Button } from '@/components/ui/button';
import { Link } from '@/lib/i18n';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Demo Page</h1>
        <p className="text-neutral-600 mb-8">C74 Platform Demo</p>
        <Link href="/"><Button variant="outline">Back to Home</Button></Link>
      </div>
    </div>
  );
}
