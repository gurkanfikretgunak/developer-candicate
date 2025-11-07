'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { appConfig } from '@/config/app';
import { SupabaseHealthCheck } from './SupabaseHealthCheck';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3 text-sm text-gray-600">
          {/* Top section - Mobile: centered, Desktop: left */}
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="font-medium text-gray-900">{t('projectName')}</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-2 sm:px-3 py-1 text-xs font-semibold text-blue-700">
              {appConfig.stage.toUpperCase()} · v{appConfig.version}
            </span>
          </div>

          {/* Bottom section - Mobile: centered, Desktop: right */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <Link href="/hiring" className="hover:text-gray-900 hover:underline whitespace-nowrap">
                Join the team
              </Link>
              <Link href="/policies" className="hover:text-gray-900 hover:underline whitespace-nowrap">
                Policies & GDPR
              </Link>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <a
                  href="https://github.com/gurkanfikretgunak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 hover:underline transition-colors font-medium whitespace-nowrap"
                >
                  Gurkan Fikret Gunak
                </a>
                <span className="hidden sm:inline">{' '}{t('madeBy')}</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <a
                  href="https://cursor.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 hover:underline transition-colors font-medium whitespace-nowrap"
                >
                  Cursor
                </a>
                <span className="hidden sm:inline">{' '}{t('builtWith')}</span>
                <SupabaseHealthCheck />
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

