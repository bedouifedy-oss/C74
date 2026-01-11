'use client';

import React from 'react';
import { Link, usePathname } from '@/lib/i18n';
import { Home, Briefcase, MessageCircle, User, PlusCircle, LayoutDashboard, Users, AlertTriangle, DollarSign } from 'lucide-react';
import type { Locale } from '@/i18n-routing';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  activeMatch?: string[];
}

interface MobileBottomNavProps {
  locale: Locale;
  userRole: 'customer' | 'worker' | 'admin';
}

const translations = {
  en: {
    home: 'Home',
    jobs: 'Jobs',
    messages: 'Messages',
    profile: 'Profile',
    create: 'Create',
    dashboard: 'Dashboard',
    workers: 'Workers',
    disputes: 'Disputes',
    fees: 'Fees',
    availability: 'Schedule',
    myJobs: 'My Jobs',
  },
  fr: {
    home: 'Accueil',
    jobs: 'Travaux',
    messages: 'Messages',
    profile: 'Profil',
    create: 'Créer',
    dashboard: 'Tableau',
    workers: 'Travailleurs',
    disputes: 'Litiges',
    fees: 'Frais',
    availability: 'Planning',
    myJobs: 'Mes Travaux',
  },
  'ar-TN': {
    home: 'الرئيسية',
    jobs: 'خدمات',
    messages: 'رسائل',
    profile: 'حسابي',
    create: 'جديد',
    dashboard: 'لوحة',
    workers: 'عمال',
    disputes: 'نزاعات',
    fees: 'رسوم',
    availability: 'الجدول',
    myJobs: 'خدماتي',
  },
};

function getNavItems(locale: Locale, role: 'customer' | 'worker' | 'admin'): NavItem[] {
  const t = translations[locale];

  if (role === 'customer') {
    return [
      { key: 'home', label: t.home, icon: <Home className="w-5 h-5" />, href: '/', activeMatch: ['/'] },
      { key: 'jobs', label: t.jobs, icon: <Briefcase className="w-5 h-5" />, href: '/customer/dashboard', activeMatch: ['/customer/dashboard', '/customer/jobs'] },
      { key: 'create', label: t.create, icon: <PlusCircle className="w-6 h-6" />, href: '/customer/jobs/new', activeMatch: ['/customer/jobs/new'] },
      { key: 'messages', label: t.messages, icon: <MessageCircle className="w-5 h-5" />, href: '/customer/inbox', activeMatch: ['/customer/inbox'] },
      { key: 'profile', label: t.profile, icon: <User className="w-5 h-5" />, href: '/customer/profile', activeMatch: ['/customer/profile', '/customer/applications'] },
    ];
  }

  if (role === 'worker') {
    return [
      { key: 'home', label: t.home, icon: <Home className="w-5 h-5" />, href: '/', activeMatch: ['/'] },
      { key: 'jobs', label: t.myJobs, icon: <Briefcase className="w-5 h-5" />, href: '/worker/dashboard', activeMatch: ['/worker/dashboard'] },
      { key: 'browse', label: t.jobs, icon: <PlusCircle className="w-6 h-6" />, href: '/worker/jobs', activeMatch: ['/worker/jobs'] },
      { key: 'messages', label: t.messages, icon: <MessageCircle className="w-5 h-5" />, href: '/worker/inbox', activeMatch: ['/worker/inbox'] },
      { key: 'profile', label: t.profile, icon: <User className="w-5 h-5" />, href: '/worker/profile', activeMatch: ['/worker/profile', '/worker/fees', '/worker/availability'] },
    ];
  }

  // Admin
  return [
    { key: 'dashboard', label: t.dashboard, icon: <LayoutDashboard className="w-5 h-5" />, href: '/admin/dashboard', activeMatch: ['/admin/dashboard'] },
    { key: 'workers', label: t.workers, icon: <Users className="w-5 h-5" />, href: '/admin/workers/pending', activeMatch: ['/admin/workers'] },
    { key: 'disputes', label: t.disputes, icon: <AlertTriangle className="w-5 h-5" />, href: '/admin/disputes', activeMatch: ['/admin/disputes'] },
    { key: 'fees', label: t.fees, icon: <DollarSign className="w-5 h-5" />, href: '/admin/fees', activeMatch: ['/admin/fees'] },
  ];
}

export function MobileBottomNav({ locale, userRole }: MobileBottomNavProps) {
  const pathname = usePathname();
  const navItems = getNavItems(locale, userRole);
  
  // Debug: Log the nav items
  console.log('MobileBottomNav navItems:', navItems.map(item => ({ key: item.key, href: item.href })));

  const isActive = (item: NavItem) => {
    if (item.activeMatch) {
      return item.activeMatch.some(match => pathname === match || pathname.startsWith(match + '/'));
    }
    return pathname === item.href;
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-16 md:hidden" />
      
      {/* Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 md:hidden"
      >
        <div className={`flex items-center justify-around h-16 px-2`}>
          {navItems.map((item) => {
            const active = isActive(item);
            const isCreateButton = item.key === 'create' || item.key === 'browse';
            
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                  isCreateButton 
                    ? 'relative -mt-4' 
                    : ''
                } ${
                  active 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                {isCreateButton ? (
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg ${
                    active 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}>
                    {item.icon}
                  </div>
                ) : (
                  <>
                    <div className={`${active ? 'scale-110' : ''} transition-transform`}>
                      {item.icon}
                    </div>
                    <span className={`text-xs mt-1 ${active ? 'font-medium' : ''}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
        
        {/* Safe area for iOS */}
        <div className="h-safe-area-inset-bottom bg-white dark:bg-neutral-900" />
      </nav>
    </>
  );
}

export default MobileBottomNav;
