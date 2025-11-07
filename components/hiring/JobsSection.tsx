'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import type { Job } from '@/lib/types';
import { departments } from '@/src/config/assessment';
import Link from 'next/link';

interface JobsSectionProps {
  jobs: Job[];
}

export function JobsSection({ jobs }: JobsSectionProps) {
  const t = useTranslations('hiring.jobs');
  const tDept = useTranslations('departments');
  const pathname = usePathname();

  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find((d) => d.id === departmentId);
    if (dept?.nameKey) {
      return tDept(dept.nameKey.split('.')[1] as any);
    }
    return dept?.name || departmentId;
  };

  const handleApplyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // If on homepage, redirect to hiring page
    if (pathname === '/') {
      window.location.href = '/hiring#apply-now';
      return;
    }
    // If on hiring page, scroll to form
    const formElement = document.getElementById('apply-now');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        formElement.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
        const firstInput = formElement.querySelector('input, textarea, select') as HTMLElement;
        if (firstInput) {
          firstInput.focus();
        }
        setTimeout(() => {
          formElement.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
        }, 3000);
      }, 500);
    }
  };

  if (jobs.length === 0) {
    return null;
  }

  const activeJobsCount = jobs.filter((j) => j.status === 'active').length;

  return (
    <div className="space-y-4">
      <div className="text-left">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
          {activeJobsCount > 0 && (
            <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5">
              {activeJobsCount} {activeJobsCount === 1 ? 'Position' : 'Positions'}
            </Badge>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-1">{t('subtitle')}</p>
        <p className="text-xs text-gray-500 max-w-xl">
          {t('description')}
        </p>
      </div>
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <Briefcase className="h-5 w-5 text-blue-600 flex-shrink-0" />
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {getDepartmentName(job.department)}
                  </Badge>
                  {job.location && (
                    <Badge variant="outline" className="text-xs">
                      {job.location}
                    </Badge>
                  )}
                  {job.employment_type && (
                    <Badge variant="outline" className="text-xs">
                      {job.employment_type}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>
                {job.organization && (
                  <p className="text-xs text-gray-500 mb-3">
                    {t('postedBy')} <span className="font-semibold text-gray-700">{job.organization.name}</span>
                    {t('postedBySuffix') && ` ${t('postedBySuffix')}`}
                  </p>
                )}
                <Link
                  href={pathname === '/' ? '/hiring#apply-now' : '#apply-now'}
                  onClick={handleApplyClick}
                  className="inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {t('apply')} →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      {pathname === '/' && (
        <div className="pt-4">
          <Link href="/hiring">
            <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all">
              {t('joinTeam')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

