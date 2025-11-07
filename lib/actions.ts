'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import type { Organization, Candidate, UserProfile, OrganizationDepartmentCriteria, Category, Job } from '@/lib/types';
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
export async function createCandidate(data: Partial<Candidate>, applicationId?: string) {
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

  if (candidate && applicationId) {
    await supabase
      .from('public_applications')
      .update({
        candidate_id: candidate.id,
        converted_at: new Date().toISOString(),
      })
      .eq('id', applicationId);
    revalidatePath('/dashboard/hiring');
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

// Jobs Actions
export async function getJobsByOrg(): Promise<{ data: Job[] | null; error?: string }> {
  const supabase = await createServerSupabaseClient();
  
  const { organization } = await getUserOrganization();
  
  if (!organization) {
    return { data: null, error: 'Organization not found' };
  }

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('organization_id', organization.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data };
}

export async function getActiveJobs(): Promise<{ data: Job[] | null; error?: string }> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      organizations!inner (
        id,
        name
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  // Transform the data to match Job interface
  const jobs = data?.map((job: any) => ({
    ...job,
    organization: job.organizations ? {
      id: job.organizations.id,
      name: job.organizations.name,
    } : null,
  })) || [];

  return { data: jobs };
}

export async function createJob(data: {
  title: string;
  department: string;
  description: string;
  requirements?: string;
  location?: string;
  employment_type?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote' | 'hybrid';
  status?: 'active' | 'closed' | 'draft';
}): Promise<{ data: Job | null; error?: string }> {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { data: null, error: 'User not found' };
  }

  const { organization } = await getUserOrganization();
  
  if (!organization) {
    return { data: null, error: 'Organization not found' };
  }

  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      organization_id: organization.id,
      title: data.title,
      department: data.department,
      description: data.description,
      requirements: data.requirements || null,
      location: data.location || null,
      employment_type: data.employment_type || null,
      status: data.status || 'active',
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/dashboard/hiring/jobs');
  revalidatePath('/hiring');
  revalidatePath('/');
  return { data: job };
}

export async function updateJob(
  jobId: string,
  data: {
    title?: string;
    department?: string;
    description?: string;
    requirements?: string;
    location?: string;
    employment_type?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote' | 'hybrid';
    status?: 'active' | 'closed' | 'draft';
  }
): Promise<{ data: Job | null; error?: string }> {
  const supabase = await createServerSupabaseClient();
  
  const { organization } = await getUserOrganization();
  
  if (!organization) {
    return { data: null, error: 'Organization not found' };
  }

  const { data: job, error } = await supabase
    .from('jobs')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .eq('organization_id', organization.id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/dashboard/hiring/jobs');
  revalidatePath('/hiring');
  revalidatePath('/');
  return { data: job };
}

export async function deleteJob(jobId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  
  const { organization } = await getUserOrganization();
  
  if (!organization) {
    return { success: false, error: 'Organization not found' };
  }

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId)
    .eq('organization_id', organization.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/hiring/jobs');
  revalidatePath('/hiring');
  revalidatePath('/');
  return { success: true };
}

export async function getJobsStats(): Promise<{
  data: {
    total: number;
    active: number;
    closed: number;
    draft: number;
    applications: number;
  } | null;
  error?: string;
}> {
  const supabase = await createServerSupabaseClient();
  
  const { organization } = await getUserOrganization();
  
  if (!organization) {
    return { data: null, error: 'Organization not found' };
  }

  // Get jobs stats
  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('id, status')
    .eq('organization_id', organization.id);

  if (jobsError) {
    return { data: null, error: jobsError.message };
  }

  const stats = {
    total: jobs?.length || 0,
    active: jobs?.filter((j) => j.status === 'active').length || 0,
    closed: jobs?.filter((j) => j.status === 'closed').length || 0,
    draft: jobs?.filter((j) => j.status === 'draft').length || 0,
    applications: 0,
  };

  // Get applications count for jobs with job_id
  if (jobs && jobs.length > 0) {
    const jobIds = jobs.map((j) => j.id).filter(Boolean);
    const { count, error: appsError } = await supabase
      .from('public_applications')
      .select('*', { count: 'exact', head: true })
      .in('job_id', jobIds);

    if (!appsError && count !== null) {
      stats.applications = count;
    }
  }

  return { data: stats };
}

// Account Deletion Actions
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, error: 'User not found' };
  }

  const { organization } = await getUserOrganization();

  try {
    // If user has an organization, delete related data
    if (organization) {
      // Get all job IDs for this organization
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('organization_id', organization.id);

      // Delete public applications linked to organization's jobs
      if (jobs && jobs.length > 0) {
        const jobIds = jobs.map((j) => j.id);
        await supabase
          .from('public_applications')
          .delete()
          .in('job_id', jobIds);
      }

      // Delete organization (this will cascade delete:
      // - organization_department_criteria
      // - jobs (which we already handled applications for)
      // - candidates
      // - user_profiles will have organization_id set to NULL)
      const { error: orgError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', organization.id);

      if (orgError) {
        return { success: false, error: orgError.message };
      }
    }

    // Delete user profile (if organization was deleted, this might already be handled)
    await supabase
      .from('user_profiles')
      .delete()
      .eq('id', user.id);

    // Sign out the user
    // Note: Auth user deletion requires admin privileges
    // All user data has been deleted, user can delete auth account through Supabase dashboard if needed
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      return { success: false, error: signOutError.message };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete account' };
  }
}
