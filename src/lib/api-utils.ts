import { NextRequest, NextResponse } from 'next/server';

// Supported locales for API responses
export type ApiLocale = 'en' | 'fr' | 'ar-TN';
export const DEFAULT_API_LOCALE: ApiLocale = 'ar-TN';

// Standard error codes per Specs
export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR';

// Error messages with translations
const ERROR_MESSAGES: Record<ErrorCode, Record<ApiLocale, string>> = {
  UNAUTHORIZED: {
    'en': 'You must be logged in',
    'fr': 'Vous devez être connecté',
    'ar-TN': 'يجب تسجيل الدخول',
  },
  FORBIDDEN: {
    'en': 'You do not have permission to perform this action',
    'fr': 'Vous n\'avez pas la permission d\'effectuer cette action',
    'ar-TN': 'ليس لديك صلاحية للقيام بهذا الإجراء',
  },
  NOT_FOUND: {
    'en': 'Resource not found',
    'fr': 'Ressource non trouvée',
    'ar-TN': 'المورد غير موجود',
  },
  VALIDATION_ERROR: {
    'en': 'Validation error',
    'fr': 'Erreur de validation',
    'ar-TN': 'خطأ في التحقق',
  },
  RATE_LIMIT_EXCEEDED: {
    'en': 'Too many requests. Please try again later',
    'fr': 'Trop de requêtes. Veuillez réessayer plus tard',
    'ar-TN': 'طلبات كثيرة جداً. يرجى المحاولة لاحقاً',
  },
  INTERNAL_ERROR: {
    'en': 'An internal error occurred',
    'fr': 'Une erreur interne s\'est produite',
    'ar-TN': 'حدث خطأ داخلي',
  },
};

// HTTP status codes for error types
const ERROR_STATUS_CODES: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  RATE_LIMIT_EXCEEDED: 429,
  INTERNAL_ERROR: 500,
};

/**
 * Extract locale from Accept-Language header
 */
export function getLocaleFromRequest(request: NextRequest): ApiLocale {
  const acceptLanguage = request.headers.get('accept-language') || '';
  
  if (acceptLanguage.includes('en')) return 'en';
  if (acceptLanguage.includes('fr')) return 'fr';
  return DEFAULT_API_LOCALE; // ar-TN
}

/**
 * Create message translations object
 */
function createMessageTranslations(
  messages: Record<ApiLocale, string>
): Record<ApiLocale, string> {
  return {
    'en': messages['en'],
    'fr': messages['fr'],
    'ar-TN': messages['ar-TN'],
  };
}

/**
 * Create standardized API error response per Specs
 */
export function apiError(
  code: ErrorCode,
  locale: ApiLocale = DEFAULT_API_LOCALE,
  options?: {
    message?: string;
    messageTranslations?: Record<ApiLocale, string>;
    field?: string;
  }
): NextResponse {
  const defaultMessages = ERROR_MESSAGES[code];
  const messageTranslations = options?.messageTranslations || defaultMessages;
  const message = options?.message || messageTranslations[locale];

  const errorBody: {
    error: {
      code: ErrorCode;
      message: string;
      message_translations: Record<ApiLocale, string>;
      field?: string;
    };
  } = {
    error: {
      code,
      message,
      message_translations: createMessageTranslations(messageTranslations),
    },
  };

  if (options?.field) {
    errorBody.error.field = options.field;
  }

  return NextResponse.json(errorBody, { status: ERROR_STATUS_CODES[code] });
}

/**
 * Create standardized API success response per Specs
 */
export function apiSuccess<T>(
  data: T,
  locale: ApiLocale = DEFAULT_API_LOCALE,
  options?: {
    message?: string;
    messageTranslations?: Record<ApiLocale, string>;
    status?: number;
  }
): NextResponse {
  const responseBody: {
    data: T;
    message?: string;
    message_translations?: Record<ApiLocale, string>;
  } = { data };

  if (options?.messageTranslations) {
    responseBody.message = options.message || options.messageTranslations[locale];
    responseBody.message_translations = createMessageTranslations(options.messageTranslations);
  } else if (options?.message) {
    responseBody.message = options.message;
  }

  return NextResponse.json(responseBody, { status: options?.status || 200 });
}

