import { getCandidatesByOrg } from '@/lib/actions';
import { EmptyState } from '@/components/shared/EmptyState';
import { CandidateCard } from '@/components/shared/CandidateCard';
import { RefreshButton } from '@/components/shared/RefreshButton';
import { CandidateListSkeleton } from '@/components/shared/Skeletons';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

async function CandidatesList() {
  const { data: candidates } = await getCandidatesByOrg();
  const t = await getTranslations('dashboard');

  if (!candidates || candidates.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {candidates.map((candidate) => (
        <CandidateCard key={candidate.id} candidate={candidate} />
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');

  const descriptionParagraphs = [
    t.rich('description.line1', {
      standardize: (chunks) => (
        <strong className="font-semibold text-gray-900">{chunks}</strong>
      ),
      objective: (chunks) => (
        <strong className="font-semibold text-gray-900">{chunks}</strong>
      ),
    }),
    t.rich('description.line2', {
      fourStep: (chunks) => (
        <span className="font-semibold text-blue-700 underline decoration-blue-400 decoration-2">
          {chunks}
        </span>
      ),
      technical: (chunks) => (
        <strong className="font-semibold text-gray-900">{chunks}</strong>
      ),
      liveCoding: (chunks) => (
        <strong className="font-semibold text-gray-900">{chunks}</strong>
      ),
      final: (chunks) => (
        <span className="font-semibold text-indigo-700">{chunks}</span>
      ),
    }),
    t.rich('description.line3', {
      recorded: (chunks) => (
        <strong className="font-semibold text-gray-900">{chunks}</strong>
      ),
      anytime: (chunks) => (
        <span className="font-semibold text-blue-700">{chunks}</span>
      ),
    }),
  ];

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-6 shadow-sm">
        <div className="text-gray-700 leading-relaxed text-sm space-y-2">
          {descriptionParagraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton />
          <Link href="/dashboard/candidate/new">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              {t('addCandidate')}
            </Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<CandidateListSkeleton />}>
        <CandidatesList />
      </Suspense>
    </div>
  );
}
