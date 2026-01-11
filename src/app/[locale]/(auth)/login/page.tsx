'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Phone, LogIn, Loader2, CheckCircle, AlertCircle, Lock, Mail } from 'lucide-react';
import { PhoneInput } from '@/components/PhoneInput';
import { Link, useRouter } from '@/lib/i18n';
import { LanguageDropdown } from '@/components/LanguageDropdown';
import { useLocale as useC74Locale } from '@/hooks/useLocale';
import { withGlobalLoading } from '@/components/GlobalPageLoader';
import type { Locale } from '@/i18n-routing';

const translations = {
  en: {
    welcomeBack: 'Welcome Back',
    loginDesc: 'Enter your phone number or email to sign in to your account',
    phoneNumber: 'Phone Number',
    phonePlaceholder: '+216 XX XXX XXX',
    email: 'Email Address',
    emailPlaceholder: 'your@email.com',
    usePhone: 'Use Phone',
    useEmail: 'Use Email',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    login: 'Login',
    sending: 'Sending...',
    
    // OTP step
    verifyTitle: 'Enter Verification Code',
    verifyDesc: 'We sent a 6-digit code to',
    otpPlaceholder: '000000',
    verify: 'Verify & Sign In',
    verifying: 'Verifying...',
    resendCode: 'Resend Code',
    changeNumber: 'Change Number',
    
    // Messages
    codeSent: 'Verification code sent!',
    invalidOtp: 'Invalid code. Please try again.',
    networkError: 'Network error. Please try again.',
    
    // Footer
    noAccount: "Don't have an account?",
    signUp: 'Sign Up',
    backToHome: 'Back to Home',
  },
  fr: {
    welcomeBack: 'Bienvenue',
    loginDesc: 'Entrez votre numéro de téléphone ou votre email pour vous connecter',
    phoneNumber: 'Numéro de téléphone',
    phonePlaceholder: '+216 XX XXX XXX',
    email: 'Adresse Email',
    emailPlaceholder: 'votre@email.com',
    usePhone: 'Utiliser le téléphone',
    useEmail: 'Utiliser l\'email',
    password: 'Mot de passe',
    passwordPlaceholder: 'Entrez votre mot de passe',
    login: 'Connexion',
    sending: 'Envoi en cours...',
    
    // OTP step
    verifyTitle: 'Entrez le code de vérification',
    verifyDesc: 'Nous avons envoyé un code à 6 chiffres à',
    otpPlaceholder: '000000',
    verify: 'Vérifier et se connecter',
    verifying: 'Vérification...',
    resendCode: 'Renvoyer le code',
    changeNumber: 'Changer de numéro',
    
    // Messages
    codeSent: 'Code de vérification envoyé !',
    invalidOtp: 'Code invalide. Veuillez réessayer.',
    networkError: 'Erreur réseau. Veuillez réessayer.',
    
    // Footer
    noAccount: 'Vous n\'avez pas de compte ?',
    signUp: 'S\'inscrire',
    backToHome: 'Retour à l\'accueil',
  },
  'ar-TN': {
    welcomeBack: 'مرحباً بعودتك',
    loginDesc: 'أدخل رقم هاتفك أو بريدك الإلكتروني لتسجيل الدخول',
    phoneNumber: 'رقم الهاتف',
    phonePlaceholder: '+216 XX XXX XXX',
    email: 'البريد الإلكتروني',
    emailPlaceholder: 'بريدك@الإلكتروني.com',
    usePhone: 'استخدام الهاتف',
    useEmail: 'استخدام البريد الإلكتروني',
    password: 'كلمة المرور',
    passwordPlaceholder: 'أدخل كلمة المرور',
    login: 'تسجيل الدخول',
    sending: 'جاري الإرسال...',
    
    // OTP step
    verifyTitle: 'أدخل رمز التحقق',
    verifyDesc: 'لقد أرسلنا رمز مكون من 6 أرقام إلى',
    otpPlaceholder: '000000',
    verify: 'تحقق وتسجيل الدخول',
    verifying: 'جاري التحقق...',
    resendCode: 'إعادة إرسال الرمز',
    changeNumber: 'تغيير الرقم',
    
    // Messages
    codeSent: 'تم إرسال رمز التحقق!',
    invalidOtp: 'رمز غير صحيح. حاول مرة أخرى.',
    networkError: 'خطأ في الشبكة. حاول مرة أخرى.',
    
    // Footer
    noAccount: 'ليس لديك حساب؟',
    signUp: 'سجل',
    backToHome: 'العودة للرئيسية',
  },
};

