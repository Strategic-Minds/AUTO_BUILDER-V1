import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { PwaRegister } from '@/components/pwa-register';
import { ThemeProvider } from '@/components/theme-provider';
import { EditorPanelProvider } from '@/components/editor-panel-context';

export const metadata: Metadata = {
  title: 'XAB — Xtreme Auto Builder',
  description: 'Autonomous App & System Factory',
  manifest: '/manifest.webmanifest',
};
export const viewport: Viewport = { width:'device-width', initialScale:1, themeColor:'#000000' };

export default function RootLayout({children}:{children:ReactNode}) {
  return (
    <html lang='en'>
      <head>
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
        <link rel='apple-touch-icon' href='/icon-192.png' />
      </head>
      <body>
        <PwaRegister />
        <ThemeProvider>
          <EditorPanelProvider>
            {children}
          </EditorPanelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

