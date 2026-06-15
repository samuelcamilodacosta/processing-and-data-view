'use client';

import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/lib/i18n/useLanguage';

export default function Header() {
  const { t } = useLanguage();

  return (
    <aside className="w-full md:w-[280px] lg:w-[320px] md:min-h-screen md:sticky md:top-0 z-50 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg">
      <div className="flex h-full flex-row md:flex-col gap-4 p-4 md:p-6">
        <div className="space-y-4 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="block text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent truncate">
              {t.header.title}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t.header.subtitle}
            </p>
          </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/60 p-4 text-sm text-gray-600 dark:text-gray-300">
            <p className="font-semibold text-gray-900 dark:text-white mb-1">
              {t.header.sidebarTitle}
            </p>
            <p className="text-xs leading-5">
              {t.header.sidebarDescription}
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-col items-start gap-3">
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}
