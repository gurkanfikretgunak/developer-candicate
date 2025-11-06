'use client';

import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function EmptyState() {
  const t = useTranslations('dashboard.empty');

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-4 bg-gray-100 rounded-full mb-4">
        <UserPlus className="h-8 w-8 text-gray-600" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{t('title')}</h3>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        {t('description')}
      </p>
      <Link href="/dashboard/candidate/new">
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          {t('action')}
        </Button>
      </Link>
    </div>
  );
}
