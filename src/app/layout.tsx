import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Voyage - Slimme Reisplanner',
  description:
    'Plan je groepsreizen stressvrij en overzichtelijk. Dagplanning, polls, inpaklijsten en budget in één app.',
  keywords: ['reisplanner', 'groepsreis', 'dagplanning', 'itinerary', 'travel', 'vakantie'],
  authors: [{ name: 'Yassine Messaoudi' }, { name: 'Sedäle Hoogvliets' }],
  creator: 'Yassine Messaoudi & Sedäle Hoogvliets',
  publisher: 'Hogeschool Windesheim',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Voyage',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    siteName: 'Voyage',
    title: 'Voyage - Slimme Reisplanner',
    description: 'Plan je groepsreizen stressvrij en overzichtelijk.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0ea5e9',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
