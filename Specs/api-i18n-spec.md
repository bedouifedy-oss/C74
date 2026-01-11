# 📡 Fixy.tn API with i18n Support

## General i18n Rules

### Request Headers

All API requests should include:

```
Accept-Language: ar-TN | en | fr
```

If not provided, defaults to `ar-TN` (Tunisian Arabic).

### Response Format

All API responses include localized messages based on the `Accept-Language` header.

**Success response:**
```json
{
  "data": { ... },
  "message": "تم إنشاء الطلب بنجاح",
  "message_translations": {
    "en": "Job request created successfully",
    "fr": "Demande de travail créée avec succès",
    "ar-TN": "تم إنشاء الطلب بنجاح"
  }
}
```

**Error response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "رقم الهاتف غير صحيح",
    "message_translations": {
      "en": "Invalid phone number",
      "fr": "Numéro de téléphone invalide",
      "ar-TN": "رقم الهاتف غير صحيح"
    },
    "field": "phone"
  }
}
```

---

## Database Updates for i18n

### User Preferences

Update `users` table:

```sql
ALTER TABLE users 
ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'ar-TN';
```

Supported values: `'en'`, `'fr'`, `'ar-TN'`

---

## Modified Endpoints

### POST `/api/auth/signup`

**Request:**
```json
{
  "phone": "+216XXXXXXXX",
  "name": "string",
  "email": "string (optional)",
  "role": "customer | worker",
  "preferred_language": "ar-TN | en | fr"  // NEW
}
```

**Response:**
```json
{
  "user_id": "uuid",
  "otp_sent": true,
  "message": "تم إرسال الرمز إلى هاتفك",
  "message_translations": {
    "en": "OTP sent to your phone",
    "fr": "Code envoyé à votre téléphone",
    "ar-TN": "تم إرسال الرمز إلى هاتفك"
  }
}
```

---

### GET `/api/jobs/:id`

Returns job with localized status labels:

**Response:**
```json
{
  "id": "uuid",
  "category": "plumbing",
  "category_label": "سباكة",  // Localized based on Accept-Language
  "status": "accepted",
  "status_label": "مقبول",    // Localized status
  "description": "string",
  // ... other fields
}
```

---

### POST `/api/jobs/:id/messages`

**Request:**
```json
{
  "message_text": "string",
  "language": "ar-TN"  // Language of the message content
}
```

Messages are stored with their original language. The UI can optionally offer translation.

---

### GET `/api/notifications`

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "job_update",
      "title": "تم قبول عملك",  // Localized based on user's preferred_language
      "message": "قبل العامل طلب العمل الخاص بك",
      "action_url": "/jobs/uuid",
      "read": false,
      "created_at": "timestamp"
    }
  ],
  "unread_count": 3
}
```

---

## SMS/Push Notifications with i18n

### SMS Templates

SMS messages should be sent in the user's `preferred_language`:

**Job Accepted (Arabic):**
```
Fixy.tn: تم قبول طلبك من قبل العامل. اضغط للتفاصيل: https://fixy.tn/ar-TN/jobs/xxx
```

**Job Accepted (French):**
```
Fixy.tn: Votre demande a été acceptée par le prestataire. Détails: https://fixy.tn/fr/jobs/xxx
```

**Job Accepted (English):**
```
Fixy.tn: Your job has been accepted by the worker. View details: https://fixy.tn/en/jobs/xxx
```

### Implementation

```typescript
// api/notifications/send-sms.ts

import { Locale } from '@/i18n';

interface SMSTemplate {
  en: string;
  fr: string;
  'ar-TN': string;
}

const templates: Record<string, SMSTemplate> = {
  job_accepted: {
    en: 'Fixy.tn: Your job has been accepted. View: {url}',
    fr: 'Fixy.tn: Votre demande a été acceptée. Voir: {url}',
    'ar-TN': 'Fixy.tn: تم قبول طلبك. اضغط: {url}',
  },
  payment_reminder: {
    en: 'Fixy.tn: Payment due in {days} days. Amount: {amount} TND',
    fr: 'Fixy.tn: Paiement dû dans {days} jours. Montant: {amount} TND',
    'ar-TN': 'Fixy.tn: الدفع مستحق خلال {days} أيام. المبلغ: {amount} دينار',
  },
};

export async function sendSMS(
  phone: string,
  templateKey: string,
  locale: Locale,
  variables: Record<string, string>
) {
  let message = templates[templateKey][locale];
  
  // Replace variables
  Object.entries(variables).forEach(([key, value]) => {
    message = message.replace(`{${key}}`, value);
  });
  
  // Send via SMS provider (Twilio, etc.)
  await twilioClient.messages.create({
    to: phone,
    from: TWILIO_NUMBER,
    body: message,
  });
}
```

---

## Email Templates with i18n

### Email Subject Lines

Store email subjects in translation files:

**messages/en.json:**
```json
{
  "emails": {
    "jobAccepted": {
      "subject": "Your job has been accepted",
      "body": "Good news! A worker has accepted your job request..."
    },
    "weeklyInvoice": {
      "subject": "Weekly Invoice #{number}",
      "body": "Your invoice for the week..."
    }
  }
}
```

---

## Date/Time Formatting

### In API Responses

Return timestamps in ISO 8601 format. Let the client format based on locale:

