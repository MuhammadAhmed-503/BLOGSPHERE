import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { initializeAdmin } from '@/lib/init-admin';
import { SessionProvider } from '@/components/providers/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'BlogSphere',
    template: '%s | BlogSphere',
  },
  description: 'A modern, scalable blogging platform built with Next.js',
  keywords: ['blog', 'articles', 'technology', 'tutorials'],
  authors: [{ name: 'BlogSphere' }],
  creator: 'BlogSphere',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        url: '/favicon-16x16.png',
        sizes: '16x16',
      },
      {
        rel: 'icon',
        url: '/favicon-32x32.png',
        sizes: '32x32',
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'BlogSphere',
    title: 'BlogSphere',
    description: 'A modern, scalable blogging platform built with Next.js',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlogSphere',
    description: 'A modern, scalable blogging platform built with Next.js',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Initialize admin user on startup
if (process.env.NODE_ENV !== 'production') {
  initializeAdmin().catch(console.error);
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
