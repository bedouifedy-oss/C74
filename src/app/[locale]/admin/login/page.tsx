'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Phone, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from '@/lib/i18n';
import { useLocale as useC74Locale } from '@/hooks/useLocale';
import type { Locale } from '@/i18n-routing';

const translations = {
  en: {
    title: 'Admin Login',
    subtitle: 'Sign in to access the admin dashboard',
    phone: 'Phone Number',
    phonePlaceholder: '+216XXXXXXXX',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    login: 'Sign In',
    loggingIn: 'Signing in...',
    invalidCredentials: 'Invalid phone or password',
    networkError: 'Network error. Please try again.',
  },
  fr: {
    title: 'Connexion Admin',
    subtitle: 'Connectez-vous pour accéder au tableau de bord admin',
    phone: 'Numéro de téléphone',
    phonePlaceholder: '+216XXXXXXXX',
    password: 'Mot de passe',
    passwordPlaceholder: 'Entrez votre mot de passe',
    login: 'Se connecter',
    loggingIn: 'Connexion...',
    invalidCredentials: 'Numéro ou mot de passe invalide',
    networkError: 'Erreur réseau. Veuillez réessayer.',
  },
  'ar-TN': {
    title: 'تسجيل دخول المسؤول',
    subtitle: 'سجل دخولك للوصول إلى لوحة تحكم المسؤول',
    phone: 'رقم الهاتف',
    phonePlaceholder: '+216XXXXXXXX',
    password: 'كلمة المرور',
    passwordPlaceholder: 'أدخل كلمة المرور',
    login: 'تسجيل الدخول',
    loggingIn: 'جاري تسجيل الدخول...',
    invalidCredentials: 'رقم هاتف أو كلمة مرور غير صحيحة',
    networkError: 'خطأ في الشبكة. حاول مرة أخرى.',
  },
};

export default function AdminLoginPage() {
  const router = useRouter();
  const { locale } = useC74Locale();
  const t = translations[locale as Locale];

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const result = await response.json();

      if (response.ok) {
        // Store admin auth data
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user_data', JSON.stringify({
          id: result.admin.id,
          phone: result.admin.phone,
          name: result.admin.name,
          role: 'admin',
        }));

        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        setError(result.error || t.invalidCredentials);
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(t.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl bg-neutral-800 border-neutral-700">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {t.title}
          </CardTitle>
          <CardDescription className="text-neutral-400">
            {t.subtitle}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-900/30 border border-red-700 flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-neutral-300 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {t.phone}
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder={t.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-300 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {t.password}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin me-2" />
                  {t.loggingIn}
                </>
              ) : (
                t.login
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
