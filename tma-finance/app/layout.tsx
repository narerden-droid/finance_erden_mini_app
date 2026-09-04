import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import TelegramProvider from '@/components/TelegramProvider';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Финансы',
  description: 'Учёт личных финансов',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-screen pb-24">
        <TelegramProvider>
          <div className="max-w-md mx-auto">{children}</div>
          <BottomNav />
        </TelegramProvider>
      </body>
    </html>
  );
}
