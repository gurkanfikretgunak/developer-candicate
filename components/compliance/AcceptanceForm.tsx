'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';

interface AcceptanceFormProps {
  action: (prevState: AcceptanceFormState, formData: FormData) => Promise<AcceptanceFormState>;
  policiesUrl?: string;
}

export interface AcceptanceFormState {
  status: 'idle' | 'success' | 'error';
  message?: string;
}

export function AcceptanceForm({ action, policiesUrl = '/policies' }: AcceptanceFormProps) {
  const [state, formAction] = useActionState(action, { status: 'idle' } as AcceptanceFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const [gdprChecked, setGdprChecked] = useState(false);
  const [cookiesChecked, setCookiesChecked] = useState(false);

  useEffect(() => {
    if (state.status === 'success') {
      toast.success(state.message ?? 'Preferences updated');
    } else if (state.status === 'error' && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="gdpr-compliance"
            name="gdpr"
            checked={gdprChecked}
            onCheckedChange={(checked) => setGdprChecked(Boolean(checked))}
            className="mt-0.5"
          />
          <Label htmlFor="gdpr-compliance" className="text-sm text-gray-700 cursor-pointer flex-1">
            I have read and accept the GDPR policy.{' '}
            <Link href={`${policiesUrl}#gdpr`} className="underline text-blue-600 hover:text-blue-800" onClick={(e) => e.stopPropagation()}>
              View policy
            </Link>
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="cookies-compliance"
            name="cookies"
            checked={cookiesChecked}
            onCheckedChange={(checked) => setCookiesChecked(Boolean(checked))}
            className="mt-0.5"
          />
          <Label htmlFor="cookies-compliance" className="text-sm text-gray-700 cursor-pointer flex-1">
            I consent to the cookie policy required to use the platform.{' '}
            <Link href={`${policiesUrl}#cookies`} className="underline text-blue-600 hover:text-blue-800" onClick={(e) => e.stopPropagation()}>
              View policy
            </Link>
          </Label>
        </div>
      </div>

      <SubmitButton disabled={!gdprChecked || !cookiesChecked} />
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled} className="w-full md:w-auto">
      {pending ? 'Saving...' : 'Accept and continue'}
    </Button>
  );
}
