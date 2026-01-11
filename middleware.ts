import createMiddleware from 'next-intl/middleware';
import {defaultLocale, locales} from './src/i18n-routing';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true
});

export const config = {
  matcher: ['/', '/(en|fr|ar-TN)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
