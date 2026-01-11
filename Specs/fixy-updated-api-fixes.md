# 📡 Fixy.tn Updated API Endpoints (With Critical Fixes)

## New/Modified Endpoints

---

## **FIX #1: Payment Proof Submission**

### POST `/api/fees/:id/submit-payment`
**Submit payment proof for fee invoice**

**Request (multipart/form-data):**
```json
{
  "payment_method": "d17 | flouci | wire | mandat | swared",
  "payment_reference": "TXN123456789",
  "payment_proof": "file (image/jpeg or image/png)",
  "payment_notes": "Paid via D17 mobile app" 
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment proof submitted successfully",
  "message_translations": {
    "ar-TN": "تم إرسال إثبات الدفع بنجاح",
    "fr": "Preuve de paiement soumise avec succès",
    "en": "Payment proof submitted successfully"
  },
  "fee": {
    "id": "uuid",
    "status": "pending_verification",
    "payment_proof_url": "https://storage.url/proof.jpg",
    "payment_reference": "TXN123456789",
    "submitted_at": "2025-01-15T10:30:00Z"
  }
}
```

---

### PATCH `/api/admin/fees/:id/verify-payment`
**Admin verifies payment proof**

**Request:**
```json
{
  "verified": true,
  "admin_notes": "Payment confirmed with D17"
}
```

**Response:**
```json
{
  "success": true,
  "fee": {
    "id": "uuid",
    "status": "paid",
    "verified_by": "admin_uuid",
    "verified_at": "2025-01-15T11:00:00Z"
  },
  "worker_status": {
    "account_status": "active",
    "suspension_removed": true
  }
}
```

---

### GET `/api/fees/my-invoices`
**Worker views their fee history**

**Response:**
```json
{
  "invoices": [
    {
      "id": "uuid",
      "period_start": "2025-01-01",
      "period_end": "2025-01-07",
      "jobs_count": 5,
      "amount_due": 25.00,
      "status": "unpaid",
      "days_until_suspension": 23,
      "payment_proof_url": null,
      "reminder_sent_at": "2025-01-08T09:00:00Z",
      "warning_sent_at": null,
      "due_date": "2025-01-31"
    }
  ],
  "total_outstanding": 25.00,
  "account_status": "active"
}
```

---

## **FIX #2: Negotiation Limit**

### POST `/api/jobs/:id/propose-price`
**Propose or counter-offer price (with limit check)**

**Request:**
```json
{
  "amount": 50.00,
  "notes": "Includes parts and labor"
}
```

**Response (Success):**
```json
{
  "negotiation_id": "uuid",
  "negotiation_count": 2,
  "max_negotiations": 3,
  "remaining_negotiations": 1,
  "message": "Price proposed successfully",
  "message_translations": {
    "ar-TN": "تم اقتراح السعر بنجاح",
    "fr": "Prix proposé avec succès",
    "en": "Price proposed successfully"
  },
  "tip": {
    "ar-TN": "معظم العمال يقبلون خلال عرضين. هل هذا عرضك النهائي؟",
    "fr": "La plupart acceptent dans 2 contre-offres. Offre finale?",
    "en": "Most workers accept within 2 counter-offers. Final offer?"
  }
}
```

**Response (Limit Reached - 400 Error):**
```json
{
  "error": {
    "code": "NEGOTIATION_LIMIT_REACHED",
    "message": "Maximum negotiations reached",
    "message_translations": {
      "ar-TN": "وصلت للحد الأقصى من المفاوضات",
      "fr": "Nombre maximum de négociations atteint",
      "en": "Maximum negotiations reached"
    },
    "details": {
      "negotiation_count": 3,
      "max_negotiations": 3,
      "current_offer": 45.00,
      "actions_available": [
        "accept_current_offer",
        "cancel_job"
      ]
    }
  }
}
```

---

### GET `/api/jobs/:id/negotiation-status`
**Check negotiation status**

**Response:**
```json
{
  "job_id": "uuid",
  "negotiation_count": 2,
  "max_negotiations": 3,
  "can_negotiate": true,
  "last_offer": {
    "amount": 45.00,
    "proposed_by": "worker",
    "proposed_at": "2025-01-15T10:30:00Z"
  },
  "history": [
    {
      "amount": 50.00,
      "proposed_by": "worker",
      "timestamp": "2025-01-15T10:00:00Z"
    },
    {
      "amount": 40.00,
      "proposed_by": "customer",
      "timestamp": "2025-01-15T10:15:00Z"
    },
    {
      "amount": 45.00,
      "proposed_by": "worker",
      "timestamp": "2025-01-15T10:30:00Z"
    }
  ]
}
```

