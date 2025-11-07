import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase';
import { ApplicationForm, type ApplicationFormState } from '@/components/hiring/ApplicationForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Globe, HeartHandshake, Users } from 'lucide-react';
import { validateAndSanitizeUrl } from '@/lib/url-security';

export const metadata: Metadata = {
  title: 'Join Our Team | Developer Candidate Evaluation Platform',
  description:
    'Apply to join the Developer Candidate Evaluation Platform team. Help teams hire better with structured, data-driven processes.',
};

async function submitApplication(
  _prevState: ApplicationFormState,
  formData: FormData
): Promise<ApplicationFormState> {
  'use server';

  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().trim();
  const role = formData.get('role')?.toString().trim() || null;
  const portfolioUrlRaw = formData.get('portfolio')?.toString().trim() || null;
  const coverLetter = formData.get('coverLetter')?.toString().trim() || null;

  if (!name || !email) {
    return {
      status: 'error',
      message: 'Name and email are required.',
    };
  }

  // Validate and sanitize portfolio URL if provided
  let portfolioUrl: string | null = null;
  if (portfolioUrlRaw) {
    const urlValidation = validateAndSanitizeUrl(portfolioUrlRaw);
    if (!urlValidation.isValid || !urlValidation.sanitizedUrl) {
      return {
        status: 'error',
        message: `Invalid portfolio URL: ${urlValidation.error || 'Please provide a valid URL'}`,
      };
    }
    portfolioUrl = urlValidation.sanitizedUrl;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('public_applications').insert({
      name,
      email,
      role,
      portfolio_url: portfolioUrl,
      cover_letter: coverLetter,
    });

    if (error) {
      console.error('Failed to submit application', error);
      return {
        status: 'error',
        message: 'Something went wrong. Please try again later.',
      };
    }

    return {
      status: 'success',
      message: 'Thanks for applying! We will review your application and get back to you soon.',
    };
  } catch (error) {
    console.error('Unexpected error submitting application', error);
    return {
      status: 'error',
      message: 'Unexpected error. Please try again.',
    };
  }
}

const values = [
  {
    icon: Globe,
    title: 'Global impact',
    description:
      'Help organizations around the world create fair and objective hiring workflows.',
  },
  {
    icon: Users,
    title: 'Collaborative culture',
    description:
      'We work in small, autonomous teams that value mentorship, learning, and feedback.',
  },
  {
    icon: HeartHandshake,
    title: 'Human-centered hiring',
    description:
      'Build products that put candidates first and empower hiring teams to make better decisions.',
  },
];

const benefits = [
  'Remote-first team with flexible schedules',
  'Budget for conferences, books, and learning resources',
  'Cutting-edge stack (Next.js, Supabase, React, Tailwind)',
  'Transparent roadmap and collaborative planning',
];

export default function HiringPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <Badge className="mb-4">We&apos;re hiring</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Join the team building the future of candidate evaluation
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            We&apos;re looking for product-minded engineers, designers, and hiring specialists who
            care about building fair, human-centered hiring experiences. Help teams make better
            decisions with structured, data-driven processes.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-6xl grid gap-8 py-16 md:grid-cols-[2fr_3fr]">
        <div className="space-y-8">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Why work with us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {values.map((value) => (
                <div key={value.title} className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-700">
                    <value.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{value.title}</h3>
                    <p className="text-sm text-gray-600">{value.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">What you&apos;ll get</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Apply now</h2>
            <p className="text-sm text-gray-600">
              Tell us about your background, the kind of problems you like solving, and links to any
              work you&apos;re proud of. We review every application carefully.
            </p>
          </div>
          <ApplicationForm action={submitApplication} />
        </div>
      </section>
    </div>
  );
}
