import { Header } from '@/components/shared/Header';
import { getUserOrganization } from '@/lib/actions';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { organization, profile } = await getUserOrganization();

  if (!organization) {
    redirect('/onboarding');
  }

  return (
    <>
      <Header organization={organization} profile={profile} />
      <main className="container mx-auto px-4 py-8 flex-1">
        {children}
      </main>
    </>
  );
}
