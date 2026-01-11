'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';

interface EnhancedSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: any) => void;
  placeholder?: string;
  className?: string;
}

const translations = {
  en: {
    search: 'Search',
    filters: 'Filters',
    clearFilters: 'Clear Filters',
    category: 'Category',
    location: 'Location',
    budgetRange: 'Budget Range',
    status: 'Status',
    allCategories: 'All Categories',
    allLocations: 'All Locations',
    allStatuses: 'All Statuses',
    minBudget: 'Min Budget',
    maxBudget: 'Max Budget',
    applyFilters: 'Apply Filters',
  },
  fr: {
    search: 'Rechercher',
    filters: 'Filtres',
    clearFilters: 'Effacer les filtres',
    category: 'Catégorie',
    location: 'Lieu',
    budgetRange: 'Fourchette de budget',
    status: 'Statut',
    allCategories: 'Toutes les catégories',
    allLocations: 'Tous les lieux',
    allStatuses: 'Tous les statuts',
    minBudget: 'Budget minimum',
    maxBudget: 'Budget maximum',
    applyFilters: 'Appliquer les filtres',
  },
  'ar-TN': {
    search: 'بحث',
    filters: 'مرشحات',
    clearFilters: 'مسح المرشحات',
    category: 'الفئة',
    location: 'الموقع',
    budgetRange: 'نطاق الميزانية',
    status: 'الحالة',
    allCategories: 'جميع الفئات',
    allLocations: 'جميع المواقع',
    allStatuses: 'جميع الحالات',
    minBudget: 'الحد الأدنى للميزانية',
    maxBudget: 'الحد الأقصى للميزانية',
    applyFilters: 'تطبيق المرشحات',
  },
};

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'ac', label: 'AC Maintenance' },
  { value: 'cleaning', label: 'Cleaning' },
];

const locations = [
  { value: 'all', label: 'All Locations' },
  { value: 'Tunis, El Menzah', label: 'Tunis, El Menzah' },
  { value: 'Sfax, Sfax City', label: 'Sfax, Sfax City' },
  { value: 'Sousse, Sousse City', label: 'Sousse, Sousse City' },
  { value: 'Monastir', label: 'Monastir' },
];

const statuses = [
  { value: 'all', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function EnhancedSearch({ onSearch, onFilterChange, placeholder = 'Search...', className = '' }: EnhancedSearchProps) {
  const { locale } = useLocale();
  const t = translations[locale];
  
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    location: 'all',
    status: 'all',
    minBudget: '',
    maxBudget: '',
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.location !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.minBudget) count++;
    if (filters.maxBudget) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      category: 'all',
      location: 'all',
      status: 'all',
      minBudget: '',
      maxBudget: '',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="relative">
        <Search className={`absolute ${locale === 'ar-TN' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 transition-colors`} />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`pl-12 ${locale === 'ar-TN' ? 'pr-12 pl-4' : 'pl-12 pr-4'} h-12 text-lg transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
        />
        
        {/* Filter Button */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute ${locale === 'ar-TN' ? 'left-2' : 'right-2'} top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
            activeFiltersCount > 0 ? 'border-primary-500 text-primary-600' : ''
          }`}
        >
          <Filter className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <Badge className="ms-2 bg-primary-500 text-white" variant="secondary">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters Dropdown */}
      {showFilters && (
        <Card className="absolute top-full inset-inline-0 mt-2 z-50 animate-in slide-in-from-top duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {t.filters}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                {t.clearFilters}
              </Button>
            </div>

            <div className="space-y-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {t.category}
                </label>
                <div className="relative">
                  <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger className={`w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 appearance-none cursor-pointer ${locale === 'ar-TN' ? 'pe-10' : 'pe-10'}`}>
                      <SelectValue placeholder={t.allCategories} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ChevronDown className={`absolute ${locale === 'ar-TN' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none`} />
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {t.location}
                </label>
                <div className="relative">
                  <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                    <SelectTrigger className={`w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 appearance-none cursor-pointer ${locale === 'ar-TN' ? 'pe-10' : 'pe-10'}`}>
                      <SelectValue placeholder={t.allLocations} />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ChevronDown className={`absolute ${locale === 'ar-TN' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none`} />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {t.status}
                </label>
                <div className="relative">
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger className={`w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 appearance-none cursor-pointer ${locale === 'ar-TN' ? 'pe-10' : 'pe-10'}`}>
                      <SelectValue placeholder={t.allStatuses} />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ChevronDown className={`absolute ${locale === 'ar-TN' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none`} />
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {t.budgetRange}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      type="number"
                      placeholder={t.minBudget}
                      value={filters.minBudget}
                      onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder={t.maxBudget}
                      value={filters.maxBudget}
                      onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <Button
                  onClick={() => setShowFilters(false)}
                  className="transition-all duration-200 hover:scale-105"
                >
                  {t.applyFilters}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
