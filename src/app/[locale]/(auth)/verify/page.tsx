'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Smartphone, RefreshCw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Link, useRouter } from '@/lib/i18n';
import { LanguageDropdown } from '@/components/LanguageDropdown';
import { useLocale as useC74Locale } from '@/hooks/useLocale';
import type { Locale } from '@/i18n-routing';

const pageTranslations = {
  en: {
    verifyPhone: 'Verify Your Phone',
    codeSent: "We've sent a 6-digit code to your phone number",
    enterCode: 'Enter Verification Code',
    verifying: 'Verifying...',
    verifyButton: 'Verify Phone Number',
    didntReceive: "Didn't receive the code?",
    resendCode: 'Resend Code',
    resendIn: 'Resend in',
    havingTrouble: 'Having trouble?',
    contactSupport: 'Contact Support',
    backToSignup: 'Back to Sign Up',
    enter6Digits: 'Please enter all 6 digits',
    verificationFailed: 'Verification failed',
    networkError: 'Network error. Please try again.',
    codeSentAlert: 'Verification code sent!',
  },
  fr: {
    verifyPhone: 'Vérifiez votre téléphone',
    codeSent: 'Nous avons envoyé un code à 6 chiffres sur votre téléphone',
    enterCode: 'Entrez le code de vérification',
    verifying: 'Vérification...',
    verifyButton: 'Vérifier le numéro',
    didntReceive: "Vous n'avez pas reçu le code ?",
    resendCode: 'Renvoyer le code',
    resendIn: 'Renvoyer dans',
    havingTrouble: 'Des problèmes ?',
    contactSupport: 'Contacter le support',
    backToSignup: "Retour à l'inscription",
    enter6Digits: 'Veuillez entrer les 6 chiffres',
    verificationFailed: 'Échec de la vérification',
    networkError: 'Erreur réseau. Veuillez réessayer.',
    codeSentAlert: 'Code de vérification envoyé !',
  },
  'ar-TN': {
    verifyPhone: 'تأكيد رقم الهاتف',
    codeSent: 'أرسلنا رمزاً من 6 أرقام إلى هاتفك',
    enterCode: 'أدخل رمز التحقق',
    verifying: 'جاري التحقق...',
    verifyButton: 'تأكيد رقم الهاتف',
    didntReceive: 'لم تستلم الرمز؟',
    resendCode: 'إعادة إرسال الرمز',
    resendIn: 'إعادة الإرسال بعد',
    havingTrouble: 'تواجه مشكلة؟',
    contactSupport: 'تواصل مع الدعم',
    backToSignup: 'العودة للتسجيل',
    enter6Digits: 'يرجى إدخال الأرقام الستة',
    verificationFailed: 'فشل التحقق',
    networkError: 'خطأ في الشبكة. حاول مرة أخرى.',
    codeSentAlert: 'تم إرسال رمز التحقق!',
  },
};

