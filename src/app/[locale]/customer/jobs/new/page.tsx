'use client';

import { ArrowLeft } from 'lucide-react';
import { Link, useRouter } from '@/lib/i18n';
import { useLocale as useC74Locale } from '@/hooks/useLocale';
import { HeaderMenu, getCustomerMenuItems } from '@/components/HeaderMenu';
import JobForm from '@/components/jobs/JobForm';

export default function NewJobPage() {
  const { locale, setLocale } = useC74Locale();
  const router = useRouter();

  const pageTranslations = {
    en: {
      title: 'Post a New Job',
      subtitle: 'Describe your service needs and find the right professional',
      backToDashboard: 'Back to Dashboard',
    },
    fr: {
      title: 'Publier une Demande',
      subtitle: 'Décrivez vos besoins et trouvez le bon professionnel',
      backToDashboard: 'Retour au tableau de bord',
    },
    'ar-TN': {
      title: 'انشر طلب جديد',
      subtitle: 'اوصف شنوا تحتاج ولقى العامل المناسب',
      backToDashboard: 'رجوع للوحة التحكم',
    },
  };

  const t = pageTranslations[locale];

  const handleSuccess = (jobId: string) => {
    console.log('Job created:', jobId);
  };

  const handleCancel = () => {
    router.push('/customer/dashboard');
  };

  return (
    <div
      className="min-h-screen bg-neutral-50 dark:bg-neutral-900"
    >
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getCustomerMenuItems(locale, 'new-job')}
        title={t.title}
        subtitle={t.subtitle}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/customer/dashboard"
          className={`inline-flex items-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 mb-6`}
        >
          <ArrowLeft className={`w-4 h-4 me-2 rtl:rotate-180`} />
          {t.backToDashboard}
        </Link>

        {/* Job Form */}
        <JobForm
          locale={locale}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
