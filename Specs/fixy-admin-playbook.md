# 🛠️ Fixy.tn Admin Operations Playbook

**Version:** 1.0  
**Last Updated:** December 2025  
**Purpose:** Daily operational procedures for platform administrators

---

## 🎯 Admin Role Overview

Admins are responsible for:
- ✅ Verifying worker applications
- ✅ Monitoring job quality & disputes
- ✅ Enforcing platform rules
- ✅ Moderating reviews
- ✅ Managing payments & fees
- ✅ Providing customer support

---

## 📋 Daily Tasks Checklist

### Every Morning (9:00 AM)

- [ ] Check **pending worker applications** (verify ID documents)
- [ ] Review **open disputes** (respond within 24 hours)
- [ ] Check **overdue fees** (send reminder SMS if needed)
- [ ] Review **flagged reviews** (moderate if necessary)
- [ ] Check **guarantee cases** (ensure workers responded)

### Every Afternoon (3:00 PM)

- [ ] Monitor **active jobs** (check for issues)
- [ ] Respond to **customer support messages**
- [ ] Review **no-show reports**
- [ ] Check **suspended workers** requesting reinstatement

### Every Friday (End of Week)

- [ ] Generate **weekly fee invoices** for workers
- [ ] Send **payment reminders** via SMS/WhatsApp
- [ ] Review **strike log** (identify repeat offenders)
- [ ] Analyze **platform metrics** (job completion rate, disputes, etc.)

---

## 👷 Worker Verification Process

### Step 1: Review Application

When a worker registers, check:

✅ **Profile photo**: Clear, professional, shows face  
✅ **ID document**: Valid Tunisian ID (CIN), not expired  
✅ **Phone number**: Verified via OTP  
✅ **Service category**: Appropriate  
✅ **Bio**: No spam, inappropriate content, or false claims

### Step 2: Decision

**Approve** if all checks pass → Worker status = `active`

**Reject** if:
- ❌ Fake/unclear ID
- ❌ Inappropriate profile content
- ❌ Duplicate account detected
- ❌ Known bad actor

**Request more info** if:
- ⚠️ ID photo unclear
- ⚠️ Missing certifications (for specialized services)

### Step 3: Notify Worker

Send notification via:
- In-app notification
- SMS
- WhatsApp message (if available)

**Approval message:**
> "Congratulations! Your Fixy.tn profile has been approved. You can now start accepting jobs."

**Rejection message:**
> "Your application has been reviewed. Unfortunately, we cannot approve your profile at this time due to [reason]. You may reapply with updated documents."

---

## ⚖️ Dispute Resolution Process

### Types of Disputes

1. **No-Show**: Worker or customer didn't show up
2. **Quality Issues**: Work not done properly
3. **Payment**: Disagreement over price
4. **Behavior**: Rude, unprofessional conduct
5. **Other**: Miscellaneous

### Resolution Steps

#### Level 1: Encourage Direct Resolution (First 24 Hours)

When dispute is opened:
1. Review complaint description
2. Check job history & chat logs
3. Send message to both parties: "Please try to resolve this directly. Admin will review if needed."

#### Level 2: Admin Investigation (24-48 Hours)

If not resolved, investigate:
- ✅ Review chat messages
- ✅ Check timestamps (when job was scheduled, when marked completed)
- ✅ Review photos (before/after, completion evidence)
- ✅ Check past disputes (is this a repeat offender?)

#### Level 3: Admin Decision (Final)

Based on evidence, make ruling:

**Worker at fault:**
- Issue **strike**
- Require worker to return (if guarantee case)
- Suspend if repeat offender

**Customer at fault:**
- Issue **warning** to customer
- Close dispute in worker's favor
- Flag customer account if abusive behavior

**Unclear / Both at fault:**
- Mediate solution
- Close dispute as "resolved"
- No penalties issued

### Documentation

Always document:
- Date/time of decision
- Evidence reviewed
- Reasoning
- Action taken

Store in `disputes.admin_notes` field.

---

## 🔧 Guarantee Case Handling

### When Guarantee is Claimed

Customer files guarantee claim within 7 days → System notifies worker

### Admin Responsibilities

1. **Verify eligibility:**
   - ✅ Job was completed
   - ✅ Claim filed within 7 days
   - ✅ Issue is same as original problem

2. **Monitor worker response:**
   - Worker has **48 hours** to respond
   - If worker accepts → schedule return visit
   - If worker refuses → admin reviews evidence

3. **If worker refuses legitimately:**
   - New/different problem (not covered)
   - Customer caused issue (misuse)
   - Outside factors (power outage, etc.)
   → Close case, no penalty

4. **If worker refuses unjustly:**
   - Same problem returned
   - Worker clearly at fault
   → Issue **strike** + require return visit

### Escalation

If worker continues refusing valid guarantees:
- 1st refusal → Strike
- 2nd refusal → 7-day suspension
- 3rd refusal → 30-day suspension
- 4th refusal → Permanent ban

---

## 🚨 Strike System Management

### When to Issue Strikes

**Automatic strikes:**
- No-show (confirmed)
- Refusing valid guarantee

**Manual strikes (admin discretion):**
- Repeatedly poor quality work
- Abusive behavior
- Fraudulent activity
- Fee payment evasion attempts

### Strike Consequences

- **1 strike**: Warning
- **2 strikes**: 7-day suspension
- **3 strikes**: 30-day suspension
- **4 strikes**: Permanent ban

### Strike Decay

Strikes expire after **6 months** of good behavior (no new strikes, active work).

