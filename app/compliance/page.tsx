import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { createServerSupabaseClient } from '@/lib/supabase';
import { AcceptanceForm, type AcceptanceFormState } from '@/components/compliance/AcceptanceForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { policyFallbackContent, policyOrder, type PolicyType } from '@/config/policies';

export const metadata: Metadata = {
  title: 'Compliance & Consent | Developer Candidate Evaluation Platform',
  description: 'Review and accept GDPR and cookie policies to continue using the Developer Candidate Evaluation Platform.',
};

async function acceptPolicies(
  _prevState: AcceptanceFormState,
  formData: FormData
): Promise<AcceptanceFormState> {
  'use server';

  const gdprAccepted = formData.get('gdpr') !== null;
  const cookiesAccepted = formData.get('cookies') !== null;

  if (!gdprAccepted || !cookiesAccepted) {
    return {
      status: 'error',
      message: 'You must accept both GDPR and cookie policies to continue.',
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: 'error',
      message: 'You need to be signed in to continue.',
    };
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('user_profiles')
    .update({
      gdpr_accepted_at: now,
      cookies_accepted_at: now,
    })
    .eq('id', user.id);

  if (error) {
    console.error('Failed to update acceptance timestamps', error);
    return {
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    };
  }

  redirect(profile?.organization_id ? '/dashboard' : '/onboarding');
}

export default async function CompliancePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('gdpr_accepted_at, cookies_accepted_at')
    .eq('id', user!.id)
    .single();

  if (profile?.gdpr_accepted_at && profile.cookies_accepted_at) {
    redirect('/dashboard');
  }

  const { data, error } = await supabase
    .from('policies')
    .select('policy_type, content, updated_at')
    .in('policy_type', policyOrder)
    .order('policy_type', { ascending: true });

  const policies = new Map<PolicyType, { content: string; updatedAt?: string }>(
    policyOrder.map((type) => [type, { content: policyFallbackContent[type] }])
  );

  if (!error && data) {
    data.forEach((policy) => {
      policies.set(policy.policy_type as PolicyType, {
        content: policy.content,
        updatedAt: policy.updated_at ?? undefined,
      });
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl space-y-10">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Confirm your preferences</h1>
          <p className="text-gray-600">
            To continue, review our GDPR and cookie policies and confirm that you accept them.
          </p>
        </div>

        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Review policies</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="gdpr" className="w-full">
              <TabsList className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-gray-100">
                <TabsTrigger value="gdpr">GDPR</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="cookies">Cookie Policy</TabsTrigger>
              </TabsList>

              {policyOrder.map((type) => {
                const policy = policies.get(type)!;
                return (
                  <TabsContent key={type} value={type} id={type} className="mt-4">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{policy.content}</ReactMarkdown>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <AcceptanceForm action={acceptPolicies} policiesUrl="/policies" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
