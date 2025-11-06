-- Add new columns to candidates table for CV and evaluators
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS cv_file_url TEXT,
ADD COLUMN IF NOT EXISTS cv_file_name TEXT,
ADD COLUMN IF NOT EXISTS evaluators TEXT[], -- Array of evaluator names
ADD COLUMN IF NOT EXISTS evaluation_date DATE DEFAULT CURRENT_DATE;

-- Note: Storage bucket and policies should be created via Supabase Dashboard
-- Go to: Storage → Create bucket → "candidate-cvs" → Private
-- Then add policies via the UI for your organization's access control
