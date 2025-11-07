import { getActiveJobs } from '@/lib/actions';
import { JobsSection } from '@/components/hiring/JobsSection';

export async function HomeJobsSection() {
  const { data: jobs, error } = await getActiveJobs();
  
  if (error) {
    console.error('Error fetching jobs:', error);
    return null;
  }
  
  if (!jobs || jobs.length === 0) {
    return null;
  }

  return <JobsSection jobs={jobs} />;
}

