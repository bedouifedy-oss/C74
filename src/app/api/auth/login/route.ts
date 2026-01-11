import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import {
  apiError,
  apiSuccess,
  getLocaleFromRequest,
  validationError,
  VALIDATION_MESSAGES,
  SUCCESS_MESSAGES,
} from '@/lib/api-utils';
import { getUserByPhone, getUserByEmail, createUser } from '@/lib/db';
import { isSupabaseReady } from '@/lib/supabase';
import { generateOTP, sendOTP, storeOTP } from '@/lib/sms';
import { generateAuthToken } from '@/lib/auth-session';

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  const locale = getLocaleFromRequest(request);

  try {
    const body = await request.json();
    const { phone, email, password } = body;

    if (!isSupabaseReady) {
      return apiError('INTERNAL_ERROR', locale, {
        messageTranslations: {
          en: 'Database not configured',
          fr: 'Base de données non configurée',
          'ar-TN': 'قاعدة البيانات غير مهيأة',
        },
      });
    }

    // Validate input - require phone OR email
    if (!phone && !email) {
      return validationError(locale, 'identifier', {
        en: 'Phone number or email is required',
        fr: 'Le numéro de téléphone ou l\'email est requis',
        'ar-TN': 'رقم الهاتف أو البريد الإلكتروني مطلوب',
      });
    }

    // Validate phone format if provided
    if (phone && !phone.match(/^\+\d{7,15}$/)) {
      return validationError(locale, 'phone', VALIDATION_MESSAGES.PHONE_INVALID);
    }

    // Validate email format if provided
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return validationError(locale, 'email', {
        en: 'Invalid email format',
        fr: 'Format d\'email invalide',
        'ar-TN': 'تنسيق البريد الإلكتروني غير صالح',
      });
    }

    // Password required
    if (!password) {
      return validationError(locale, 'password', {
        en: 'Password is required',
        fr: 'Le mot de passe est requis',
        'ar-TN': 'كلمة المرور مطلوبة',
      });
    }

    // Check if user exists
    let user;
    if (phone) {
      user = await getUserByPhone(phone);
    } else if (email) {
      user = await getUserByEmail(email);
    }

    if (!user) {
      return validationError(locale, 'identifier', {
        en: 'No account found. Please sign up first.',
        fr: 'Aucun compte trouvé. Veuillez d\'abord vous inscrire.',
        'ar-TN': 'لم يتم العثور على حساب. يرجى التسجيل أولاً.',
      });
    }

    // Verify password
    if (!user.password_hash) {
      return validationError(locale, 'password', {
        en: 'Password not set for this account. Please sign up again or contact support.',
        fr: 'Mot de passe non défini pour ce compte. Veuillez vous réinscrire ou contacter le support.',
        'ar-TN': 'كلمة المرور غير محددة لهذا الحساب. يرجى إعادة التسجيل أو الاتصال بالدعم.',
      });
    }

    const passwordHash = hashPassword(password);
    if (user.password_hash !== passwordHash) {
      return validationError(locale, 'password', {
        en: 'Incorrect password',
        fr: 'Mot de passe incorrect',
        'ar-TN': 'كلمة المرور غير صحيحة',
      });
    }

    // Generate and send OTP for verification (always send to user's phone)
    const phoneNumber = user.phone; // Use phone from user record
    const otp = generateOTP();
    storeOTP(phoneNumber, otp);
    await sendOTP(phoneNumber, otp, locale);

    // Generate temporary JWT token for login flow
    const tempToken = generateAuthToken({ 
      user_id: user.id, 
      role: user.role, 
      phone: user.phone,
      created_at: Date.now()
    });

    return apiSuccess(
      {
        user_id: user.id,
        role: user.role,
        phone: user.phone, // Include phone number for email login
        temp_token: tempToken, // Temporary JWT token
        otp_sent: true,
        debug_otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      },
      locale,
      {
        messageTranslations: {
          en: 'Verification code sent',
          fr: 'Code de vérification envoyé',
          'ar-TN': 'تم إرسال رمز التحقق',
        },
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    return apiError('INTERNAL_ERROR', locale);
  }
}
