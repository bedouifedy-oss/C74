-- ============================================
-- FIXY.TN CRITICAL FIXES - SQL MIGRATION
-- Version: 1.1
-- Date: 2025-01-01
-- Purpose: Address real MVP risks without over-engineering
-- ============================================

-- ============================================
-- FIX #1: Payment Control (No Platform Wallet)
-- Add payment proof tracking to existing fees table
-- ============================================

ALTER TABLE fees
ADD COLUMN payment_proof_url TEXT,
ADD COLUMN payment_reference TEXT,
ADD COLUMN payment_notes TEXT,
ADD COLUMN verified_by UUID REFERENCES users(id),
ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN fees.payment_proof_url IS 'Screenshot/photo of D17/Flouci payment';
COMMENT ON COLUMN fees.payment_reference IS 'Transaction reference number from payment provider';
COMMENT ON COLUMN fees.verified_by IS 'Admin who verified the payment';

-- ============================================
-- FIX #2: Negotiation Loop Limit
-- Prevent infinite counter-offers (max 3 cycles)
-- ============================================

ALTER TABLE jobs
ADD COLUMN negotiation_count INTEGER DEFAULT 0,
ADD COLUMN max_negotiations INTEGER DEFAULT 3,
ADD COLUMN negotiation_closed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN negotiation_closed_reason TEXT;

COMMENT ON COLUMN jobs.negotiation_count IS 'Current number of price counter-offers';
COMMENT ON COLUMN jobs.max_negotiations IS 'Maximum allowed negotiations (default 3)';
COMMENT ON COLUMN jobs.negotiation_closed_reason IS 'Why negotiation ended: max_reached | accepted | cancelled';

-- Create index for negotiation queries
CREATE INDEX idx_jobs_negotiation ON jobs(negotiation_count, status);

-- ============================================
-- FIX #4: Unified Issue Reporting
-- Merge Dispute and Guarantee into single flow
-- ============================================

-- Add category to existing guarantee_cases table
ALTER TABLE guarantee_cases
ADD COLUMN issue_category TEXT DEFAULT 'same_problem',
ADD COLUMN is_dispute BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN guarantee_cases.issue_category IS 'same_problem | new_problem | quality_issue | no_show | payment_dispute | behavior';
COMMENT ON COLUMN guarantee_cases.is_dispute IS 'TRUE if this is a general dispute, FALSE if traditional guarantee';

-- Update disputes table to reference guarantee_cases
ALTER TABLE disputes
ADD COLUMN related_guarantee_case_id UUID REFERENCES guarantee_cases(id);

COMMENT ON COLUMN disputes.related_guarantee_case_id IS 'Links dispute to guarantee case if they are related';

-- ============================================
-- FIX #5: Softer Fee Penalties
-- Extend grace period and add reminder tracking
-- ============================================

ALTER TABLE fees
ADD COLUMN reminder_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN warning_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN suspension_scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN grace_period_days INTEGER DEFAULT 30;

COMMENT ON COLUMN fees.reminder_sent_at IS 'First reminder sent (day 7)';
COMMENT ON COLUMN fees.warning_sent_at IS 'Warning sent (day 21)';
COMMENT ON COLUMN fees.suspension_scheduled_at IS 'Suspension will occur on this date (day 30)';
COMMENT ON COLUMN fees.grace_period_days IS 'Total days before suspension (default 30)';

