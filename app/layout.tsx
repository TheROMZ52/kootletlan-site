import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/vazirmatn'
import '@fontsource/lalezar'
import '@fontsource-variable/pixelify-sans'
import './globals.css'
import { SiteShell } from '@/components/site-shell'
import { StatusProvider } from '@/components/status-provider'
import { getSiteUrl } from '@/lib/site'
import { serverAddress, siteName } from '@/lib/data'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | سرور ماینکرفت فارسی`,
    template: `%s | ${siteName}`
  },
  description: 'کتلت‌لند، سرور ماینکرفت فارسی؛ وضعیت سرور، اخبار، قوانین، فروشگاه و پروفایل بازیکن‌ها را ببین و برای ورود آماده شو.',
  keywords: [
    'کتلت‌لند',
    'کتلت لند',
    'KootletLand',
    'سرور ماینکرفت',
    'سرور Minecraft',
    'سرور ماینکرفت فارسی',
    'Minecraft فارسی',
    'Minecraft Java',
    'سرور SMP',
    'ماینکرفت آنلاین'
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: '/'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: siteUrl,
    siteName,
    title: `${siteName} | سرور ماینکرفت فارسی`,
    description: 'سرور ماینکرفت فارسی کتلت‌لند؛ وضعیت زنده، اخبار، قوانین، فروشگاه و پروفایل بازیکن‌ها.',
  },
  twitter: {
    card: 'summary',
    title: `${siteName} | سرور ماینکرفت فارسی`,
    description: 'سرور ماینکرفت فارسی کتلت‌لند؛ وضعیت زنده، اخبار، قوانین و پروفایل بازیکن‌ها.'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#123024'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description: 'وب‌سایت رسمی کتلت‌لند، سرور ماینکرفت فارسی.',
    inLanguage: 'fa-IR',
    about: {
      '@type': 'VideoGame',
      name: 'Minecraft',
      gamePlatform: 'PC'
    },
    keywords: 'کتلت‌لند، سرور ماینکرفت، سرور ماینکرفت فارسی، Minecraft Java، SMP'
  }

  return (
    <html lang="fa-IR" dir="rtl">
      <head>
        <meta name="google-site-verification" content="ynimZ7ZQVADQJdJ0eYxdN-g2f6bg_2DFMbx4QSMCsSg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <StatusProvider>
          <SiteShell>{children}</SiteShell>
        </StatusProvider>
      </body>
    </html>
  )
}
