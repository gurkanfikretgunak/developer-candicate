'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobForm } from './JobForm';
import { deleteJob } from '@/lib/actions';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Edit, Trash2, Briefcase, Plus } from 'lucide-react';
import type { Job } from '@/lib/types';
import { departments } from '@/src/config/assessment';

interface JobsListProps {
  jobs: Job[];
}

export function JobsList({ jobs }: JobsListProps) {
  const router = useRouter();
  const t = useTranslations('dashboard.jobs');
  const tDept = useTranslations('departments');
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find((d) => d.id === departmentId);
    if (dept?.nameKey) {
      return tDept(dept.nameKey.split('.')[1] as any);
    }
    return dept?.name || departmentId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormOpen(true);
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm(t('deleteConfirm'))) {
      return;
    }

    setDeletingId(jobId);
    try {
      const result = await deleteJob(jobId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t('deleteSuccess'));
        router.refresh();
      }
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setDeletingId(null);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="p-10 text-center">
        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-sm text-gray-600 mb-4">{t('noJobs')}</p>
        <JobForm
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('createJob')}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-gray-200">
        {jobs.map((job) => (
          <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <Badge className={getStatusColor(job.status)}>{t(job.status)}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span>
                    <strong>{t('department')}:</strong> {getDepartmentName(job.department)}
                  </span>
                  {job.location && (
                    <span>
                      <strong>{t('location')}:</strong> {job.location}
                    </span>
                  )}
                  {job.employment_type && (
                    <span>
                      <strong>{t('employmentType')}:</strong> {t(job.employment_type)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{job.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    {t('createdAt')}: {format(new Date(job.created_at), 'PPP')}
                  </span>
                  {job.updated_at !== job.created_at && (
                    <span>
                      {t('updatedAt')}: {format(new Date(job.updated_at), 'PPP')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(job)}
                  disabled={deletingId === job.id}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {t('editJob')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(job.id)}
                  disabled={deletingId === job.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t('deleteJob')}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <JobForm job={editingJob} open={formOpen} onOpenChange={setFormOpen} />
    </>
  );
}

