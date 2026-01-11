'use client';

import { DirectionProvider } from '@radix-ui/react-direction';
import type { ReactNode } from 'react';

export function AppDirectionProvider({ children, direction }: { 
  children: ReactNode; 
  direction: 'ltr' | 'rtl' 
}) {
  return (
    <DirectionProvider dir={direction}>
      {children}
    </DirectionProvider>
  );
}
