import { getCandidatesByOrg } from '@/lib/actions';
import { EmptyState } from '@/components/shared/EmptyState';
import { CandidateCard } from '@/components/shared/CandidateCard';
import { RefreshButton } from '@/components/shared/RefreshButton';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage() {
  const { data: candidates } = await getCandidatesByOrg();
  const t = await getTranslations('dashboard');

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-6 shadow-sm">
        <div className="text-gray-700 leading-relaxed text-sm space-y-2">
          <p>
            Bu platform, işe alım sürecinizi <strong className="font-bold text-gray-900">standartlaştırarak</strong> adayları{' '}
            <strong className="font-bold text-gray-900">objektif kriterlere</strong> göre değerlendirmenizi sağlar.
          </p>
          <p>
            Her aday için <span className="font-semibold text-blue-700 underline decoration-blue-400 decoration-2">4 adımlı detaylı</span> bir değerlendirme süreci izleyebilir,{' '}
            <strong className="font-bold text-gray-900">teknik ve davranışsal yetkinlikleri</strong> puanlayabilir,{' '}
            <strong className="font-bold text-gray-900">live coding performansını</strong> ölçebilir ve{' '}
            <span className="font-semibold text-indigo-700">nihai kararınızı</span> raporlayabilirsiniz.
          </p>
          <p>
            Tüm değerlendirme süreciniz <strong className="font-bold text-gray-900">kayıt altında</strong> tutulur ve{' '}
            <span className="font-semibold text-blue-700">istediğiniz zaman raporlanabilir.</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('subtitle')}
          </p>
        </div>
        {candidates && candidates.length > 0 && (
          <div className="flex items-center gap-2">
            <RefreshButton />
            <Link href="/dashboard/candidate/new">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                {t('addCandidate')}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {!candidates || candidates.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      )}
    </div>
  );
}
