'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { Job } from '@/lib/types';
import { departments } from '@/src/config/assessment';
import { createJob, updateJob } from '@/lib/actions';

interface JobFormProps {
  job?: Job | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function JobForm({ job, open: controlledOpen, onOpenChange, trigger }: JobFormProps) {
  const router = useRouter();
  const t = useTranslations('dashboard.jobs');
  const tDept = useTranslations('departments');
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    requirements: '',
    location: '',
    employment_type: '' as 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote' | 'hybrid' | '',
    status: 'active' as 'active' | 'closed' | 'draft',
  });

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        department: job.department || '',
        description: job.description || '',
        requirements: job.requirements || '',
        location: job.location || '',
        employment_type: job.employment_type || '',
        status: job.status || 'draft',
      });
    } else {
      setFormData({
        title: '',
        department: '',
        description: '',
        requirements: '',
        location: '',
        employment_type: '',
        status: 'active',
      });
    }
  }, [job, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (job) {
        const result = await updateJob(job.id, {
          ...formData,
          employment_type: formData.employment_type || undefined,
        });
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(t('saveSuccess'));
          setOpen(false);
          router.refresh();
        }
      } else {
        const result = await createJob({
          ...formData,
          employment_type: formData.employment_type || undefined,
        });
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(t('saveSuccess'));
          setOpen(false);
          router.refresh();
        }
      }
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {trigger && (
        <div onClick={() => setOpen(true)} className="inline-block">
          {trigger}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job ? t('editJob') : t('createJob')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('jobTitle')} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">{t('department')} *</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
              required
            >
              <SelectTrigger id="department">
                <SelectValue placeholder={t('department')} />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.nameKey ? tDept(dept.nameKey.split('.')[1] as any) : dept.name || ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('description')} *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">{t('requirements')}</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              rows={4}
              placeholder="List key requirements, skills, and qualifications..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">{t('location')}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Remote, Istanbul, New York"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employment_type">{t('employmentType')}</Label>
              <Select
                value={formData.employment_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, employment_type: value as any })
                }
              >
                <SelectTrigger id="employment_type">
                  <SelectValue placeholder={t('employmentType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">{t('fullTime')}</SelectItem>
                  <SelectItem value="part-time">{t('partTime')}</SelectItem>
                  <SelectItem value="contract">{t('contract')}</SelectItem>
                  <SelectItem value="internship">{t('internship')}</SelectItem>
                  <SelectItem value="remote">{t('remote')}</SelectItem>
                  <SelectItem value="hybrid">{t('hybrid')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{t('status')}</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as 'active' | 'closed' | 'draft' })
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{t('draft')}</SelectItem>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="closed">{t('closed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}

