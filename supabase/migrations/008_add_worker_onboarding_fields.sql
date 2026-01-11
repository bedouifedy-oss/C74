-- ============================================
-- ADD ONBOARDING FIELDS TO WORKERS TABLE
-- ============================================

-- Add missing columns for worker onboarding
ALTER TABLE workers 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS id_front_url TEXT,
ADD COLUMN IF NOT EXISTS id_back_url TEXT,
ADD COLUMN IF NOT EXISTS availability_schedule JSONB DEFAULT '{"available": true, "days": [], "timeSlots": []}',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add index for onboarding status
CREATE INDEX IF NOT EXISTS idx_workers_onboarding_completed ON workers(onboarding_completed);

-- Add index for terms acceptance
CREATE INDEX IF NOT EXISTS idx_workers_terms_accepted ON workers(terms_accepted);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_workers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_workers_updated_at
    BEFORE UPDATE ON workers
    FOR EACH ROW
    EXECUTE FUNCTION update_workers_updated_at();

-- Add comment
COMMENT ON COLUMN workers.onboarding_completed IS 'Whether the worker has completed the onboarding process';
COMMENT ON COLUMN workers.terms_accepted IS 'Whether the worker has accepted the platform terms and conditions';
COMMENT ON COLUMN workers.id_front_url IS 'URL of the front side of ID document';
COMMENT ON COLUMN workers.id_back_url IS 'URL of the back side of ID document';
COMMENT ON COLUMN workers.availability_schedule IS 'JSON object containing worker availability schedule';
COMMENT ON COLUMN workers.updated_at IS 'Last time this record was updated';
