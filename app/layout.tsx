import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Free Brain Gain',
  description: 'The Daily Mental Routine to Keep Your Brain Sharp',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Free Brain Gain',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}export const metadata = {
  title: 'Free Brain Gain Portal',
  description: 'Train your mind and elevate focus.',
  manifest: '/manifest.json',
};