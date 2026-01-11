import { NextRequest } from 'next/server';
import {
  apiError,
  apiSuccess,
  getLocaleFromRequest,
  validationError,
  VALIDATION_MESSAGES,
  SUCCESS_MESSAGES,
} from '@/lib/api-utils';
import { getUserByPhone } from '@/lib/db';
import { isSupabaseReady } from '@/lib/supabase';
import { generateOTP, sendOTP, storeOTP } from '@/lib/sms';

export async function POST(request: NextRequest) {
  const locale = getLocaleFromRequest(request);

  try {
    const body = await request.json();
    const { phone } = body;

    if (!isSupabaseReady) {
      return apiError('INTERNAL_ERROR', locale, {
        messageTranslations: {
          en: 'Database not configured',
          fr: 'Base de données non configurée',
          'ar-TN': 'قاعدة البيانات غير مهيأة',
        },
      });
    }

    if (!phone) {
      return validationError(locale, 'phone', VALIDATION_MESSAGES.PHONE_REQUIRED);
    }

    // Validate phone format (international - starts with + and has 7-15 digits)
    if (!phone.match(/^\+\d{7,15}$/)) {
      return validationError(locale, 'phone', VALIDATION_MESSAGES.PHONE_INVALID);
    }

    // Must be an existing user
    const user = await getUserByPhone(phone);
    if (!user) {
      return validationError(locale, 'phone', {
        en: 'No account found with this phone number. Please sign up first.',
        fr: 'Aucun compte trouvé avec ce numéro. Veuillez d\'abord vous inscrire.',
        'ar-TN': 'لم يتم العثور على حساب بهذا الرقم. يرجى التسجيل أولاً.',
      });
    }

    const otp = generateOTP();
    storeOTP(phone, otp);
    await sendOTP(phone, otp, locale);

    return apiSuccess(
      {
        otp_sent: true,
        debug_otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      },
      locale,
      { messageTranslations: SUCCESS_MESSAGES.OTP_SENT }
    );
  } catch (error) {
    console.error('Resend OTP error:', error);
    return apiError('INTERNAL_ERROR', locale);
  }
}
