CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  proposed_price DECIMAL(10,2) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  UNIQUE(job_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_worker ON job_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
