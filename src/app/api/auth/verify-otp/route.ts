import { NextRequest } from 'next/server';
import { apiError, apiSuccess, getLocaleFromRequest } from '@/lib/api-utils';
import { verifyOTP } from '@/lib/sms';
import { getUserByPhone, verifyUserPhone } from '@/lib/db';
import { storeAuthSession } from '@/lib/auth-session';
import { isSupabaseReady } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const locale = getLocaleFromRequest(request);

  try {
    const body = await request.json();
    const { phone, otp, role } = body;

    if (!isSupabaseReady) {
      return apiError('INTERNAL_ERROR', locale, {
        messageTranslations: {
          en: 'Database not configured',
          fr: 'Base de données non configurée',
          'ar-TN': 'قاعدة البيانات غير مهيأة',
        },
      });
    }

    // Validate required fields
    if (!phone || !otp) {
      return apiError('VALIDATION_ERROR', locale, { message: 'Phone and OTP are required' });
    }

    // Validate phone format (international - starts with + and has 7-15 digits)
    if (!phone.match(/^\+\d{7,15}$/)) {
      return apiError('VALIDATION_ERROR', locale, { message: 'Invalid phone number format' });
    }

    // Validate OTP format (6 digits)
    if (!otp.match(/^\d{6}$/)) {
      return apiError('VALIDATION_ERROR', locale, { message: 'Invalid OTP format. Must be 6 digits' });
    }

    // Verify OTP
    const isValid = verifyOTP(phone, otp);

    if (!isValid) {
      return apiError('VALIDATION_ERROR', locale, { message: 'Invalid or expired OTP' });
    }

    // Get user from database
    const user = await getUserByPhone(phone);
    if (user) {
      // Mark phone as verified
      await verifyUserPhone(user.id);
    }

    if (!user) {
      return apiError('VALIDATION_ERROR', locale, { 
        message: 'No account found. Please sign up first.' 
      });
    }

    // Generate JWT token (in production, use proper JWT library like jose)
    const token = `jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    storeAuthSession(token, {
      user_id: user.id,
      role: user.role || role || 'customer',
      phone: user.phone || phone,
    });

    // Return complete user data
    return apiSuccess({
      token,
      user: {
        id: user.id,
        phone: user.phone || phone,
        name: user.name || '',
        email: user.email || '',
        role: user.role || role || 'customer',
        phone_verified: true,
        created_at: user.created_at || new Date().toISOString(),
      },
    }, locale);

  } catch (error) {
    console.error('OTP verification error:', error);
    return apiError('INTERNAL_ERROR', locale);
  }
}