export default function VerifyOTPPage() {
  const router = useRouter();
  const { locale, setLocale } = useC74Locale();
  const t = pageTranslations[locale as Locale];
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [backHref, setBackHref] = useState('/signup'); // Default to signup for SSR

  // Check localStorage on client side only
  useEffect(() => {
    const authAction = localStorage.getItem('pending_auth_action');
    setBackHref(authAction === 'login' ? '/login' : '/signup');
  }, []);

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = pastedData.split('').map(char => /\d/.test(char) ? char : '');
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    setMessage(null);
    
    if (otpValue.length !== 6) {
      setMessage({ type: 'error', text: t.enter6Digits });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get stored phone number from signup OR login flow
      const storedPhone = localStorage.getItem('pending_phone') || localStorage.getItem('verification_phone');
      
      if (!storedPhone) {
        setMessage({ type: 'error', text: 'No phone number found. Please log in first.' });
        router.push('/login');
        return;
      }
      
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: storedPhone,
          otp: otpValue
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const payload = result?.data;
        console.log('OTP verification successful:', payload);
        
        // Get role from pending data or from result
        const pendingRole = localStorage.getItem('pending_role');
        const userRole = payload?.user?.role || pendingRole;
        
        // Validate role exists
        if (!userRole || !['customer', 'worker', 'admin'].includes(userRole)) {
          console.error('❌ Invalid role detected:', userRole);
          setMessage({ type: 'error', text: 'Invalid user role. Please try again.' });
          setIsLoading(false);
          return;
        }
        
        // Store JWT auth token and user data with correct role
        localStorage.setItem('auth_token', payload?.token);
        localStorage.setItem('user_data', JSON.stringify({ ...payload?.user, role: userRole }));

        // JWT tokens are stateless - no server-side registration needed

        setMessage({ type: 'success', text: t.codeSentAlert });
        
        // Clear pending data
        localStorage.removeItem('pending_user_id');
        localStorage.removeItem('pending_phone');
        localStorage.removeItem('pending_role');
        localStorage.removeItem('pending_auth_action');
        localStorage.removeItem('pending_password');
        
        // Smart redirect based on user role and onboarding status
        if (userRole === 'worker') {
          // Check if worker has completed onboarding
          const worker = payload?.user;
          if (!worker.onboarding_completed) {
            router.push('/worker/onboarding'); // New worker needs onboarding
          } else {
            router.push('/worker/dashboard'); // Existing worker
          }
        } else {
          router.push('/customer/dashboard'); // Customer always goes to dashboard
        }
      } else {
        const errorMsg = result?.error?.message || result?.error || t.verificationFailed;
        setMessage({ type: 'error', text: typeof errorMsg === 'string' ? errorMsg : t.verificationFailed });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setMessage({ type: 'error', text: t.networkError });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResend = async () => {
    setMessage(null);
    setIsLoading(true);

    try {
      const storedPhone = localStorage.getItem('pending_phone') || localStorage.getItem('verification_phone');
      if (!storedPhone) {
        setMessage({ type: 'error', text: 'No phone number found. Please log in first.' });
        router.push('/login');
        return;
      }

      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: storedPhone }),
      });

      const result = await response.json();
      if (response.ok) {
        const payload = result?.data;
        if (payload?.debug_otp) {
          console.log('Debug OTP:', payload.debug_otp);
        }
        setTimeLeft(60);
        setCanResend(false);
        setMessage({ type: 'success', text: t.codeSentAlert });
      } else {
        const errorMsg = result?.error?.message || result?.error || t.networkError;
        setMessage({ type: 'error', text: typeof errorMsg === 'string' ? errorMsg : t.networkError });
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setMessage({ type: 'error', text: t.networkError });
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-neutral-900 dark:to-neutral-800">
      {/* Header with Language Dropdown */}
      <div className="max-w-md mx-auto px-4 pt-4">
        <div className="flex items-center justify-between">
          <Link
            href={backHref}
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <ArrowLeft className="w-4 h-4 me-2 rtl:rotate-180" />
            {t.backToSignup}
          </Link>
          <LanguageDropdown currentLocale={locale} onLocaleChange={setLocale} />
        </div>
      </div>

      <div className="flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-md">
          {/* OTP Verification Card */}
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {t.verifyPhone}
              </CardTitle>
              <CardDescription>
                {t.codeSent}
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* OTP Input */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {t.enterCode}
                  </Label>
                  <div className="flex justify-center gap-3" dir="ltr">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-12 h-12 text-center text-lg font-semibold border-neutral-300 focus:border-emerald-500 focus:ring-emerald-500 otp-input"
                        required
                      />
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  size="lg"
                  disabled={isLoading || otp.join('').length !== 6}
                >
                  {isLoading ? (
                    <span className="inline-flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin me-2" />
                      {t.verifying}
                    </span>
                  ) : t.verifyButton}
                </Button>

                {/* Resend Code */}
                <div className="text-center">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    {t.didntReceive}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    disabled={!canResend || isLoading}
                    className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900"
                  >
                    <RefreshCw className={`w-4 h-4 me-2`} />
                    {canResend ? t.resendCode : `${t.resendIn} ${timeLeft}s`}
                  </Button>
                </div>

                {/* Help Text */}
                <div className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                  <p>
                    {t.havingTrouble}{' '}
                    <Link href="/help" className="text-emerald-600 hover:underline">
                      {t.contactSupport}
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
