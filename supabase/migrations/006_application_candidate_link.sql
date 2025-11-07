-- 006_application_candidate_link.sql

ALTER TABLE public_applications
  ADD COLUMN IF NOT EXISTS candidate_id UUID,
  ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;

-- Optional: ensure one candidate per application
CREATE UNIQUE INDEX IF NOT EXISTS idx_public_applications_candidate_unique
  ON public_applications(candidate_id)
  WHERE candidate_id IS NOT NULL;
