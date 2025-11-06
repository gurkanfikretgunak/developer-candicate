'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import type { Organization, Candidate, UserProfile } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// Organization Actions
export async function createOrganization(data: { name: string; sector: string }) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: 'Kullanıcı bulunamadı' };
  }

  const { data: org, error } = await supabase
    .from('organizations')
    .insert({
      name: data.name,
      sector: data.sector,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Update user profile with organization
  await supabase
    .from('user_profiles')
    .update({ organization_id: org.id })
    .eq('id', user.id);

  revalidatePath('/dashboard');
  return { data: org };
}

export async function getUserOrganization(): Promise<{ organization: Organization | null; profile: UserProfile | null; error?: string }> {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { organization: null, profile: null, error: 'Kullanıcı bulunamadı' };
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

// Candidate Actions
export async function createCandidate(data: Partial<Candidate>) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: 'Kullanıcı bulunamadı' };
  }

  const { organization } = await getUserOrganization();
  
  if (!organization) {
    return { error: 'Organizasyon bulunamadı' };
  }

  const { data: candidate, error } = await supabase
    .from('candidates')
    .insert({
      organization_id: organization.id,
      created_by: user.id,
      department: data.department!,
      current_step: data.current_step || 1,
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
    return { data: null, error: 'Organizasyon bulunamadı' };
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

