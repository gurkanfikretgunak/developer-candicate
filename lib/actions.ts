'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import type { Organization, Candidate, UserProfile, OrganizationDepartmentCriteria, Category } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// Organization Actions
export async function createOrganization(data: { name: string; sector: string; language: string }) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: 'User not found' };
  }

  const { data: org, error } = await supabase
    .from('organizations')
    .insert({
      name: data.name,
      sector: data.sector,
      language: data.language,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Update user profile with organization and language
  await supabase
    .from('user_profiles')
    .update({ 
      organization_id: org.id,
      language: data.language 
    })
    .eq('id', user.id);

  revalidatePath('/dashboard');
  return { data: org };
}

export async function getUserOrganization(): Promise<{ organization: Organization | null; profile: UserProfile | null; error?: string }> {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { organization: null, profile: null, error: 'User not found' };
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return { organization: null, profile: null, error: profileError.message };
  }

  if (!profile?.organization_id) {
    return { organization: null, profile, error: undefined };
  }

  // Get organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.organization_id)
    .single();

  if (orgError) {
    return { organization: null, profile, error: orgError.message };
  }

  return { organization: org, profile };
}

// User Profile Actions
export async function updateUserProfile(data: { full_name: string }) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: 'User not found' };
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({ full_name: data.full_name })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/settings');
  return { success: true };
}

export async function updateUserLanguage(language: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: 'User not found' };
  }

  // Update user profile language
  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({ language })
    .eq('id', user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  // Update organization language (if user is creator)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (profile?.organization_id) {
    await supabase
      .from('organizations')
      .update({ language })
      .eq('id', profile.organization_id)
      .eq('created_by', user.id); // Only update if user is creator
  }

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set('NEXT_LOCALE', language, { 
    path: '/', 
    maxAge: 31536000 // 1 year
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/settings');
  return { success: true };
}

// Candidate Actions
export async function createCandidate(data: Partial<Candidate>) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: 'User not found' };
  }

  const { organization } = await getUserOrganization();
  
  if (!organization) {
    return { error: 'Organization not found' };
  }

  const { data: candidate, error } = await supabase
    .from('candidates')
    .insert({
      organization_id: organization.id,
      created_by: user.id,
      department: data.department!,
      current_step: data.current_step || 1,
      cv_file_url: data.cv_file_url || null,
      cv_file_name: data.cv_file_name || null,
      evaluators: data.evaluators || null,
      evaluation_date: data.evaluation_date || null,
      step1_general: data.step1_general || {},
      step2_scores: data.step2_scores || {},
      step3_live_coding: data.step3_live_coding || {},
      final_evaluation: data.final_evaluation || {},
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  return { data: candidate };
}

export async function updateCandidate(id: string, data: Partial<Candidate>) {
  const supabase = await createServerSupabaseClient();
  
  const updateData: any = {};
  if (data.current_step !== undefined) updateData.current_step = data.current_step;
  if (data.department !== undefined) updateData.department = data.department;
  if (data.cv_file_url !== undefined) updateData.cv_file_url = data.cv_file_url;
  if (data.cv_file_name !== undefined) updateData.cv_file_name = data.cv_file_name;
  if (data.evaluators !== undefined) updateData.evaluators = data.evaluators;
  if (data.evaluation_date !== undefined) updateData.evaluation_date = data.evaluation_date;
  if (data.step1_general !== undefined) updateData.step1_general = data.step1_general;
  if (data.step2_scores !== undefined) updateData.step2_scores = data.step2_scores;
  if (data.step3_live_coding !== undefined) updateData.step3_live_coding = data.step3_live_coding;
  if (data.final_evaluation !== undefined) updateData.final_evaluation = data.final_evaluation;

  const { data: candidate, error } = await supabase
    .from('candidates')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/candidate/${id}`);
  return { data: candidate };
}

export async function deleteCandidate(id: string) {
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase
    .from('candidates')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function getCandidatesByOrg(): Promise<{ data: Candidate[] | null; error?: string }> {
  const supabase = await createServerSupabaseClient();
  
  const { organization } = await getUserOrganization();
  
  if (!organization) {
    return { data: null, error: 'Organization not found' };
  }

  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('organization_id', organization.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data };
}

export async function getCandidateById(id: string): Promise<{ data: Candidate | null; error?: string }> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data };
}

// Department Criteria Actions
export async function getOrganizationDepartmentCriteria(): Promise<{ data: OrganizationDepartmentCriteria[] | null; error?: string }> {
  const supabase = await createServerSupabaseClient();
  
  const { organization } = await getUserOrganization();
  
  if (!organization) {
    return { data: null, error: 'Organization not found' };
  }

  const { data, error } = await supabase
    .from('organization_department_criteria')
    .select('*')
    .eq('organization_id', organization.id)
    .order('department_name', { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data };
}

export async function getOrganizationDepartmentCriteriaById(departmentId: string): Promise<{ data: OrganizationDepartmentCriteria | null; error?: string }> {
  const supabase = await createServerSupabaseClient();
  
  const { organization } = await getUserOrganization();
  
  if (!organization) {
    return { data: null, error: 'Organization not found' };
  }

  const { data, error } = await supabase
    .from('organization_department_criteria')
    .select('*')
    .eq('organization_id', organization.id)
    .eq('department_id', departmentId)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data };
}

export async function upsertOrganizationDepartmentCriteria(data: {
  department_id: string;
  department_name: string;
  categories: Category[];
}) {
  const supabase = await createServerSupabaseClient();
  
  const { organization } = await getUserOrganization();
  
  if (!organization) {
    return { error: 'Organization not found' };
  }

  const { data: result, error } = await supabase
    .from('organization_department_criteria')
    .upsert({
      organization_id: organization.id,
      department_id: data.department_id,
      department_name: data.department_name,
      criteria: { categories: data.categories },
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'organization_id,department_id'
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/settings');
  return { data: result };
}

export async function deleteOrganizationDepartmentCriteria(departmentId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { organization } = await getUserOrganization();
  
  if (!organization) {
    return { error: 'Organization not found' };
  }

  const { error } = await supabase
    .from('organization_department_criteria')
    .delete()
    .eq('organization_id', organization.id)
    .eq('department_id', departmentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/settings');
  return { success: true };
}
