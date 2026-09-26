import type { Metadata, Viewport } from 'next';
import './globals.css';
import RefAttribution from '@/components/RefAttribution';
import { appBaseUrl } from '@/lib/utils';

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl()),
  title: {
    default: 'Nuvra — Create. Sell. Teach. Scale.',
    template: '%s · Nuvra',
  },
  description:
    'One platform to build, sell and grow a digital business: pages, funnels, courses, CRM, automations and analytics.',
  openGraph: {
    title: 'Nuvra — Create. Sell. Teach. Scale.',
    description:
      'One platform to build, sell and grow a digital business: pages, funnels, courses, CRM, automations and analytics.',
    type: 'website',
    siteName: 'Nuvra',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#04060A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <RefAttribution />
        {children}
      </body>
    </html>
  );
}
