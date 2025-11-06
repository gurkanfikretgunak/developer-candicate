import { getCandidateById } from '@/lib/actions';
import { CandidateForm } from '@/components/candidate/CandidateForm';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CandidatePage({ params }: PageProps) {
  const { id } = await params;
  const isNew = id === 'new';

  let candidate = null;

  if (!isNew) {
    const result = await getCandidateById(id);
    if (result.error || !result.data) {
      notFound();
    }
    candidate = result.data;
  }

  return <CandidateForm candidate={candidate} isNew={isNew} />;
}

