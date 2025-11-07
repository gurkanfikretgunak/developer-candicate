-- 005_hiring_and_compliance.sql

-- Public applications table (open for public submissions)
CREATE TABLE IF NOT EXISTS public_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT,
  portfolio_url TEXT,
  cover_letter TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public_applications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for hiring form submissions)
CREATE POLICY "Anon can insert applications"
  ON public_applications
  FOR INSERT
  WITH CHECK (true);

-- Allow org members to read submissions (optional)
CREATE POLICY "Authenticated can read applications"
  ON public_applications
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Add GDPR/cookie acceptance timestamps to user profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS gdpr_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cookies_accepted_at TIMESTAMPTZ;

-- Policies table to store legal documents
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_type TEXT NOT NULL CHECK (policy_type IN ('gdpr', 'privacy', 'cookies')),
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read policies
CREATE POLICY "Anyone can read policies"
  ON policies
  FOR SELECT
  USING (true);

-- Allow authenticated users with organization to insert/update policies
CREATE POLICY "Org users can manage policies"
  ON policies
  FOR ALL
  USING (
    auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.organization_id IS NOT NULL
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.organization_id IS NOT NULL
    )
  );

-- Ensure unique policy per type (latest row per type)
CREATE UNIQUE INDEX IF NOT EXISTS idx_policies_type_unique
  ON policies(policy_type);
