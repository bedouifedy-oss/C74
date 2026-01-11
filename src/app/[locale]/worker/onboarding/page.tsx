'use client';

import { useRouter } from '@/lib/i18n';
import { useLocale as useC74Locale } from '@/hooks/useLocale';
import { OnboardingWizard } from '@/components/worker/OnboardingWizard';

export default function WorkerOnboardingPage() {
  const router = useRouter();
  const { locale } = useC74Locale();

  const handleComplete = () => {
    router.push('/worker/dashboard');
  };

  return <OnboardingWizard locale={locale} onComplete={handleComplete} />;
}
