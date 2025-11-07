export interface Organization {
  id: string;
  name: string;
  sector: string | null;
  language: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  organization_id: string | null;
  full_name: string | null;
  language: string;
  created_at: string;
  gdpr_accepted_at?: string | null;
  cookies_accepted_at?: string | null;
}

export interface Step1Data {
  name?: string;
  email?: string;
  position?: string;
  evaluators?: string[];
  evaluationDate?: string;
  notes?: string;
}

export interface Step3Data {
  score?: number;
  solutionUrl?: string;
  notes?: string;
  codeQuality?: number;
  problemSolving?: number;
  timeManagement?: number;
  communication?: number;
  submissionDate?: string;
}

export interface FinalEvaluationData {
  level?: 'junior' | 'mid' | 'senior' | 'not-fit';
  overallScore?: number;
  status?: 'accepted' | 'rejected' | 'postponed' | 'pending';
  summary?: string;
}

export interface Candidate {
  id: string;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  current_step: number;
  department: string;
  cv_file_url?: string | null;
  cv_file_name?: string | null;
  evaluators?: string[] | null;
  evaluation_date?: string | null;
  step1_general: Step1Data;
  step2_scores: Record<string, number>;
  step3_live_coding: Step3Data;
  final_evaluation: FinalEvaluationData;
}

export interface Department {
  id: string;
  name?: string; // For custom departments
  nameKey?: string; // For default departments (i18n key)
  categories: Category[];
}

export interface Category {
  name?: string; // For custom categories
  nameKey?: string; // For default categories (i18n key)
  criteria: string[];
}

export interface DepartmentsConfig {
  departments: Department[];
}

export interface OrganizationDepartmentCriteria {
  id: string;
  organization_id: string;
  department_id: string;
  department_name: string;
  criteria: {
    categories: Category[];
  };
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  organization_id: string;
  title: string;
  department: string;
  description: string;
  requirements?: string | null;
  location?: string | null;
  employment_type?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote' | 'hybrid' | null;
  status: 'active' | 'closed' | 'draft';
  created_by: string;
  created_at: string;
  updated_at: string;
  organization?: {
    id: string;
    name: string;
  } | null;
}

export interface PublicApplication {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  portfolio_url?: string | null;
  cover_letter?: string | null;
  job_id?: string | null;
  candidate_id?: string | null;
  converted_at?: string | null;
  created_at: string;
}

