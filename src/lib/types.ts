export interface Organization {
  id: string;
  name: string;
  sector: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  organization_id: string | null;
  full_name: string | null;
  created_at: string;
}

export interface Step1Data {
  name?: string;
  email?: string;
  position?: string;
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
  step1_general: Step1Data;
  step2_scores: Record<string, number>;
  step3_live_coding: Step3Data;
  final_evaluation: FinalEvaluationData;
}

export interface Department {
  id: string;
  name: string;
  categories: Category[];
}

export interface Category {
  name: string;
  criteria: string[];
}

export interface DepartmentsConfig {
  departments: Department[];
}

