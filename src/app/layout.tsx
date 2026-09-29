import type { Metadata, Viewport } from 'next';
import './globals.css';
import RefAttribution from '@/components/RefAttribution';
import { appBaseUrl } from '@/lib/utils';

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl()),
  title: {
    default: 'Nuvra — Créez. Vendez. Enseignez. Développez.',
    template: '%s · Nuvra',
  },
  description:
    'Une seule plateforme pour créer, vendre et développer votre activité digitale : pages, tunnels, formations, CRM, automatisations et statistiques.',
  openGraph: {
    title: 'Nuvra — Créez. Vendez. Enseignez. Développez.',
    description:
      'Une seule plateforme pour créer, vendre et développer votre activité digitale : pages, tunnels, formations, CRM, automatisations et statistiques.',
    type: 'website',
    siteName: 'Nuvra',
    images: [
      {
        url: '/brand/og.png',
        width: 1200,
        height: 630,
        alt: 'Nuvra — Créez. Vendez. Enseignez. Développez.',
      },
    ],
  },
  twitter: { card: 'summary_large_image' },
  applicationName: 'Nuvra',
  appleWebApp: {
    capable: true,
    title: 'Nuvra',
    statusBarStyle: 'black-translucent',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#04060A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body>
        <RefAttribution />
        {children}
      </body>
    </html>
  );
}
