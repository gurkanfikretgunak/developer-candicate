import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getJobsByOrg, deleteJob, getJobsStats } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobForm } from '@/components/jobs/JobForm';
import { JobsList } from '@/components/jobs/JobsList';
import { JobsListSkeleton, JobsStatsSkeleton } from '@/components/shared/Skeletons';
import { Plus, Briefcase, BarChart3 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Job Postings | Developer Candidate Evaluation Platform',
};

async function JobsStatsWrapper() {
  const { data: stats, error } = await getJobsStats();

  if (error || !stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
        <div className="text-xs text-blue-600 mt-1">Total Jobs</div>
      </div>
      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
        <div className="text-2xl font-bold text-green-700">{stats.active}</div>
        <div className="text-xs text-green-600 mt-1">Active</div>
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div className="text-2xl font-bold text-gray-700">{stats.closed}</div>
        <div className="text-xs text-gray-600 mt-1">Closed</div>
      </div>
      <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
        <div className="text-2xl font-bold text-yellow-700">{stats.draft}</div>
        <div className="text-xs text-yellow-600 mt-1">Draft</div>
      </div>
      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
        <div className="text-2xl font-bold text-purple-700">{stats.applications}</div>
        <div className="text-xs text-purple-600 mt-1">Applications</div>
      </div>
    </div>
  );
}

async function JobsListWrapper() {
  const { data: jobs, error } = await getJobsByOrg();

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  return <JobsList jobs={jobs || []} />;
}

export default async function JobsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const t = await getTranslations('dashboard.jobs');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <JobForm
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('addJob')}
            </Button>
          }
        />
      </div>

      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Job Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<JobsStatsSkeleton />}>
            <JobsStatsWrapper />
          </Suspense>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Suspense fallback={<JobsListSkeleton />}>
            <JobsListWrapper />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

