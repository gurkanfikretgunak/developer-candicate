'use client';

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-end items-center gap-4 text-sm text-gray-600">
          <span className="font-medium">{t('projectName')}</span>
          <span>•</span>
          <span>
            {t('madeBy')}{' '}
            <a
              href="https://github.com/gurkanfikretgunak"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 hover:underline transition-colors"
            >
              Gurkan Fikret Gunak
            </a>
          </span>
          <span>•</span>
          <span>
            {t('builtWith')}{' '}
            <a
              href="https://cursor.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 hover:underline transition-colors"
            >
              Cursor
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

