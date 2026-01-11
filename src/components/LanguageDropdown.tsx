'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Locale } from '@/i18n-routing';

interface LanguageDropdownProps {
  currentLocale: Locale;
  onLocaleChange: (locale: Locale) => void;
  className?: string;
}

const languages = [
  { code: 'en' as Locale, name: 'English', short: 'EN' },
  { code: 'fr' as Locale, name: 'Français', short: 'FR' },
  { code: 'ar-TN' as Locale, name: 'العربية', short: 'AR' },
];

export function LanguageDropdown({ currentLocale, onLocaleChange, className }: LanguageDropdownProps) {
  const [mounted, setMounted] = useState(false);
  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by rendering a placeholder until mounted
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`flex items-center gap-2 ${className}`}
        disabled
      >
        <Globe className="w-4 h-4" />
        <span>{currentLanguage.short}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 ${className}`}
        >
          <Globe className="w-4 h-4" />
          <span>{currentLanguage.short}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48"
              >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => onLocaleChange(language.code)}
            className={`flex items-center gap-3 cursor-pointer ${
              currentLocale === language.code ? 'bg-primary-50 dark:bg-primary-900/20' : ''
            }`}
          >
            <div className={`flex-1 text-start`}>
              <div className="font-medium">{language.name}</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {language.short}
              </div>
            </div>
            {currentLocale === language.code && (
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
