'use client';

import Header from '@/components/Header';
import { LanguageProvider } from '@/lib/i18n/useLanguage';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen md:flex">
        <Header />
        <main className="flex-1 min-w-0 px-4 py-4 md:px-5 md:py-5">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </LanguageProvider>
  );
}
