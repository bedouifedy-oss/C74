'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Locale = 'en' | 'fr' | 'ar-TN';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

const countries: Country[] = [
  { code: 'TN', name: 'Tunisia', dialCode: '+216', flag: '🇹🇳' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'DZ', name: 'Algeria', dialCode: '+213', flag: '🇩🇿' },
  { code: 'MA', name: 'Morocco', dialCode: '+212', flag: '🇲🇦' },
  { code: 'LY', name: 'Libya', dialCode: '+218', flag: '🇱🇾' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
];

const translations: Record<Locale, Record<string, string>> = {
  en: {
    enterPhone: 'Enter your phone number',
  },
  fr: {
    enterPhone: 'Entrez votre numéro',
  },
  'ar-TN': {
    enterPhone: 'أدخل رقم هاتفك',
  },
};

interface PhoneInputProps {
  value: string;
  onChange: (fullPhone: string, localPhone: string, countryCode: string) => void;
  locale?: Locale;
  defaultCountry?: string;
  error?: string;
  disabled?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  locale = 'en',
  defaultCountry = 'TN',
  error,
  disabled = false,
}: PhoneInputProps) {
  const t = translations[locale] || translations.en;
  
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === defaultCountry) || countries[0]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [localPhone, setLocalPhone] = useState(value.replace(selectedCountry.dialCode, ''));

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    const fullPhone = country.dialCode + localPhone.replace(/^0+/, '');
    onChange(fullPhone, localPhone, country.dialCode);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '');
    const withoutLeadingZeros = cleaned.replace(/^0+/, '');
    setLocalPhone(withoutLeadingZeros);
    const fullPhone = selectedCountry.dialCode + withoutLeadingZeros;
    onChange(fullPhone, withoutLeadingZeros, selectedCountry.dialCode);
  };

  return (
    <div className="w-full">
      {/* Container with proper RTL handling */}
      <div className="flex flex-row" dir="ltr">
        {/* Country Selector - always first in DOM, position controlled by flex */}
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className="h-10 px-3 gap-1 rounded-s-md rounded-e-none border-e-0"
          >
            <span>{selectedCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>

          {/* Dropdown */}
          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
              <div className="absolute z-20 mt-1 w-64 max-h-60 overflow-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg left-0">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-start ${
                      selectedCountry.code === country.code ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                    }`}
                  >
                    <span>{country.flag}</span>
                    <span className="flex-1 text-sm text-neutral-700 dark:text-neutral-200">
                      {country.name}
                    </span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {country.dialCode}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Phone Input */}
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel-national"
          value={localPhone}
          onChange={handlePhoneChange}
          placeholder={t.enterPhone}
          disabled={disabled}
          className={`flex-1 rounded-e-md rounded-s-none ${error ? 'border-red-500' : ''}`}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500 text-start">
          {error}
        </p>
      )}
    </div>
  );
}

export default PhoneInput;
