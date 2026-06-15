'use client';

import './globals.css';
import Header from '@/components/Header';
import { LanguageProvider } from '@/lib/i18n/useLanguage';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white">
        <LanguageProvider>
          <Header />
          <main className="pt-8 pb-16">
            <div className="container mx-auto px-4 max-w-7xl">{children}</div>
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
