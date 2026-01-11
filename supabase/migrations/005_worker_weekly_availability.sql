CREATE TABLE IF NOT EXISTS worker_weekly_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  time_slot TEXT NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, day_of_week, time_slot)
);

CREATE INDEX IF NOT EXISTS idx_worker_weekly_availability_worker ON worker_weekly_availability(worker_id);

ALTER TABLE worker_weekly_availability ENABLE ROW LEVEL SECURITY;
