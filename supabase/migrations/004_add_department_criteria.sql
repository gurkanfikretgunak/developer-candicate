-- Create table for organization-specific department criteria
CREATE TABLE IF NOT EXISTS organization_department_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department_id TEXT NOT NULL,
  department_name TEXT NOT NULL,
  criteria JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, department_id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_org_dept_criteria_org_id ON organization_department_criteria(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_dept_criteria_dept_id ON organization_department_criteria(department_id);

-- Enable RLS
ALTER TABLE organization_department_criteria ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their organization's department criteria"
  ON organization_department_criteria
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their organization's department criteria"
  ON organization_department_criteria
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their organization's department criteria"
  ON organization_department_criteria
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their organization's department criteria"
  ON organization_department_criteria
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

