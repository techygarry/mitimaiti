import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MitiMaiti - Where Sindhi Hearts Meet',
  description: 'The modern matrimony and dating platform for the global Sindhi community.',
  keywords: ['Sindhi', 'matrimony', 'dating', 'community', 'marriage', 'MitiMaiti'],
  authors: [{ name: 'MitiMaiti' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#B5336A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('app_theme');
              if (theme === 'Dark' || (theme === 'System' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="bg-cream font-sans min-h-screen">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#2D2426',
              color: '#FFF8F0',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
            },
          }}
        />
      </body>
    </html>
  );
}