```json
{
  "created_at": "2025-01-15T14:30:00Z"
}
```

### Client-Side Formatting

```typescript
// Client formats based on locale
const date = new Date(job.created_at);

// English: "January 15, 2025"
// French: "15 janvier 2025"
// Arabic: "١٥ يناير ٢٠٢٥"
const formatted = new Intl.DateTimeFormat(locale, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}).format(date);
```

---

## Number/Currency Formatting

### API Returns Raw Numbers

```json
{
  "price_agreed": 50.00,
  "rating_avg": 4.5
}
```

### Client Formats Based on Locale

```typescript
// Price formatting
const price = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: 'TND',
}).format(job.price_agreed);

// English: "TND 50.00"
// French: "50,00 TND"
// Arabic: "٥٠٫٠٠ د.ت"
```

---

## Admin Panel Endpoints

### GET `/api/admin/translations`

Allows admins to view and edit system messages:

**Response:**
```json
{
  "translations": [
    {
      "key": "jobs.status.completed",
      "en": "Completed",
      "fr": "Terminée",
      "ar-TN": "مكتمل"
    }
  ]
}
```

### PATCH `/api/admin/translations/:key`

Update a translation:

**Request:**
```json
{
  "ar-TN": "مكتمل بنجاح"
}
```

---

## Content Moderation with i18n

### Flagging Reviews

When users flag reviews, they should specify the language:

**POST `/api/reviews/:id/flag`**

```json
{
  "reason": "inappropriate",
  "language": "ar-TN"  // Language of the review content
}
```

This helps admins who speak different languages moderate content appropriately.

---

## Search with i18n

### GET `/api/workers/search`

**Query params:**
- `category`: plumbing | electrical | AC | cleaning
- `query`: search term (can be in any language)
- `language`: preferred response language

The API should:
1. Search across all languages
2. Return results with labels in the requested language

**Response:**
```json
{
  "workers": [
    {
      "id": "uuid",
      "name": "Ahmed Ben Ali",
      "category": "plumbing",
      "category_label": "سباكة",  // Based on Accept-Language header
      "rating_avg": 4.5,
      "bio": "خبرة 10 سنوات...",  // Original language stored in DB
      "bio_language": "ar-TN"
    }
  ]
}
```

---

## Error Code Standards

All error codes are language-independent:

```typescript
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PHONE_INVALID = 'PHONE_INVALID',
  OTP_INVALID = 'OTP_INVALID',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
```

Error messages are translated based on `Accept-Language`.

---

## URL Structure with Locales

All web pages include locale prefix:

```
https://fixy.tn/en/jobs/123
https://fixy.tn/fr/jobs/123
https://fixy.tn/ar-TN/jobs/123
```

API endpoints do NOT include locale prefix:

```
https://fixy.tn/api/jobs/123  ✅
https://fixy.tn/api/en/jobs/123  ❌ (wrong)
```

---

## Mobile App Considerations

### Device Language Detection

When mobile app starts:

1. Detect device language
2. If supported (`en`, `fr`, `ar-TN`), use it
3. If not supported, default to `ar-TN`
4. Allow user to override in settings

### Language Switching

When user changes language in app:

```typescript
// Update user preference
await fetch('/api/users/me', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': newLocale,
  },
  body: JSON.stringify({
    preferred_language: newLocale,
  }),
});

// Reload app with new language
```

---

## Testing i18n

### Test Checklist

For each feature, test in all 3 languages:

- [ ] All text displays correctly
- [ ] RTL layout works (Arabic)
- [ ] Date/time formats correctly
- [ ] Currency formats correctly
- [ ] Forms accept input in all languages
- [ ] Error messages are localized
- [ ] SMS/emails are localized
- [ ] Navigation works in all directions

### Automated Testing

```typescript
describe('Job Creation (i18n)', () => {
  test.each(['en', 'fr', 'ar-TN'])('creates job in %s', async (locale) => {
    const response = await request(app)
      .post('/api/jobs')
      .set('Accept-Language', locale)
      .send(jobData);
    
    expect(response.status).toBe(201);
    expect(response.body.message).toBeDefined();
    expect(response.body.message_translations[locale]).toBeDefined();
  });
});
```

---

## Performance Considerations

### Translation Caching

Cache translation files in memory:

```typescript
// lib/translations-cache.ts
const translationsCache = new Map();

export async function getTranslations(locale: Locale) {
  if (!translationsCache.has(locale)) {
    const translations = await import(`@/messages/${locale}.json`);
    translationsCache.set(locale, translations.default);
  }
  return translationsCache.get(locale);
}
```

### Lazy Loading

Load translations on demand for admin panel:

```typescript
// Only load when needed
const adminTranslations = await import(`@/messages/admin/${locale}.json`);
```

---

## Future Enhancements

### Machine Translation (Phase 2)

Add automatic translation for user-generated content:

```typescript
// Translate worker bio on-the-fly if requested language differs from original
if (worker.bio_language !== requestedLocale) {
  worker.bio_translated = await translateText(
    worker.bio,
    worker.bio_language,
    requestedLocale
  );
}
```

### Voice Support (Phase 3)

Add voice input/output in Arabic for accessibility.

---

**This specification ensures your API is fully i18n-ready from day one.**