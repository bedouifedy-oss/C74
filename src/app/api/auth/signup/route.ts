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
    const { phone, name, email, role, password } = body;

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Validate input
    if (!phone) {
      return validationError(locale, 'phone', VALIDATION_MESSAGES.PHONE_REQUIRED);
    }
    if (!name) {
      return validationError(locale, 'name', VALIDATION_MESSAGES.NAME_REQUIRED);
    }
    if (!role) {
      return validationError(locale, 'role', VALIDATION_MESSAGES.ROLE_INVALID);
    }

    // Validate phone format (international - starts with + and has 7-15 digits)
    if (!phone.match(/^\+\d{7,15}$/)) {
      return validationError(locale, 'phone', VALIDATION_MESSAGES.PHONE_INVALID);
    }

    // Validate role
    if (!['customer', 'worker'].includes(role)) {
      return validationError(locale, 'role', VALIDATION_MESSAGES.ROLE_INVALID);
    }

    // Validate password for new signups
    if (!password) {
      return validationError(locale, 'password', {
        en: 'Password is required',
        fr: 'Le mot de passe est requis',
        'ar-TN': 'كلمة المرور مطلوبة',
      });
    }
    if (password.length < 6) {
      return validationError(locale, 'password', { 
        en: 'Password must be at least 6 characters',
        fr: 'Le mot de passe doit contenir au moins 6 caractères',
        'ar-TN': 'يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل'
      });
    }

    // Hash password if provided
    const passwordHash = password ? hashPassword(password) : null;

    if (email && typeof email === 'string' && email.trim()) {
      const existingByEmail = await getUserByEmail(email.trim());
      if (existingByEmail) {
        return validationError(locale, 'email', {
          en: 'An account with this email already exists. Please log in instead.',
          fr: 'Un compte avec cet email existe déjà. Veuillez vous connecter.',
          'ar-TN': 'يوجد حساب بهذا البريد الإلكتروني بالفعل. يرجى تسجيل الدخول.',
        });
      }
    }

    // Check if user already exists in database
    const existingUser = await getUserByPhone(phone);
    if (existingUser) {
      // User exists - tell them to login instead
      return validationError(locale, 'phone', {
        en: 'An account with this phone number already exists. Please log in instead.',
        fr: 'Un compte avec ce numéro existe déjà. Veuillez vous connecter.',
        'ar-TN': 'يوجد حساب بهذا الرقم بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.',
      });
    }

    // Create new user
    let userId: string;
    try {
      const newUser = await createUser({
        phone,
        name,
        email,
        role: role as 'customer' | 'worker',
        password_hash: passwordHash,
      });
      userId = newUser.id;
    } catch (err) {
      console.error('Create user failed while Supabase is configured:', err);
      return apiError('INTERNAL_ERROR', locale, {
        messageTranslations: {
          en: 'Database error while creating your account. Please contact support.',
          fr: 'Erreur base de données lors de la création de votre compte. Veuillez contacter le support.',
          'ar-TN': 'خطأ في قاعدة البيانات أثناء إنشاء حسابك. يرجى الاتصال بالدعم.',
        },
      });
    }

    // Generate and send OTP
    const otp = generateOTP();
    storeOTP(phone, otp);
    await sendOTP(phone, otp, locale);

    // Generate JWT token for authentication
    const token = generateAuthToken({ 
      user_id: userId, 
      role: role as 'customer' | 'worker', 
      phone: phone,
      created_at: Date.now()
    });

    return apiSuccess(
      {
        user_id: userId,
        role,
        token, // JWT token
        otp_sent: true,
        debug_otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      },
      locale,
      { messageTranslations: SUCCESS_MESSAGES.OTP_SENT }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return apiError('INTERNAL_ERROR', locale);
  }
}
