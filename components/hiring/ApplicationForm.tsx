'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Job } from '@/lib/types';
import { departments } from '@/src/config/assessment';

export interface ApplicationFormState {
  status: 'idle' | 'success' | 'error';
  message?: string;
}

interface ApplicationFormProps {
  action: (prevState: ApplicationFormState, formData: FormData) => Promise<ApplicationFormState>;
  jobs?: Job[];
}

export function ApplicationForm({ action, jobs = [] }: ApplicationFormProps) {
  const [state, formAction] = useActionState(action, { status: 'idle' });
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('none');
  const t = useTranslations('hiring.form');
  const tDept = useTranslations('departments');

  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find((d) => d.id === departmentId);
    if (dept?.nameKey) {
      return tDept(dept.nameKey.split('.')[1] as any);
    }
    return dept?.name || departmentId;
  };

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
      setSelectedJobId('none');
      setOpen(true);
      const timeout = setTimeout(() => {
        setOpen(false);
        router.push('/');
      }, 3000);
      return () => clearTimeout(timeout);
    }

    if (state.status === 'error' && state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <>
    <Card className="shadow-sm border-2 border-gray-200 transition-all duration-300" id="apply-now">
      <CardContent className="p-6">
        <form ref={formRef} action={formAction} className="space-y-6">
          {jobs.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="jobId">{t('selectJob')}</Label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger id="jobId" name="jobId">
                  <SelectValue placeholder={t('selectJob')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General Application</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} - {getDepartmentName(job.department)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="jobId" value={selectedJobId === 'none' ? '' : selectedJobId} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('fullName')}</Label>
              <Input id="name" name="name" placeholder="Jane Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" name="email" type="email" placeholder="jane@example.com" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">{t('role')}</Label>
              <Input id="role" name="role" placeholder="Senior Frontend Engineer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio">{t('portfolio')}</Label>
              <Input id="portfolio" name="portfolio" type="url" placeholder="https://github.com/username" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverLetter">{t('coverLetter')}</Label>
            <Textarea
              id="coverLetter"
              name="coverLetter"
              placeholder="Tell us about yourself, your experience, and why you want to work with us."
              rows={6}
            />
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('successTitle')}</DialogTitle>
            <DialogDescription>
              {t('successMessage')}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations('hiring.form');

  return (
    <Button type="submit" className="w-full md:w-auto" disabled={pending}>
      {pending ? t('submitting') : t('submit')}
    </Button>
  );
}
