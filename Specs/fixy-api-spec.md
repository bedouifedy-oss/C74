# 📡 C74 API Specification (MVP)

## Authentication Endpoints

### POST `/api/auth/signup`
**Create new user account**

Request:
```json
{
  "phone": "+216XXXXXXXX",
  "name": "string",
  "email": "string (optional)",
  "role": "customer | worker"
}
```

Response:
```json
{
  "user_id": "uuid",
  "otp_sent": true,
  "message": "OTP sent to phone"
}
```

---

### POST `/api/auth/verify-otp`
**Verify phone with OTP**

Request:
```json
{
  "phone": "+216XXXXXXXX",
  "otp": "123456"
}
```

Response:
```json
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "role": "customer",
    "phone_verified": true
  }
}
```

---

### POST `/api/auth/resend-otp`
Request:
```json
{
  "phone": "+216XXXXXXXX"
}
```

---

## Worker Profile Endpoints

### POST `/api/workers/profile`
**Create/update worker profile**

Request (multipart/form-data):
```json
{
  "category": "plumbing",
  "bio": "string",
  "city": "Mourouj",
  "profile_photo": "file",
  "id_document": "file"
}
```

Response:
```json
{
  "worker_id": "uuid",
  "status": "pending_verification"
}
```

---

### GET `/api/workers/:id`
**Get worker details**

Response:
```json
{
  "id": "uuid",
  "name": "string",
  "category": "plumbing",
  "bio": "string",
  "rating_avg": 4.5,
  "rating_count": 23,
  "completed_jobs": 45,
  "guarantee_enabled": true,
  "status": "active"
}
```

---

### GET `/api/workers/search`
**Search available workers**

Query params:
- `category`: plumbing | electrical | AC | cleaning
- `date`: YYYY-MM-DD
- `time_slot`: morning | afternoon | evening

Response:
```json
{
  "workers": [
    {
      "id": "uuid",
      "name": "string",
      "rating_avg": 4.5,
      "completed_jobs": 45,
      "available": true
    }
  ]
}
```

---

### PATCH `/api/workers/availability`
**Update availability**

Request:
```json
{
  "date": "2025-01-15",
  "time_slot": "morning",
  "status": "available | blocked"
}
```

---

## Job Endpoints

### POST `/api/jobs`
**Create new job request**

Request:
```json
{
  "category": "plumbing",
  "description": "string",
  "address": "string",
  "address_details": "string (optional)",
  "photos": ["url1", "url2"],
  "inspection_required": false,
  "price_after_inspection": false,
  "preferred_date": "2025-01-15",
  "preferred_time_slot": "morning"
}
```

Response:
```json
{
  "job_id": "uuid",
  "status": "requested",
  "created_at": "timestamp"
}
```

---

### GET `/api/jobs/:id`
**Get job details**

Response:
```json
{
  "id": "uuid",
  "category": "plumbing",
  "description": "string",
  "address": "string",
  "customer": {
    "id": "uuid",
    "name": "string",
    "phone": "string"
  },
  "worker": {
    "id": "uuid",
    "name": "string",
    "rating": 4.5
  },
  "status": "accepted",
  "price_agreed": 50.00,
  "scheduled_date": "2025-01-15",
  "scheduled_time_slot": "morning",
  "photos": [],
  "created_at": "timestamp"
}
```

---

### PATCH `/api/jobs/:id/accept`
**Worker accepts job**

Request:
```json
{
  "worker_id": "uuid"
}
```

Response:
```json
{
  "status": "accepted",
  "message": "Job accepted. Please propose a price."
}
```

---

### PATCH `/api/jobs/:id/reject`
**Worker rejects job**

Request:
```json
{
  "worker_id": "uuid",
  "reason": "too_far | not_available | out_of_scope | other",
  "notes": "string (if other)"
}
```

---

### POST `/api/jobs/:id/propose-price`
**Propose or counter-offer price**

Request:
```json
{
  "amount": 50.00,
  "notes": "Includes parts and labor"
}
```

Response:
```json
{
  "negotiation_id": "uuid",
  "status": "pending"
}
```

---

### PATCH `/api/jobs/:id/accept-price`
**Accept proposed price**

Request:
```json
{
  "negotiation_id": "uuid"
}
```

Response:
```json
{
  "job_status": "scheduled",
  "price_agreed": 50.00,
  "price_agreed_at": "timestamp"
}
```

---

### PATCH `/api/jobs/:id/status`
**Update job status**

Request:
```json
{
  "status": "in_progress | completed",
  "completion_photos": ["url1", "url2"],
  "completion_notes": "string"
}
```

---

### PATCH `/api/jobs/:id/cancel`
**Cancel job**