function LoginPage() {
  const router = useRouter();
  const { locale, setLocale } = useC74Locale();
  const t = translations[locale];

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usePhone, setUsePhone] = useState(true); // Toggle between phone and email
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const identifier = usePhone ? phone : email;
    if (!identifier.trim()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          [usePhone ? 'phone' : 'email']: identifier, 
          password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const payload = data?.data;

        // Store pending auth data for verify step
        // For email login, we need to get the user's phone number from the API response
        const userPhone = usePhone ? phone : (payload?.phone || '');
        localStorage.setItem('pending_phone', userPhone);
        localStorage.setItem('pending_email', usePhone ? '' : email);
        localStorage.setItem('pending_role', payload?.role || 'customer');
        localStorage.setItem('pending_user_id', payload?.user_id || '');
        localStorage.setItem('pending_auth_action', 'login');
        localStorage.setItem('pending_password', password);
        localStorage.setItem('auth_token', payload?.temp_token); // Store temp JWT token

        setMessage({ type: 'success', text: t.codeSent });
        
        // Show debug OTP in development
        if (payload?.debug_otp) {
          console.log('Debug OTP:', payload.debug_otp);
        }

        router.push('/verify');
      } else {
        // Extract error message from structured API response
        const errorMsg = data.error?.message || data.error || t.networkError;
        setMessage({ type: 'error', text: typeof errorMsg === 'string' ? errorMsg : t.networkError });
      }
    } catch (error) {
      console.error('Send code error:', error);
      setMessage({ type: 'error', text: t.networkError });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-neutral-900 dark:to-neutral-800">
      {/* Header */}
      <div className="max-w-md mx-auto px-4 pt-4">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <ArrowLeft className="w-4 h-4 me-2 rtl:rotate-180" />
            {t.backToHome}
          </Link>
          <LanguageDropdown currentLocale={locale} onLocaleChange={setLocale} />
        </div>
      </div>

      <div className="flex items-center justify-center p-4 pt-12">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {t.welcomeBack}
              </CardTitle>
              <CardDescription>
                {t.loginDesc}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Message */}
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

              <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email/Phone Toggle */}
                  <div className="flex gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setUsePhone(true)}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        usePhone
                          ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                      }`}
                    >
                      <Phone className="w-4 h-4 inline mr-2" />
                      {t.usePhone}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsePhone(false)}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        !usePhone
                          ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                      }`}
                    >
                      <Mail className="w-4 h-4 inline mr-2" />
                      {t.useEmail}
                    </button>
                  </div>

                  {/* Phone Input */}
                  {usePhone ? (
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {t.phoneNumber}
                      </Label>
                      <PhoneInput
                        value={phone}
                        onChange={(fullPhone) => setPhone(fullPhone)}
                        locale={locale}
                        defaultCountry="TN"
                      />
                    </div>
                  ) : (
                    /* Email Input */
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {t.email}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder={t.emailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      {t.password}
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder={t.passwordPlaceholder}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={isLoading || !(usePhone ? phone.trim() : email.trim())}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin me-2" />
                        {t.sending}
                      </>
                    ) : (
                      t.login
                    )}
                  </Button>
              </form>

              {/* Sign up link */}
              <div className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
                {t.noAccount}{' '}
                <Link href="/signup" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  {t.signUp}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Export with HOC for automatic loading
export default withGlobalLoading(LoginPage, {
  minLoadingTime: 800,
  showSpinner: true
});