### Viewing Strike History

Admin panel shows:
- Worker name
- Strike count
- Date of each strike
- Reason for strike
- Expiry date

---

## 💰 Fee Management & Collections

### Weekly Billing Process (Every Friday)

System automatically:
1. Counts completed jobs for each worker
2. Calculates fee (e.g., 5 DT × job count)
3. Generates invoice
4. Sends notification to worker

### Admin Monitoring

**Check overdue fees:**
- Workers with unpaid invoices > 7 days → Send reminder
- Workers with unpaid invoices > 14 days → **Suspend account**

**Payment verification:**
When worker claims they paid:
1. Check payment method (D17, Flouci, wire, etc.)
2. Verify payment reference number
3. Confirm amount matches invoice
4. Mark as paid in system
5. Reinstate account if suspended

**Disputed fees:**
- Worker claims incorrect job count → Review completed jobs log
- Worker requests waiver → Admin can waive if valid reason (e.g., job cancelled by customer, technical error)

### Fee Waiver Policy

Admins may waive fees in these cases:
- ✅ Job cancelled by customer last-minute
- ✅ Platform error/bug caused job to count incorrectly
- ✅ Worker completed job but customer didn't mark complete (verify first)

Do NOT waive fees for:
- ❌ "I forgot to pay"
- ❌ "Times are tough"
- ❌ Worker trying to avoid payment

---

## 📝 Review Moderation

### Auto-Published Reviews

Reviews are published automatically UNLESS:
- Contains profanity
- Contains personal contact info (phone, email)
- Contains threats
- Contains hate speech

### Manual Moderation

When review is flagged:

**Review content and decide:**

**Publish** if:
- ✅ Legitimate complaint
- ✅ Honest negative experience
- ✅ No policy violations

**Edit** if:
- ⚠️ Contains minor profanity (replace with ***)
- ⚠️ Contains phone number (remove number)

**Hide** if:
- ❌ Spam
- ❌ Off-topic
- ❌ Clearly fake

**Delete** if:
- ❌ Threats of violence
- ❌ Doxxing attempt
- ❌ Hate speech

### Response to Appeals

Workers can request review removal. Only remove if:
- Review violates policy
- Review is provably false (requires evidence)

Do NOT remove reviews just because worker is unhappy with rating.

---

## 🚫 Worker Suspension & Bans

### Temporary Suspension

**Reasons:**
- Strike threshold reached
- Overdue fees (14+ days)
- Investigation pending

**Process:**
1. Set `users.suspended_until` date
2. Set `users.suspension_reason`
3. Notify worker via SMS + in-app
4. Worker cannot accept new jobs
5. Existing jobs can be completed

**Reinstatement:**
- Suspension expires automatically
- Or admin manually reinstates after issue resolved

### Permanent Ban

**Reasons:**
- 4+ strikes
- Fraud/scam confirmed
- Harassment
- Illegal activity

**Process:**
1. Set `workers.status = 'banned'`
2. Document reason in admin notes
3. Notify worker
4. Worker cannot create new account with same phone/ID

---

## 📞 Customer Support Guidelines

### Response Time

Target: **Within 24 hours** on business days

### Common Issues & Solutions

**"Worker didn't show up"**
1. Check job status
2. Check worker's last login
3. Contact worker via phone
4. If confirmed no-show → issue strike, help customer rebook

**"Work quality is poor"**
1. Ask for photos/evidence
2. Review job history
3. Suggest guarantee claim if within 7 days
4. Escalate to dispute if needed

**"I can't pay the worker"**
→ Jobs are cash-only for MVP. Remind customer.

**"Worker is asking for more money than agreed"**
1. Check price agreement in chat logs
2. Show evidence to worker
3. Enforce agreed price or cancel job

**"My account is suspended"**
1. Check suspension reason
2. If fee-related → guide to payment
3. If strike-related → explain policy
4. If error → reinstate immediately

---

## 📊 Weekly Reporting

Every Friday, generate report with:

### Platform Health Metrics
- Total jobs created
- Total jobs completed
- Completion rate (%)
- Average job rating
- Active workers
- Active customers

### Issues & Alerts
- Open disputes
- Overdue fees
- Pending worker applications
- Flagged reviews
- Strike incidents

### Financial Summary
- Total fees owed
- Total fees collected
- Outstanding debt by worker

---

## 🔐 Admin Security Rules

- ✅ Never share admin login credentials
- ✅ Log all major actions (suspensions, bans, fee waivers)
- ✅ Always document reasoning in admin notes
- ✅ Do not give out worker/customer personal info without valid reason
- ✅ Report suspicious activity to platform owner immediately

---

## 🆘 Escalation to Founder

Escalate to founder when:
- Legal issue arises
- Media/PR issue
- Major fraud detected
- Technical emergency
- Unclear policy situation

**Contact:** [Your contact info]

---

## 📚 Useful Admin Panel Views

### Dashboard
- Jobs today (by status)
- Disputes requiring attention
- Fees overdue
- Pending worker verifications

### Workers View
- Filter: active | suspended | pending
- Sort by: rating, jobs completed, strikes
- Search by: name, phone, ID

### Jobs View
- Filter: status, date range, category
- Search by: job ID, customer, worker

### Disputes View
- Filter: open | investigating | resolved
- Sort by: date opened, priority
- Assign to admin

### Fees View
- Filter: unpaid | overdue | paid
- Sort by: amount, due date
- Bulk actions: send reminders, mark paid

---

**End of Playbook**

This is a living document. Update as policies evolve.