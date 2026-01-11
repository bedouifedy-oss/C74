'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Phone, User, Mail, Shield, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { PhoneInput } from '@/components/PhoneInput';
import { Link, useRouter } from '@/lib/i18n';
import { useLocale, useTranslations } from 'next-intl';
import { LanguageDropdown } from '@/components/LanguageDropdown';
import { useLocale as useC74Locale } from '@/hooks/useLocale';
import type { Locale } from '@/i18n-routing';

const pageTranslations = {
  en: {
    joinC74: 'Join C74',
    createAccount: 'Create your account and start connecting with trusted professionals',
    iAmA: 'I am a...',
    customer: 'Customer',
    worker: 'Worker',
    phoneNumber: 'Phone Number',
    phonePlaceholder: '+216 XX XXX XXX',
    sendVerification: "We'll send you a verification code",
    fullName: 'Full Name',
    namePlaceholder: 'Enter your full name',
    emailOptional: 'Email (Optional)',
    emailPlaceholder: 'your@email.com',
    emailNote: "We'll only use this for important updates",
    password: 'Password',
    passwordPlaceholder: 'Create a secure password',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Confirm your password',
    passwordMismatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 6 characters',
    sendCode: 'Send Verification Code',
    termsAgree: 'By signing up, you agree to our',
    termsOfService: 'Terms of Service',
    and: 'and',
    privacyPolicy: 'Privacy Policy',
    alreadyHaveAccount: 'Already have an account?',
    logIn: 'Log In',
    backToHome: 'Back to Home',
    networkError: 'Network error. Please try again.',
  },
  fr: {
    joinC74: 'Rejoindre C74',
    createAccount: 'Créez votre compte et connectez-vous avec des professionnels de confiance',
    iAmA: 'Je suis...',
    customer: 'Client',
    worker: 'Travailleur',
    phoneNumber: 'Numéro de téléphone',
    phonePlaceholder: '+216 XX XXX XXX',
    sendVerification: 'Nous vous enverrons un code de vérification',
    fullName: 'Nom complet',
    namePlaceholder: 'Entrez votre nom complet',
    emailOptional: 'Email (Optionnel)',
    emailPlaceholder: 'votre@email.com',
    emailNote: 'Nous ne l\'utiliserons que pour les mises à jour importantes',
    password: 'Mot de passe',
    passwordPlaceholder: 'Créez un mot de passe sécurisé',
    confirmPassword: 'Confirmer le mot de passe',
    confirmPasswordPlaceholder: 'Confirmez votre mot de passe',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
    passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
    sendCode: 'Envoyer le code de vérification',
    termsAgree: 'En vous inscrivant, vous acceptez nos',
    termsOfService: 'Conditions d\'utilisation',
    and: 'et',
    privacyPolicy: 'Politique de confidentialité',
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    logIn: 'Se connecter',
    backToHome: 'Retour à l\'accueil',
    networkError: 'Erreur réseau. Veuillez réessayer.',
  },
  'ar-TN': {
    joinC74: 'انضم إلى C74',
    createAccount: 'أنشئ حسابك وابدأ التواصل مع المحترفين الموثوقين',
    iAmA: 'أنا...',
    customer: 'حريف',
    worker: 'عامل',
    phoneNumber: 'رقم الهاتف',
    phonePlaceholder: '+216 XX XXX XXX',
    sendVerification: 'سنرسل لك رمز التحقق',
    fullName: 'الاسم الكامل',
    namePlaceholder: 'أدخل اسمك الكامل',
    emailOptional: 'البريد الإلكتروني (اختياري)',
    emailPlaceholder: 'your@email.com',
    emailNote: 'سنستخدمه فقط للتحديثات المهمة',
    password: 'كلمة المرور',
    passwordPlaceholder: 'أنشئ كلمة مرور آمنة',
    confirmPassword: 'تأكيد كلمة المرور',
    confirmPasswordPlaceholder: 'أكد كلمة المرور',
    passwordMismatch: 'كلمات المرور غير متطابقة',
    passwordTooShort: 'يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل',
    sendCode: 'إرسال رمز التحقق',
    termsAgree: 'بالتسجيل، أنت توافق على',
    termsOfService: 'شروط الخدمة',
    and: 'و',
    privacyPolicy: 'سياسة الخصوصية',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    logIn: 'تسجيل الدخول',
    backToHome: 'العودة للرئيسية',
    networkError: 'خطأ في الشبكة. حاول مرة أخرى.',
  },
};

function SignUpPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const intlLocale = useLocale();
  const { locale, setLocale } = useC74Locale();
  const t = pageTranslations[locale as Locale];
  const roleParam = searchParams.get('role');
  const initialRole = (roleParam === 'customer' || roleParam === 'worker') ? roleParam : 'customer';
  
  const [role, setRole] = useState<'customer' | 'worker'>(initialRole);
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync role state with form data
  useEffect(() => {
    setFormData(prev => ({ ...prev, role }));
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    // Validate password
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: t.passwordTooShort });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: t.passwordMismatch });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        const payload = result?.data;
        console.log('Sign up successful:', payload);
        
        // Store user data for OTP verification and subsequent login
        localStorage.setItem('pending_user_id', payload?.user_id || '');
        localStorage.setItem('pending_phone', formData.phone);
        localStorage.setItem('pending_role', role);
        localStorage.setItem('pending_auth_action', 'signup');
        localStorage.setItem('auth_token', payload?.token); // Store JWT token
        
        // Show debug OTP in development
        if (payload?.debug_otp) {
          console.log('Debug OTP:', payload.debug_otp);
        }

        setMessage({ type: 'success', text: locale === 'ar-TN' ? 'تم إرسال رمز التحقق' : locale === 'fr' ? 'Code envoyé' : 'Verification code sent' });
        
        // Redirect to OTP verification (locale-aware)
        router.push('/verify');
      } else {
        const errorMsg = result?.error?.message || result?.error || (locale === 'ar-TN' ? 'فشل التسجيل' : locale === 'fr' ? "Échec de l'inscription" : 'Sign up failed');
        setMessage({ type: 'error', text: typeof errorMsg === 'string' ? errorMsg : (locale === 'ar-TN' ? 'فشل التسجيل' : locale === 'fr' ? "Échec de l'inscription" : 'Sign up failed') });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setMessage({ type: 'error', text: t.networkError });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-neutral-900 dark:to-neutral-800">
      {/* Header with Language Dropdown */}
      <div className="max-w-md mx-auto px-4 pt-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200">
            <ArrowLeft className="w-4 h-4 me-2 rtl:rotate-180" />
            {t.backToHome}
          </Link>
          <LanguageDropdown currentLocale={locale} onLocaleChange={setLocale} />
        </div>
      </div>

      <div className="flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-md">
          {/* Sign Up Card */}
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {t.joinC74}
              </CardTitle>
              <CardDescription>
                {t.createAccount}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {message && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                  message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="text-sm">{message.text}</span>
                </div>
              )}
              {/* Role Selection */}
              <div className="mb-6">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">
                  {t.iAmA}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={role === 'customer' ? 'default' : 'outline'}
                    className={role === 'customer' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                    onClick={() => setRole('customer')}
                  >
                    <User className="w-4 h-4 me-2" />
                    {t.customer}
                  </Button>
                  <Button
                    type="button"
                    variant={role === 'worker' ? 'default' : 'outline'}
                    className={role === 'worker' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                    onClick={() => setRole('worker')}
                  >
                    <Shield className="w-4 h-4 me-2" />
                    {t.worker}
                  </Button>
                </div>
              </div>

              {/* Sign Up Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline me-2" />
                    {t.phoneNumber} *
                  </Label>
                  <PhoneInput
                    value={formData.phone}
                    onChange={(fullPhone) => setFormData({ ...formData, phone: fullPhone })}
                    locale={locale as Locale}
                    defaultCountry="TN"
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {t.sendVerification}
                  </p>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <User className="w-4 h-4 inline me-2" />
                    {t.fullName} *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder={t.namePlaceholder}
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline me-2" />
                    {t.emailOptional}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t.emailPlaceholder}
                    value={formData.email}
                    onChange={handleInputChange}
                    dir="ltr"
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {t.emailNote}
                  </p>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">
                    <Lock className="w-4 h-4 inline me-2" />
                    {t.password} *
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder={t.passwordPlaceholder}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    <Lock className="w-4 h-4 inline me-2" />
                    {t.confirmPassword} *
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder={t.confirmPasswordPlaceholder}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin me-2" />
                      {t.sendCode}
                    </>
                  ) : (
                    t.sendCode
                  )}
                </Button>
              </form>

              {/* Terms */}
              <div className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
                {t.termsAgree}{' '}
                <Link href="/terms" className="text-emerald-600 hover:underline">
                  {t.termsOfService}
                </Link>{' '}
                {t.and}{' '}
                <Link href="/privacy" className="text-emerald-600 hover:underline">
                  {t.privacyPolicy}
                </Link>
              </div>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {t.alreadyHaveAccount}{' '}
                </span>
                <Link href="/login" className="text-sm text-emerald-600 hover:underline font-medium">
                  {t.logIn}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpPageInner />
    </Suspense>
  );
}