---

## **FIX #4: Unified Issue Reporting**

### POST `/api/jobs/:id/report-issue`
**Unified issue reporting (replaces separate dispute/guarantee endpoints)**

**Request:**
```json
{
  "issue_category": "same_problem | new_problem | quality_issue | no_show | payment_dispute | behavior",
  "description": "The leak came back after 3 days",
  "evidence_photos": ["url1", "url2"]
}
```

**Response:**
```json
{
  "issue_id": "uuid",
  "issue_type": "GUARANTEE",
  "issue_category": "same_problem",
  "status": "open",
  "message": "Issue reported successfully. Worker has been notified.",
  "message_translations": {
    "ar-TN": "تم الإبلاغ عن المشكلة. تم إشعار العامل.",
    "fr": "Problème signalé. Le prestataire a été informé.",
    "en": "Issue reported. Worker has been notified."
  },
  "next_steps": {
    "ar-TN": "سيرد العامل خلال 48 ساعة. إذا رفض، سيراجع الإدارة.",
    "fr": "Le prestataire répondra dans 48h. S'il refuse, l'admin examinera.",
    "en": "Worker will respond within 48 hours. If refused, admin will review."
  }
}
```

---

### GET `/api/jobs/:id/issues`
**Get all issues for a job**

**Response:**
```json
{
  "issues": [
    {
      "id": "uuid",
      "issue_type": "GUARANTEE",
      "issue_category": "same_problem",
      "description": "Leak returned",
      "status": "open",
      "opened_at": "2025-01-15T10:00:00Z",
      "evidence_urls": ["url1", "url2"],
      "worker_response": null,
      "admin_notes": null
    }
  ]
}
```

---

### GET `/api/admin/issues`
**Admin: View unified issue queue**

**Query params:**
- `type`: "all" | "guarantee" | "dispute"
- `status`: "open" | "investigating" | "resolved"
- `sort`: "oldest" | "newest"

**Response:**
```json
{
  "issues": [
    {
      "id": "uuid",
      "job_id": "uuid",
      "issue_type": "DISPUTE",
      "issue_category": "quality_issue",
      "status": "open",
      "days_open": 2,
      "customer": {
        "id": "uuid",
        "name": "John Doe",
        "phone": "+216XXXXXXXX"
      },
      "worker": {
        "id": "uuid",
        "name": "Ahmed Ben Ali",
        "phone": "+216XXXXXXXX"
      },
      "job": {
        "category": "plumbing",
        "description": "Fix leaking faucet"
      },
      "description": "Work quality unsatisfactory",
      "evidence_urls": ["url1"],
      "opened_at": "2025-01-13T10:00:00Z"
    }
  ],
  "stats": {
    "total_open": 5,
    "guarantees": 2,
    "disputes": 3,
    "avg_resolution_time_hours": 36
  }
}
```

---

## **FIX #5: Updated Fee Status & Reminders**

### GET `/api/fees/status`
**Get fee payment status and timeline**

**Response:**
```json
{
  "current_balance": -25.00,
  "outstanding_invoices": 1,
  "account_status": "active",
  "days_until_action": 23,
  "next_action": "reminder",
  "timeline": {
    "invoice_created": "2025-01-01",
    "reminder_date": "2025-01-08",
    "warning_date": "2025-01-22",
    "suspension_date": "2025-01-31"
  },
  "payment_methods": [
    {
      "name": "D17",
      "instructions": "Transfer to: 12345678"
    },
    {
      "name": "Flouci",
      "instructions": "Transfer to: +216XXXXXXXX"
    }
  ]
}
```

---

### POST `/api/fees/:id/request-extension`
**Worker requests payment extension (grace period)**

**Request:**
```json
{
  "reason": "Waiting for payment from recent jobs",
  "requested_days": 7
}
```

**Response:**
```json
{
  "success": true,
  "message": "Extension request submitted for admin review",
  "message_translations": {
    "ar-TN": "تم إرسال طلب تمديد المهلة للمراجعة",
    "fr": "Demande de prolongation soumise",
    "en": "Extension request submitted"
  },
  "current_due_date": "2025-01-31",
  "status": "pending_review"
}
```

---

## **Updated Error Codes**

### New Error Codes:

