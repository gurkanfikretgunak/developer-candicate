'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { appConfig } from '@/config/app';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="container mx-auto px-4 py-6 space-y-4 text-sm text-gray-600">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-900">{t('projectName')}</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {appConfig.stage.toUpperCase()} · v{appConfig.version}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/hiring" className="hover:text-gray-900 hover:underline">
              Join the team
            </Link>
            <Link href="/policies" className="hover:text-gray-900 hover:underline">
              Policies & GDPR
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-4">
          <span>
            <a
              href="https://github.com/gurkanfikretgunak"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 hover:underline transition-colors font-medium"
            >
              Gurkan Fikret Gunak
            </a>
            {' '}{t('madeBy')}
          </span>
          <span>•</span>
          <span>
            <a
              href="https://cursor.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 hover:underline transition-colors font-medium"
            >
              Cursor
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

