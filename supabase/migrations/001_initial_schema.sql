-- C74 Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL CHECK (role IN ('customer', 'worker', 'admin')),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  strikes_count INTEGER DEFAULT 0,
  suspended_until TIMESTAMPTZ,
  suspension_reason TEXT,
  can_reactivate BOOLEAN DEFAULT TRUE,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- WORKERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  bio TEXT,
  city TEXT,
  rating_avg DECIMAL(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
  guarantee_enabled BOOLEAN DEFAULT TRUE,
  documents_verified BOOLEAN DEFAULT FALSE,
  profile_photo_url TEXT,
  completed_jobs_count INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  years_of_experience INTEGER,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workers_category ON workers(category);
CREATE INDEX idx_workers_city ON workers(city);
CREATE INDEX idx_workers_status ON workers(status);

-- ============================================
-- WORKER DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS worker_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('id_front', 'id_back', 'certificate', 'license')),
  file_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

CREATE INDEX idx_worker_documents_worker ON worker_documents(worker_id);

-- ============================================
-- AVAILABILITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, date, time_slot)
);

CREATE INDEX idx_availability_worker_date ON availability(worker_id, date);

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id),
  worker_id UUID REFERENCES workers(id),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  address_details TEXT,
  price_estimate DECIMAL(10,2),
  price_agreed DECIMAL(10,2),
  price_agreed_at TIMESTAMPTZ,
  inspection_required BOOLEAN DEFAULT FALSE,
  price_after_inspection BOOLEAN DEFAULT FALSE,
  negotiation_count INTEGER DEFAULT 0,
  max_negotiations INTEGER DEFAULT 3,
  negotiation_closed_at TIMESTAMPTZ,
  negotiation_closed_reason TEXT,
  scheduled_date DATE,
  scheduled_time_slot TEXT CHECK (scheduled_time_slot IN ('morning', 'afternoon', 'evening')),
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show', 'disputed')),
  cancellation_reason TEXT,
  cancelled_by TEXT CHECK (cancelled_by IN ('customer', 'worker', 'admin')),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_notes TEXT
);

CREATE INDEX idx_jobs_customer ON jobs(customer_id);
CREATE INDEX idx_jobs_worker ON jobs(worker_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);

-- ============================================
-- JOB PHOTOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS job_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('request', 'completion', 'dispute')),
  file_url TEXT NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_photos_job ON job_photos(job_id);

-- ============================================
-- PRICE NEGOTIATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS price_negotiations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  proposed_by UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_negotiations_job ON price_negotiations(job_id);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'price_proposal', 'system', 'image')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_job ON messages(job_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewed_user_id UUID NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  flagged BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT TRUE,
  flag_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_reviews_job ON reviews(job_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewed_user_id);

-- ============================================
-- GUARANTEE CASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS guarantee_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  issue_category TEXT NOT NULL CHECK (issue_category IN ('same_problem', 'new_problem', 'quality_issue', 'no_show', 'payment_dispute', 'behavior')),
  is_dispute BOOLEAN DEFAULT FALSE,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'worker_accepted', 'worker_refused', 'resolved', 'rejected', 'investigating')),
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  admin_notes TEXT,
  worker_notified_at TIMESTAMPTZ,
  worker_responded_at TIMESTAMPTZ
);

CREATE INDEX idx_guarantee_cases_job ON guarantee_cases(job_id);
CREATE INDEX idx_guarantee_cases_status ON guarantee_cases(status);

-- ============================================
-- DISPUTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  opened_by UUID NOT NULL REFERENCES users(id),
  issue_type TEXT NOT NULL CHECK (issue_type IN ('no_show', 'quality', 'payment', 'behavior', 'other')),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  resolution TEXT,
  admin_notes TEXT,
  assigned_to UUID REFERENCES users(id),
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_disputes_job ON disputes(job_id);
CREATE INDEX idx_disputes_status ON disputes(status);

-- ============================================
-- FEES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  jobs_count INTEGER DEFAULT 0,
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'overdue', 'waived', 'pending_verification')),
  payment_method TEXT,
  payment_reference TEXT,
  payment_proof_url TEXT,
  payment_notes TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  admin_notes TEXT,
  reminder_sent_at TIMESTAMPTZ,
  warning_sent_at TIMESTAMPTZ,
  suspension_scheduled_at TIMESTAMPTZ,
  grace_period_days INTEGER DEFAULT 30,
  invoice_sent_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fees_worker ON fees(worker_id);
CREATE INDEX idx_fees_status ON fees(status);
CREATE INDEX idx_fees_due_date ON fees(due_date);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Workers are publicly viewable (for browsing)
CREATE POLICY "Workers are viewable by everyone"
  ON workers FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Jobs visible to customer and assigned worker
CREATE POLICY "Jobs visible to participants"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR 
    worker_id = auth.uid() OR
    (status = 'requested' AND worker_id IS NULL)
  );

-- Messages visible to job participants
CREATE POLICY "Messages visible to job participants"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = messages.job_id 
      AND (jobs.customer_id = auth.uid() OR jobs.worker_id = auth.uid())
    )
  );

-- Notifications visible only to owner
CREATE POLICY "Notifications visible to owner"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Uncomment to add test data
/*
INSERT INTO users (id, role, name, phone, phone_verified) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Admin User', '+21612345678', true),
  ('00000000-0000-0000-0000-000000000002', 'customer', 'Test Customer', '+21623456789', true),
  ('00000000-0000-0000-0000-000000000003', 'worker', 'Test Worker', '+21634567890', true);

INSERT INTO workers (id, category, city, status, bio) VALUES
  ('00000000-0000-0000-0000-000000000003', 'plumbing', 'Tunis', 'active', 'Experienced plumber with 10 years of experience.');
*/