-- Update users table for suspension tracking
ALTER TABLE users
ADD COLUMN suspension_reason TEXT,
ADD COLUMN can_reactivate BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN users.suspension_reason IS 'Why account was suspended: unpaid_fees | strikes | admin_action';
COMMENT ON COLUMN users.can_reactivate IS 'Can worker reactivate after paying fees';

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if negotiation limit reached
CREATE OR REPLACE FUNCTION check_negotiation_limit(job_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  max_count INTEGER;
BEGIN
  SELECT negotiation_count, max_negotiations
  INTO current_count, max_count
  FROM jobs
  WHERE id = job_id;
  
  RETURN current_count < max_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_negotiation_limit IS 'Returns TRUE if job can still negotiate, FALSE if limit reached';

-- Function to calculate days until suspension
CREATE OR REPLACE FUNCTION days_until_suspension(fee_id UUID)
RETURNS INTEGER AS $$
DECLARE
  created_date TIMESTAMP;
  grace_days INTEGER;
BEGIN
  SELECT created_at, grace_period_days
  INTO created_date, grace_days
  FROM fees
  WHERE id = fee_id;
  
  RETURN grace_days - EXTRACT(DAY FROM (NOW() - created_date))::INTEGER;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION days_until_suspension IS 'Returns number of days remaining before suspension';

-- ============================================
-- UPDATED BUSINESS LOGIC REFERENCE
-- ============================================

/*
FIX #1: PAYMENT PROOF WORKFLOW
================================

1. Worker receives weekly invoice (every Friday)
2. Worker has 30 days to pay (grace_period_days)
3. Payment timeline:
   - Day 7:  reminder_sent_at → Send SMS reminder
   - Day 21: warning_sent_at → Send warning SMS
   - Day 30: suspension_scheduled_at → Suspend account
   
4. Worker payment process:
   - Pay via D17/Flouci/Wire/Mandat
   - Upload payment proof (screenshot)
   - Enter payment reference number
   - Submit to admin

5. Admin verification:
   - Review payment_proof_url
   - Check payment_reference
   - Mark as paid (verified_by, verified_at)
   - Account auto-reactivates if suspended

6. Reactivation:
   - If suspended_until is set and fees are paid
   - System automatically removes suspension
   - Worker receives "Welcome back" SMS


FIX #2: NEGOTIATION LIMIT LOGIC
==================================

1. Worker accepts job → negotiation_count = 0
2. Worker proposes price → negotiation_count = 1
3. Customer counters → negotiation_count = 2
4. Worker counters → negotiation_count = 3
5. If customer counters again → negotiation_count = 4 → LIMIT REACHED

When limit reached:
- Set negotiation_closed_at = NOW()
- Set negotiation_closed_reason = 'max_reached'
- Lock price negotiation for this job
- Show message: "Maximum negotiations reached. You can cancel or accept current offer."
- Worker can still message customer (but no price proposals)

UI Text (show after 2nd counter):
"Tip: Most workers accept within 2 counter-offers. Final offer?"

API Logic:
```javascript
// Before allowing price proposal
if (job.negotiation_count >= job.max_negotiations) {
  return res.status(400).json({
    error: "Maximum negotiations reached",
    message_ar: "وصلت للحد الأقصى من المفاوضات",
    message_fr: "Nombre maximum de négociations atteint",
    message_en: "Maximum negotiations reached"
  });
}

// Increment counter when price proposed
await supabase
  .from('jobs')
  .update({ 
    negotiation_count: job.negotiation_count + 1 
  })
  .eq('id', jobId);
```


FIX #4: UNIFIED ISSUE REPORTING
==================================

User Flow (Single Button):
1. Customer clicks "Report a Problem" (not "Dispute" or "Guarantee")
2. System asks: "What happened?"
   
   Options:
   - Same problem returned (→ Guarantee flow)
   - New/different issue (→ Dispute flow)
   - Worker didn't show up (→ Dispute: no_show)
   - Quality concern (→ Dispute: quality)
   - Payment disagreement (→ Dispute: payment)
   - Unprofessional behavior (→ Dispute: behavior)

3. Backend logic:
   ```javascript
   if (category === 'same_problem' && job.status === 'completed') {
     // Create guarantee case
     await supabase.from('guarantee_cases').insert({
       job_id: jobId,
       issue_category: 'same_problem',
       is_dispute: false,
       description,
       evidence_urls
     });
   } else {
     // Create dispute
     await supabase.from('guarantee_cases').insert({
       job_id: jobId,
       issue_category: category,
       is_dispute: true,
       description,
       evidence_urls
     });
   }
   ```

4. Admin sees single queue with color coding:
   - Green badge: "Guarantee" (same problem)
   - Red badge: "Dispute" (other issues)

Database Query for Admin:
```sql
-- Get all issues (unified view)
SELECT 
  gc.id,
  gc.job_id,
  gc.issue_category,
  gc.is_dispute,
  gc.status,
  CASE 
    WHEN gc.is_dispute = FALSE THEN 'GUARANTEE'
    ELSE 'DISPUTE'
  END as issue_type,
  j.description as job_description,
  u1.name as customer_name,
  u2.name as worker_name
FROM guarantee_cases gc
JOIN jobs j ON j.id = gc.job_id
JOIN users u1 ON u1.id = j.customer_id
JOIN users u2 ON u2.id = j.worker_id
WHERE gc.status = 'open'
ORDER BY gc.created_at DESC;
```


FIX #5: SOFTER FEE TIMELINE
==============================

OLD (Too Harsh):
- Day 7:  Warning
- Day 14: Suspended

NEW (MVP-Friendly):
- Day 7:  Reminder SMS (friendly tone)
- Day 14: (nothing - grace period)
- Day 21: Warning SMS (firmer tone)
- Day 30: Suspension (can reactivate after payment)

SMS Templates:

Day 7 (Reminder):
EN: "Fixy.tn: Friendly reminder - Your weekly invoice of {amount} TND is due in 23 days. Pay anytime: {link}"
FR: "Fixy.tn: Rappel amical - Votre facture de {amount} TND est due dans 23 jours. Payer: {link}"
AR: "Fixy.tn: تذكير ودي - فاتورتك {amount} دينار مستحقة خلال 23 يوم. ادفع: {link}"

Day 21 (Warning):
EN: "Fixy.tn: Warning - Your invoice of {amount} TND is overdue. Pay within 9 days to avoid suspension: {link}"
FR: "Fixy.tn: Avertissement - Votre facture de {amount} TND est en retard. Payez dans 9 jours: {link}"
AR: "Fixy.tn: تحذير - فاتورتك {amount} دينار متأخرة. ادفع خلال 9 أيام لتجنب الإيقاف: {link}"

Day 30 (Suspension):
EN: "Fixy.tn: Your account has been suspended due to unpaid fees. Pay {amount} TND to reactivate: {link}"
FR: "Fixy.tn: Votre compte est suspendu. Payez {amount} TND pour réactiver: {link}"
AR: "Fixy.tn: تم إيقاف حسابك. ادفع {amount} دينار لإعادة التفعيل: {link}"

Vercel Cron Job (runs daily at 9 AM):
```javascript
// api/cron/check-overdue-fees.ts

export async function POST() {
  const today = new Date();
  
  // Get all unpaid fees
  const { data: unpaidFees } = await supabase
    .from('fees')
    .select('*, workers!inner(id, name, phone)')
    .eq('status', 'unpaid')
    .is('paid_at', null);
  
  for (const fee of unpaidFees) {
    const daysOverdue = Math.floor(
      (today - new Date(fee.created_at)) / (1000 * 60 * 60 * 24)
    );
    
    // Day 7: Send reminder
    if (daysOverdue === 7 && !fee.reminder_sent_at) {
      await sendSMS(fee.workers.phone, 'reminder', fee.amount_due);
      await supabase
        .from('fees')
        .update({ reminder_sent_at: today })
        .eq('id', fee.id);
    }
    
    // Day 21: Send warning
    if (daysOverdue === 21 && !fee.warning_sent_at) {
      await sendSMS(fee.workers.phone, 'warning', fee.amount_due);
      await supabase
        .from('fees')
        .update({ 
          warning_sent_at: today,
          status: 'overdue' 
        })
        .eq('id', fee.id);
    }
    
    // Day 30: Suspend account
    if (daysOverdue >= 30 && !fee.suspension_scheduled_at) {
      await suspendWorker(fee.worker_id, 'unpaid_fees');
      await sendSMS(fee.workers.phone, 'suspension', fee.amount_due);
      await supabase
        .from('fees')
        .update({ suspension_scheduled_at: today })
        .eq('id', fee.id);
    }
  }
  
  return new Response('OK', { status: 200 });
}
```

*/

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Fee management queries
CREATE INDEX idx_fees_status_created ON fees(status, created_at);
CREATE INDEX idx_fees_unpaid_workers ON fees(worker_id, status) WHERE status IN ('unpaid', 'overdue');

-- Issue reporting queries
CREATE INDEX idx_guarantee_cases_open ON guarantee_cases(status, is_dispute) WHERE status = 'open';
CREATE INDEX idx_guarantee_cases_job ON guarantee_cases(job_id);

-- ============================================
-- VIEWS FOR ADMIN DASHBOARD
-- ============================================

-- View: Overdue fees requiring action
CREATE OR REPLACE VIEW admin_overdue_fees AS
SELECT 
  f.id,
  f.worker_id,
  w.name as worker_name,
  u.phone as worker_phone,
  f.amount_due,
  f.created_at,
  f.status,
  EXTRACT(DAY FROM (NOW() - f.created_at))::INTEGER as days_overdue,
  f.grace_period_days - EXTRACT(DAY FROM (NOW() - f.created_at))::INTEGER as days_until_suspension,
  f.reminder_sent_at,
  f.warning_sent_at,
  f.suspension_scheduled_at,
  CASE 
    WHEN f.suspension_scheduled_at IS NOT NULL THEN 'Suspended'
    WHEN EXTRACT(DAY FROM (NOW() - f.created_at)) >= 21 THEN 'Warning Sent'
    WHEN EXTRACT(DAY FROM (NOW() - f.created_at)) >= 7 THEN 'Reminder Sent'
    ELSE 'Grace Period'
  END as fee_status
FROM fees f
JOIN workers w ON w.id = f.worker_id
JOIN users u ON u.id = w.id
WHERE f.status IN ('unpaid', 'overdue')
ORDER BY days_overdue DESC;

COMMENT ON VIEW admin_overdue_fees IS 'Admin dashboard: All unpaid fees with action status';

-- View: Unified issue queue
CREATE OR REPLACE VIEW admin_issue_queue AS
SELECT 
  gc.id,
  gc.job_id,
  gc.issue_category,
  gc.is_dispute,
  gc.status,
  gc.description,
  gc.opened_at,
  CASE 
    WHEN gc.is_dispute = FALSE THEN 'GUARANTEE'
    ELSE 'DISPUTE'
  END as issue_type,
  j.description as job_description,
  j.category as job_category,
  u_customer.name as customer_name,
  u_customer.phone as customer_phone,
  u_worker.name as worker_name,
  u_worker.phone as worker_phone,
  EXTRACT(DAY FROM (NOW() - gc.opened_at))::INTEGER as days_open
FROM guarantee_cases gc
JOIN jobs j ON j.id = gc.job_id
JOIN users u_customer ON u_customer.id = j.customer_id
JOIN users u_worker ON u_worker.id = j.worker_id
WHERE gc.status IN ('open', 'investigating')
ORDER BY 
  CASE WHEN gc.is_dispute = TRUE THEN 0 ELSE 1 END, -- Disputes first
  gc.opened_at ASC; -- Oldest first

COMMENT ON VIEW admin_issue_queue IS 'Admin dashboard: Unified dispute and guarantee queue';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Run this to verify migration
SELECT 
  'Fix #1: Payment Proof' as fix,
  COUNT(*) as columns_added
FROM information_schema.columns 
WHERE table_name = 'fees' 
  AND column_name IN ('payment_proof_url', 'payment_reference', 'verified_by')
UNION ALL
SELECT 
  'Fix #2: Negotiation Limit',
  COUNT(*)
FROM information_schema.columns 
WHERE table_name = 'jobs' 
  AND column_name IN ('negotiation_count', 'max_negotiations')
UNION ALL
SELECT 
  'Fix #4: Unified Issues',
  COUNT(*)
FROM information_schema.columns 
WHERE table_name = 'guarantee_cases' 
  AND column_name IN ('issue_category', 'is_dispute')
UNION ALL
SELECT 
  'Fix #5: Softer Penalties',
  COUNT(*)
FROM information_schema.columns 
WHERE table_name = 'fees' 
  AND column_name IN ('reminder_sent_at', 'warning_sent_at', 'grace_period_days');