import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'DataInsight Pro',
  description: 'Upload, explore and visualize tabular test data (Portuguese / English).',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
