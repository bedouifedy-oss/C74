# Global Loading HOC Template

## How to Apply Loading to ANY Page (Method 2: HOC)

### Step 1: Import the HOC
```tsx
import { withGlobalLoading } from '@/components/GlobalPageLoader';
```

### Step 2: Change Default Export to Named Export
```tsx
// BEFORE
export default function YourPage() {
  // ... component code
}

// AFTER  
function YourPage() {
  // ... component code
}
```

### Step 3: Add HOC Export at End
```tsx
// Export with HOC for automatic loading
export default withGlobalLoading(YourPage, {
  minLoadingTime: 1000,  // Optional: customize loading time
  showSpinner: true      // Optional: show/hide spinner
});
```

## Complete Example

```tsx
'use client';

import React from 'react';
import { withGlobalLoading } from '@/components/GlobalPageLoader';

function YourPage() {
  return (
    <div>
      <h1>Your Page Content</h1>
      {/* Your page content here */}
    </div>
  );
}

// Export with HOC for automatic loading
export default withGlobalLoading(YourPage, {
  minLoadingTime: 1000,
  showSpinner: true
});
```

## Pages Already Updated

✅ **CustomerDashboardPage** - 1200ms loading time
✅ **LoginPage** - 800ms loading time

## Pages to Update

Copy this pattern to all your pages:

- `/src/app/[locale]/(auth)/signup/page.tsx`
- `/src/app/[locale]/customer/browse-workers/page.tsx`
- `/src/app/[locale]/customer/jobs/new/page.tsx`
- `/src/app/[locale]/customer/profile/page.tsx`
- `/src/app/[locale]/worker/dashboard/page.tsx`
- `/src/app/[locale]/worker/profile/page.tsx`
- Any other pages you have

## Benefits

- **Zero Hardcoding** - Same loading for all pages
- **Consistent UX** - Uniform loading experience  
- **Minimal Code** - Just 3 lines per page
- **Localized** - Auto EN/FR/Arabic text
- **Customizable** - Adjust timing per page

## Loading Time Recommendations

- **Dashboard Pages**: 1200ms (more data to load)
- **Auth Pages**: 800ms (simple forms)
- **Profile Pages**: 1000ms (medium complexity)
- **List Pages**: 1000ms (data fetching)
- **Form Pages**: 600ms (quick load)
