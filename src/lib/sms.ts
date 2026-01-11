// SMS Service for OTP via Twilio
// In production, this sends real SMS. In development, it logs to console.

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

function getTwilioConfig(): TwilioConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return null;
  }

  return { accountSid, authToken, fromNumber };
}

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send SMS via Twilio
export async function sendSMS(to: string, message: string): Promise<SMSResult> {
  const config = getTwilioConfig();

  // Use mock SMS only if Twilio not configured
  if (!config) {
    console.log('=== SMS (Mock Mode - Twilio not configured) ===');
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log('===============================================');
    
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
    };
  }

  console.log(`[Twilio] Sending real SMS to ${to}...`);

  // Production - send via Twilio
  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: config.fromNumber,
        Body: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Twilio error:', data);
      return {
        success: false,
        error: data.message || 'Failed to send SMS',
      };
    }

    return {
      success: true,
      messageId: data.sid,
    };
  } catch (error) {
    console.error('SMS send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Send OTP SMS with localized message
export async function sendOTP(phone: string, otp: string, locale: string = 'en'): Promise<SMSResult> {
  const messages: Record<string, string> = {
    en: `Your C74 verification code is: ${otp}. Valid for 5 minutes.`,
    fr: `Votre code de vérification C74 est: ${otp}. Valide pendant 5 minutes.`,
    'ar-TN': `رمز التحقق الخاص بك في C74 هو: ${otp}. صالح لمدة 5 دقائق.`,
  };

  const message = messages[locale] || messages.en;
  return sendSMS(phone, message);
}

// Store OTP in memory (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number }>();

export function storeOTP(phone: string, otp: string, expiresInMinutes: number = 5): void {
  otpStore.set(phone, {
    otp,
    expires: Date.now() + expiresInMinutes * 60 * 1000,
  });
}

export function verifyOTP(phone: string, otp: string): boolean {
  const stored = otpStore.get(phone);
  
  if (!stored) {
    return false;
  }

  if (Date.now() > stored.expires) {
    otpStore.delete(phone);
    return false;
  }

  if (stored.otp !== otp) {
    return false;
  }

  // OTP verified - remove from store
  otpStore.delete(phone);
  return true;
}

// Clean up expired OTPs periodically
export function cleanupExpiredOTPs(): void {
  const now = Date.now();
  otpStore.forEach((data, phone) => {
    if (now > data.expires) {
      otpStore.delete(phone);
    }
  });
}
