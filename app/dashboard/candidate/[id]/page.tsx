import { getCandidateById } from '@/lib/actions';
import { CandidateForm } from '@/components/candidate/CandidateForm';
import { CandidateFormSkeleton } from '@/components/shared/Skeletons';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase';
import type { Step1Data } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ applicationId?: string }>;
}

async function CandidateFormWrapper({ 
  id, 
  isNew, 
  applicationId 
}: { 
  id: string; 
  isNew: boolean; 
  applicationId?: string;
}) {
  let candidate = null;
  let prefillStep1: Step1Data | undefined;

  if (!isNew) {
    const result = await getCandidateById(id);
    if (result.error || !result.data) {
      notFound();
    }
    candidate = result.data;
  } else if (applicationId) {
    const supabase = await createServerSupabaseClient();
    const { data: application } = await supabase
      .from('public_applications')
      .select('name, email, role, cover_letter')
      .eq('id', applicationId)
      .single();

    if (application) {
      prefillStep1 = {
        name: application.name || undefined,
        email: application.email || undefined,
        position: application.role || undefined,
        notes: application.cover_letter || undefined,
        evaluationDate: new Date().toISOString().split('T')[0],
      };
    }
  }

  return (
    <CandidateForm
      candidate={candidate}
      isNew={isNew}
      prefillStep1={prefillStep1}
      applicationId={applicationId}
    />
  );
}

export default async function CandidatePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const isNew = id === 'new';
  const applicationId = query?.applicationId;

  return (
    <Suspense fallback={<CandidateFormSkeleton />}>
      <CandidateFormWrapper 
        id={id} 
        isNew={isNew} 
        applicationId={applicationId}
      />
    </Suspense>
  );
}

