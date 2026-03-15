import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MitiMaiti Admin',
  description: 'MitiMaiti Admin Dashboard - Content Moderation & User Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-bg">{children}</body>
    </html>
  );
}
