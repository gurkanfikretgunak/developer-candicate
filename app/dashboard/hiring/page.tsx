import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { SafePortfolioLink } from '@/components/hiring/SafePortfolioLink';
import { ApplicationItemSkeleton } from '@/components/shared/Skeletons';

export const metadata: Metadata = {
  title: 'Hiring Applications | Developer Candidate Evaluation Platform',
};

async function ApplicationsList() {
  const supabase = await createServerSupabaseClient();
  const { data: applications, error } = await supabase
    .from('public_applications')
    .select('id, name, email, role, portfolio_url, cover_letter, created_at, candidate_id, converted_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load applications', error);
  }

  if ((applications ?? []).length === 0) {
    return (
      <div className="py-10 text-center text-sm text-gray-600">
        No applications yet. Share the public hiring link to start collecting inbound interest.
      </div>
    );
  }

  return (
    <>
      {applications!.map((application) => (
        <div key={application.id} className="p-6 grid gap-3 md:grid-cols-[1fr_1fr]">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900">{application.name}</p>
            <p className="text-sm text-gray-600">{application.email}</p>
            {application.role && (
              <p className="text-sm text-gray-600">Preferred role: {application.role}</p>
            )}
            <p className="text-xs text-gray-500">
              Submitted on {format(new Date(application.created_at), 'PPP p')}
            </p>
          </div>

          <div className="space-y-2">
            {application.portfolio_url && (
              <SafePortfolioLink url={application.portfolio_url} />
            )}
            {application.cover_letter ? (
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {application.cover_letter}
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic">No cover letter provided.</p>
            )}
            <div className="pt-2">
              {application.candidate_id ? (
                <Button size="sm" variant="outline" disabled>
                  Candidate created
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link href={`/dashboard/candidate/new?applicationId=${application.id}`}>
                    Start candidate evaluation
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default async function HiringApplicationsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-900">
            Hiring applications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            <Suspense
              fallback={
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ApplicationItemSkeleton key={i} />
                  ))}
                </>
              }
            >
              <ApplicationsList />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