```typescript
export enum ErrorCode {
  // Existing codes...
  
  // New codes from fixes
  NEGOTIATION_LIMIT_REACHED = 'NEGOTIATION_LIMIT_REACHED',
  PAYMENT_PROOF_REQUIRED = 'PAYMENT_PROOF_REQUIRED',
  PAYMENT_PROOF_INVALID = 'PAYMENT_PROOF_INVALID',
  FEE_OVERDUE = 'FEE_OVERDUE',
  ACCOUNT_SUSPENDED_FEES = 'ACCOUNT_SUSPENDED_FEES',
}
```

---

## **Webhook Events (For Automation)**

### Fee Reminder Events

**Event: `fee.reminder.sent`**
```json
{
  "event": "fee.reminder.sent",
  "timestamp": "2025-01-08T09:00:00Z",
  "data": {
    "fee_id": "uuid",
    "worker_id": "uuid",
    "amount_due": 25.00,
    "days_overdue": 7,
    "days_until_suspension": 23
  }
}
```

**Event: `fee.warning.sent`**
```json
{
  "event": "fee.warning.sent",
  "timestamp": "2025-01-22T09:00:00Z",
  "data": {
    "fee_id": "uuid",
    "worker_id": "uuid",
    "amount_due": 25.00,
    "days_overdue": 21,
    "days_until_suspension": 9
  }
}
```

**Event: `worker.suspended`**
```json
{
  "event": "worker.suspended",
  "timestamp": "2025-01-31T09:00:00Z",
  "data": {
    "worker_id": "uuid",
    "reason": "unpaid_fees",
    "amount_owed": 25.00,
    "can_reactivate": true
  }
}
```

---

## **Cron Job Endpoints (Vercel Cron)**

### POST `/api/cron/check-overdue-fees`
**Daily check for overdue fees (runs at 9 AM Tunis time)**

**Authorization:** Requires cron secret token

**Actions performed:**
- Check all unpaid fees
- Send Day 7 reminders (if not sent)
- Send Day 21 warnings (if not sent)
- Suspend accounts at Day 30
- Log all actions

**Response:**
```json
{
  "success": true,
  "actions_taken": {
    "reminders_sent": 5,
    "warnings_sent": 2,
    "suspensions": 1
  },
  "timestamp": "2025-01-15T09:00:00Z"
}
```

---

### POST `/api/cron/weekly-invoices`
**Generate weekly fee invoices (runs every Friday at 6 PM)**

**Authorization:** Requires cron secret token

**Response:**
```json
{
  "success": true,
  "invoices_generated": 45,
  "total_fees": 225.00,
  "notifications_sent": 45,
  "timestamp": "2025-01-12T18:00:00Z"
}
```

---

## **Updated Admin Actions**

### PATCH `/api/admin/issues/:id/resolve`
**Admin resolves issue**

**Request:**
```json
{
  "resolution": "worker_fault | customer_fault | no_fault | needs_escalation",
  "action_taken": "strike_issued | refund_issued | mediated | closed",
  "admin_notes": "Worker agreed to return and fix",
  "strike_worker": false
}
```

---

### POST `/api/admin/workers/:id/adjust-fees`
**Admin manually adjusts worker fees (waiver/correction)**

**Request:**
```json
{
  "fee_id": "uuid",
  "adjustment_type": "waive | reduce | extend",
  "adjustment_amount": -5.00,
  "reason": "Platform error - job was cancelled by customer",
  "notes": "Manual correction applied"
}
```

**Response:**
```json
{
  "success": true,
  "updated_fee": {
    "id": "uuid",
    "original_amount": 25.00,
    "adjusted_amount": 20.00,
    "status": "unpaid",
    "adjustment_reason": "Platform error"
  }
}
```

---

## **Implementation Priority**

### Week 1 (Critical):
1. ✅ `POST /api/fees/:id/submit-payment`
2. ✅ `PATCH /api/jobs/:id/propose-price` (with limit check)
3. ✅ `POST /api/jobs/:id/report-issue` (unified)
4. ✅ `POST /api/cron/check-overdue-fees`

### Week 2 (Important):
5. ✅ `GET /api/fees/my-invoices`
6. ✅ `GET /api/fees/status`
7. ✅ `GET /api/admin/issues` (unified queue)
8. ✅ `PATCH /api/admin/fees/:id/verify-payment`

### Week 3 (Nice-to-have):
9. ✅ `POST /api/fees/:id/request-extension`
10. ✅ `POST /api/admin/workers/:id/adjust-fees`

---

**All critical fixes are now fully specified with API endpoints, error handling, and i18n support.**