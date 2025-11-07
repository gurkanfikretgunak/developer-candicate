import { Suspense } from 'react';
import { HeroContent } from '@/components/home/HeroContent';
import { HomeJobsSection } from '@/components/home/HomeJobsSection';
import { HomeJobsSectionSkeleton } from '@/components/shared/Skeletons';

export default function Home() {
  return (
    <HeroContent>
      <Suspense fallback={<HomeJobsSectionSkeleton />}>
        <HomeJobsSection />
      </Suspense>
    </HeroContent>
  );
}
