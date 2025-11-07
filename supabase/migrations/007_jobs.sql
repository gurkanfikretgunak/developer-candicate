-- 007_jobs.sql

-- Jobs table for specific job postings
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  location TEXT,
  employment_type TEXT CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship', 'remote', 'hybrid')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_org ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their organization's jobs"
  ON jobs
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Allow public to view active jobs
CREATE POLICY "Public can view active jobs"
  ON jobs
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can insert their organization's jobs"
  ON jobs
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their organization's jobs"
  ON jobs
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their organization's jobs"
  ON jobs
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Add job_id to public_applications to link applications to specific jobs
ALTER TABLE public_applications
  ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES jobs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_public_applications_job_id ON public_applications(job_id);