/**
 * Validation error helper with field-specific message
 */
export function validationError(
  locale: ApiLocale,
  field: string,
  messageTranslations: Record<ApiLocale, string>
): NextResponse {
  return apiError('VALIDATION_ERROR', locale, {
    messageTranslations,
    field,
  });
}

/**
 * Common validation messages
 */
export const VALIDATION_MESSAGES = {
  PHONE_REQUIRED: {
    'en': 'Phone number is required',
    'fr': 'Le numéro de téléphone est requis',
    'ar-TN': 'رقم الهاتف مطلوب',
  },
  PHONE_INVALID: {
    'en': 'Invalid phone number format. Use +216XXXXXXXX',
    'fr': 'Format de numéro invalide. Utilisez +216XXXXXXXX',
    'ar-TN': 'صيغة رقم الهاتف غير صحيحة. استخدم +216XXXXXXXX',
  },
  NAME_REQUIRED: {
    'en': 'Name is required',
    'fr': 'Le nom est requis',
    'ar-TN': 'الاسم مطلوب',
  },
  ROLE_INVALID: {
    'en': 'Invalid role. Must be customer or worker',
    'fr': 'Rôle invalide. Doit être client ou travailleur',
    'ar-TN': 'الدور غير صالح. يجب أن يكون عميل أو عامل',
  },
  CATEGORY_INVALID: {
    'en': 'Invalid category',
    'fr': 'Catégorie invalide',
    'ar-TN': 'الفئة غير صالحة',
  },
  MISSING_FIELDS: {
    'en': 'Missing required fields',
    'fr': 'Champs requis manquants',
    'ar-TN': 'حقول مطلوبة مفقودة',
  },
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  OTP_SENT: {
    'en': 'OTP sent to your phone',
    'fr': 'Code envoyé à votre téléphone',
    'ar-TN': 'تم إرسال الرمز إلى هاتفك',
  },
  JOB_CREATED: {
    'en': 'Job request created successfully',
    'fr': 'Demande de travail créée avec succès',
    'ar-TN': 'تم إنشاء الطلب بنجاح',
  },
  JOB_UPDATED: {
    'en': 'Job updated successfully',
    'fr': 'Travail mis à jour avec succès',
    'ar-TN': 'تم تحديث الطلب بنجاح',
  },
  PROFILE_UPDATED: {
    'en': 'Profile updated successfully',
    'fr': 'Profil mis à jour avec succès',
    'ar-TN': 'تم تحديث الملف الشخصي بنجاح',
  },
} as const;

/**
 * Category labels with translations
 */
export const CATEGORY_LABELS: Record<string, Record<ApiLocale, string>> = {
  plumbing: { 'en': 'Plumbing', 'fr': 'Plomberie', 'ar-TN': 'سباكة' },
  electrical: { 'en': 'Electrical', 'fr': 'Électricité', 'ar-TN': 'كهرباء' },
  ac: { 'en': 'AC & Heating', 'fr': 'Climatisation', 'ar-TN': 'تكييف' },
  cleaning: { 'en': 'Cleaning', 'fr': 'Nettoyage', 'ar-TN': 'تنظيف' },
};

/**
 * Status labels with translations
 */
export const STATUS_LABELS: Record<string, Record<ApiLocale, string>> = {
  requested: { 'en': 'Requested', 'fr': 'Demandé', 'ar-TN': 'مطلوب' },
  accepted: { 'en': 'Accepted', 'fr': 'Accepté', 'ar-TN': 'مقبول' },
  rejected: { 'en': 'Rejected', 'fr': 'Refusé', 'ar-TN': 'مرفوض' },
  in_progress: { 'en': 'In Progress', 'fr': 'En cours', 'ar-TN': 'قيد التنفيذ' },
  completed: { 'en': 'Completed', 'fr': 'Terminé', 'ar-TN': 'مكتمل' },
  cancelled: { 'en': 'Cancelled', 'fr': 'Annulé', 'ar-TN': 'ملغى' },
};