Request:
```json
{
  "cancelled_by": "customer | worker",
  "reason": "string"
}
```

---

### POST `/api/jobs/:id/guarantee`
**Open guarantee case**

Request:
```json
{
  "description": "Same leak returned",
  "photos": ["url1", "url2"]
}
```

Response:
```json
{
  "guarantee_case_id": "uuid",
  "status": "open"
}
```

---

## Messages Endpoints

### GET `/api/jobs/:id/messages`
**Get conversation for job**

Response:
```json
{
  "messages": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "sender_name": "string",
      "message_text": "string",
      "message_type": "text",
      "created_at": "timestamp",
      "read": true
    }
  ]
}
```

---

### POST `/api/jobs/:id/messages`
**Send message**

Request:
```json
{
  "message_text": "string"
}
```

---

### PATCH `/api/messages/:id/read`
**Mark message as read**

---

## Reviews Endpoints

### POST `/api/jobs/:id/review`
**Submit review**

Request:
```json
{
  "rating": 5,
  "comment": "Excellent work",
  "reviewed_user_id": "uuid"
}
```

Response:
```json
{
  "review_id": "uuid",
  "published": true
}
```

---

### GET `/api/workers/:id/reviews`
**Get worker reviews**

Response:
```json
{
  "reviews": [
    {
      "rating": 5,
      "comment": "string",
      "reviewer_name": "string",
      "created_at": "timestamp"
    }
  ],
  "rating_avg": 4.5,
  "rating_count": 23
}
```

---

## Disputes Endpoints

### POST `/api/jobs/:id/dispute`
**Open dispute**

Request:
```json
{
  "issue_type": "no_show | quality | payment | behavior",
  "description": "string",
  "evidence_photos": ["url1"]
}
```

---

### GET `/api/disputes`
**Get my disputes**

Response:
```json
{
  "disputes": [
    {
      "id": "uuid",
      "job_id": "uuid",
      "issue_type": "quality",
      "status": "open",
      "opened_at": "timestamp"
    }
  ]
}
```

---

## File Upload Endpoints

### POST `/api/upload`
**Upload file to Supabase Storage**

Request (multipart/form-data):
```
file: binary
file_type: profile | job_request | completion | dispute | document
```

Response:
```json
{
  "url": "https://supabase-storage-url/filename.jpg",
  "file_id": "uuid"
}
```

---

## Admin Endpoints

### GET `/api/admin/jobs`
**List all jobs (admin)**

Query params:
- `status`: requested | accepted | completed | disputed
- `date_from`: YYYY-MM-DD
- `date_to`: YYYY-MM-DD

---

### GET `/api/admin/disputes`
**List all disputes**

Query params:
- `status`: open | investigating | resolved

---

### PATCH `/api/admin/workers/:id/suspend`
**Suspend worker**

Request:
```json
{
  "reason": "string",
  "duration_days": 30
}
```

---

### PATCH `/api/admin/workers/:id/strike`
**Add strike to worker**

Request:
```json
{
  "reason": "guarantee_refusal | no_show | quality_issue"
}
```

---

### PATCH `/api/admin/reviews/:id/moderate`
**Moderate review**

Request:
```json
{
  "action": "publish | hide | delete",
  "reason": "string"
}
```

---

### GET `/api/admin/fees`
**View worker fees**

Query params:
- `status`: unpaid | overdue | paid
- `worker_id`: uuid (optional)

---

### PATCH `/api/admin/fees/:id/mark-paid`
**Mark fee as paid**

Request:
```json
{
  "payment_method": "d17 | flouci | wire | mandat",
  "payment_reference": "string"
}
```

---

## Notifications Endpoints

### GET `/api/notifications`
**Get my notifications**

Response:
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "job_update",
      "title": "Job accepted",
      "message": "Worker has accepted your job",
      "action_url": "/jobs/uuid",
      "read": false,
      "created_at": "timestamp"
    }
  ],
  "unread_count": 3
}
```

---

### PATCH `/api/notifications/:id/read`
**Mark notification as read**

---

## Utility Endpoints

### GET `/api/health`
**Health check**

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:00:00Z"
}
```

---

### GET `/api/categories`
**Get service categories**

Response:
```json
{
  "categories": [
    {
      "id": "plumbing",
      "name": "Plumbing",
      "icon": "🔧"
    }
  ]
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must be logged in"
  }
}
```

### Standard Error Codes:
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_ERROR` (500)

---

## Rate Limits

- Auth endpoints: 5 requests / minute
- Upload endpoints: 10 requests / minute
- All other endpoints: 100 requests / minute

---

## Authentication

All endpoints except `/api/auth/*` and `/api/health` require:

**Header:**
```
Authorization: Bearer <jwt_token>
```

Token expires after 30 days.