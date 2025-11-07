'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export interface ApplicationFormState {
  status: 'idle' | 'success' | 'error';
  message?: string;
}

interface ApplicationFormProps {
  action: (prevState: ApplicationFormState, formData: FormData) => Promise<ApplicationFormState>;
}

export function ApplicationForm({ action }: ApplicationFormProps) {
  const [state, formAction] = useActionState(action, { status: 'idle' });
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
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
    <Card className="shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <form ref={formRef} action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" placeholder="Jane Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="jane@example.com" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Preferred role</Label>
              <Input id="role" name="role" placeholder="Senior Frontend Engineer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio URL</Label>
              <Input id="portfolio" name="portfolio" type="url" placeholder="https://github.com/username" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover letter</Label>
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
            <DialogTitle>Application received</DialogTitle>
            <DialogDescription>
              Thank you for applying! We&apos;ll review your application and reach out if it&apos;s a fit.
              You&apos;ll be redirected shortly.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full md:w-auto" disabled={pending}>
      {pending ? 'Submitting application...' : 'Submit application'}
    </Button>
  );
}
