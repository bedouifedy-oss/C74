'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageDropdown } from '@/components/LanguageDropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  LogOut,
  User,
  Users,
  Star,
  FileText,
  LayoutDashboard,
  Home,
  Sun,
  Moon,
  Eye,
  Palette,
  Briefcase,
  MessageCircle,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import type { Locale } from '@/i18n-routing';

export type MenuItemType = {
  key: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  separator?: boolean;
};

interface HeaderMenuProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  menuItems: MenuItemType[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function HeaderMenu({
  locale,
  onLocaleChange,
  menuItems,
  title,
  subtitle,
  className = '',
}: HeaderMenuProps) {
  const { theme, toggleTheme } = useTheme();

  const handleMenuItemClick = (item: MenuItemType) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      window.location.href = item.href;
    }
  };

  return (
    <div className={`bg-white dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {title && (
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{title}</h1>
              {subtitle && <p className="text-neutral-600 dark:text-neutral-400">{subtitle}</p>}
            </div>
          )}
          <div className={`flex items-center gap-2 ${!title ? 'ms-auto' : ''}`}>
            <LanguageDropdown currentLocale={locale} onLocaleChange={onLocaleChange} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" suppressHydrationWarning>
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Theme toggle inside menu */}
                <DropdownMenuItem
                  onClick={toggleTheme}
                  className="cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 me-2" />
                  ) : (
                    <Moon className="w-4 h-4 me-2" />
                  )}
                  {theme === 'dark' 
                    ? (locale === 'ar-TN' ? 'الوضع النهاري' : locale === 'fr' ? 'Mode clair' : 'Light Mode')
                    : (locale === 'ar-TN' ? 'الوضع الليلي' : locale === 'fr' ? 'Mode sombre' : 'Dark Mode')
                  }
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {menuItems.map((item, index) => (
                  <React.Fragment key={item.key}>
                    {item.separator && index > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={() => handleMenuItemClick(item)}
                      className={`cursor-pointer ${item.variant === 'danger' ? 'text-red-600 focus:text-red-600' : ''}`}
                    >
                      {item.icon}
                      <span className="ms-2">{item.label}</span>
                    </DropdownMenuItem>
                  </React.Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pre-built menu configurations for different user types
export function getCustomerMenuItems(locale: Locale, currentPage?: string): MenuItemType[] {
  const t = {
    en: {
      dashboard: 'Dashboard',
      browseWorkers: 'Browse Workers',
      applications: 'Applications',
      inbox: 'Messages',
      reviews: 'Reviews',
      profile: 'Profile',
      logout: 'Logout',
    },
    fr: {
      dashboard: 'Tableau de bord',
      browseWorkers: 'Parcourir les travailleurs',
      applications: 'Candidatures',
      inbox: 'Messages',
      reviews: 'Avis',
      profile: 'Profil',
      logout: 'Déconnexion',
    },
    'ar-TN': {
      dashboard: 'لوحة التحكم',
      browseWorkers: 'تصفح العمال',
      applications: 'الطلبات',
      inbox: 'الرسائل',
      reviews: 'التقييمات',
      profile: 'الملف الشخصي',
      logout: 'تسجيل الخروج',
    },
  };
  const labels = t[locale];

  const items: MenuItemType[] = [];

  if (currentPage !== 'dashboard') {
    items.push({
      key: 'dashboard',
      label: labels.dashboard,
      icon: <LayoutDashboard className="w-4 h-4" />,
      href: `/${locale}/customer/dashboard`,
    });
  }

  if (currentPage !== 'browse-workers') {
    items.push({
      key: 'browse-workers',
      label: labels.browseWorkers,
      icon: <Users className="w-4 h-4" />,
      href: `/${locale}/customer/browse-workers`,
    });
  }

  if (currentPage !== 'applications') {
    items.push({
      key: 'applications',
      label: labels.applications,
      icon: <FileText className="w-4 h-4" />,
      href: `/${locale}/customer/applications`,
    });
  }

  if (currentPage !== 'inbox') {
    items.push({
      key: 'inbox',
      label: labels.inbox,
      icon: <MessageCircle className="w-4 h-4" />,
      href: `/${locale}/customer/inbox`,
    });
  }

  if (currentPage !== 'reviews') {
    items.push({
      key: 'reviews',
      label: labels.reviews,
      icon: <Star className="w-4 h-4" />,
      href: `/${locale}/customer/review`,
    });
  }

  if (currentPage !== 'profile') {
    items.push({
      key: 'profile',
      label: labels.profile,
      icon: <User className="w-4 h-4" />,
      href: `/${locale}/customer/profile`,
    });
  }

  items.push({
    key: 'logout',
    label: labels.logout,
    icon: <LogOut className="w-4 h-4" />,
    onClick: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = `/${locale}/login`;
    },
    variant: 'danger',
    separator: true,
  });

  return items;
}

export function getWorkerMenuItems(locale: Locale, currentPage?: string): MenuItemType[] {
  const t = {
    en: {
      dashboard: 'Dashboard',
      jobs: 'Available Jobs',
      applications: 'My Applications',
      inbox: 'Messages',
      availability: 'Availability',
      fees: 'My Fees',
      profile: 'Profile',
      logout: 'Logout',
    },
    fr: {
      dashboard: 'Tableau de bord',
      jobs: 'Emplois disponibles',
      applications: 'Mes candidatures',
      inbox: 'Messages',
      availability: 'Disponibilité',
      fees: 'Mes frais',
      profile: 'Profil',
      logout: 'Déconnexion',
    },
    'ar-TN': {
      dashboard: 'لوحة التحكم',
      jobs: 'الوظائف المتاحة',
      applications: 'طلباتي',
      inbox: 'الرسائل',
      availability: 'التوفر',
      fees: 'مستحقاتي',
      profile: 'الملف الشخصي',
      logout: 'تسجيل الخروج',
    },
  };
  const labels = t[locale];

  const items: MenuItemType[] = [];

  if (currentPage !== 'dashboard') {
    items.push({
      key: 'dashboard',
      label: labels.dashboard,
      icon: <LayoutDashboard className="w-4 h-4" />,
      href: `/${locale}/worker/dashboard`,
    });
  }

  if (currentPage !== 'jobs') {
    items.push({
      key: 'jobs',
      label: labels.jobs,
      icon: <Briefcase className="w-4 h-4" />,
      href: `/${locale}/worker/jobs`,
    });
  }

  if (currentPage !== 'inbox') {
    items.push({
      key: 'inbox',
      label: labels.inbox,
      icon: <MessageCircle className="w-4 h-4" />,
      href: `/${locale}/worker/inbox`,
    });
  }

  if (currentPage !== 'availability') {
    items.push({
      key: 'availability',
      label: labels.availability,
      icon: <Calendar className="w-4 h-4" />,
      href: `/${locale}/worker/availability`,
    });
  }

  if (currentPage !== 'fees') {
    items.push({
      key: 'fees',
      label: labels.fees,
      icon: <CreditCard className="w-4 h-4" />,
      href: `/${locale}/worker/fees`,
    });
  }

  if (currentPage !== 'profile') {
    items.push({
      key: 'profile',
      label: labels.profile,
      icon: <User className="w-4 h-4" />,
      href: `/${locale}/worker/profile`,
    });
  }

  items.push({
    key: 'logout',
    label: labels.logout,
    icon: <LogOut className="w-4 h-4" />,
    onClick: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = `/${locale}/login`;
    },
    variant: 'danger',
    separator: true,
  });

  return items;
}

export function getPublicMenuItems(locale: Locale, currentPage?: string): MenuItemType[] {
  const t = {
    en: {
      home: 'Home',
      showcase: 'Component Showcase',
      shadcn: 'ShadCN Components',
      signUp: 'Sign Up',
    },
    fr: {
      home: 'Accueil',
      showcase: 'Vitrine des composants',
      shadcn: 'Composants ShadCN',
      signUp: "S'inscrire",
    },
    'ar-TN': {
      home: 'الرئيسية',
      showcase: 'عرض المكونات',
      shadcn: 'مكونات ShadCN',
      signUp: 'التسجيل',
    },
  };
  const labels = t[locale];

  const items: MenuItemType[] = [];

  if (currentPage !== 'home') {
    items.push({
      key: 'home',
      label: labels.home,
      icon: <Home className="w-4 h-4" />,
      href: `/${locale}`,
    });
  }

  if (currentPage !== 'showcase') {
    items.push({
      key: 'showcase',
      label: labels.showcase,
      icon: <Eye className="w-4 h-4" />,
      href: `/${locale}/showcase`,
    });
  }

  if (currentPage !== 'shadcn') {
    items.push({
      key: 'shadcn',
      label: labels.shadcn,
      icon: <Palette className="w-4 h-4" />,
      href: `/${locale}/shadcn`,
    });
  }

  items.push({
    key: 'signup',
    label: labels.signUp,
    icon: <User className="w-4 h-4" />,
    href: `/${locale}/signup`,
    separator: true,
  });

  return items;
}

export default HeaderMenu;
