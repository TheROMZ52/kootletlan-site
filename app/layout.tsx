import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/vazirmatn'
import '@fontsource/lalezar'
import '@fontsource-variable/pixelify-sans'
import './globals.css'
import { SiteShell } from '@/components/site-shell'
import { StatusProvider } from '@/components/status-provider'
import { getSiteUrl } from '@/lib/site'
import { siteName } from '@/lib/data'

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: `${siteName} | سرور ماینکرفت فارسی`, template: `%s | ${siteName}` },
  description: 'وب‌سایت رسمی کوتلت‌لند: وضعیت زنده‌ی سرور، اخبار، قوانین، فروشگاه و اکانت بازیکن.',
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    siteName,
    title: `${siteName} | سرور ماینکرفت فارسی`,
    description: 'وضعیت زنده‌ی سرور، اخبار، قوانین و اکانت بازیکن.'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#123024'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <StatusProvider>
          <SiteShell>{children}</SiteShell>
        </StatusProvider>
      </body>
    </html>
  )
}
