import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import { createServerSupabaseClient } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { policyFallbackContent, policyOrder, type PolicyType } from '@/config/policies';

export const metadata: Metadata = {
  title: 'Policies & GDPR | Developer Candidate Evaluation Platform',
  description:
    'Read our GDPR, privacy, and cookie policies to learn how we protect your data on the Developer Candidate Evaluation Platform.',
};

export default async function PoliciesPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('policies')
    .select('policy_type, content, updated_at')
    .in('policy_type', policyOrder)
    .order('policy_type', { ascending: true });

  const policyMap = new Map<PolicyType, { content: string; updatedAt: string }>(
    policyOrder.map((type) => [type, { content: policyFallbackContent[type], updatedAt: new Date().toISOString() }])
  );

  if (!error && data) {
    data.forEach((policy) => {
      policyMap.set(policy.policy_type as PolicyType, {
        content: policy.content,
        updatedAt: policy.updated_at ?? new Date().toISOString(),
      });
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-5xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Policies & Compliance</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transparency matters. Review our GDPR, privacy, and cookie policies to understand how we protect your data and ensure compliance.
          </p>
        </div>

        <Tabs defaultValue="gdpr" className="w-full">
          <TabsList className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-white border border-gray-200">
            <TabsTrigger value="gdpr">GDPR</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="cookies">Cookie Policy</TabsTrigger>
          </TabsList>

          {policyOrder.map((type) => {
            const policy = policyMap.get(type)!;
            const updatedLabel = policy.updatedAt
              ? format(new Date(policy.updatedAt), 'PPP')
              : 'Not specified';

            return (
              <TabsContent key={type} value={type} id={type} className="mt-4">
                <Card className="border border-gray-200 bg-white shadow-sm">
                  <CardContent className="p-6 prose prose-gray max-w-none">
                    <p className="text-xs text-gray-500 mb-4">Last updated: {updatedLabel}</p>
                    <ReactMarkdown>{policy.content}</ReactMarkdown>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
