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
    "کتلت‌لند",
    "کتلت لند",
    "کوتلت لند",
    "KootletLand",
    "Kootlet Land",
    "KootletLand Minecraft",
    "KootletLand Server",
    "KootletLand SMP",
    "سرور ماینکرفت",
    "سرور ماینکرافت",
    "سرور های ماینکرافت",
    "سرورهای ماینکرافت",
    "سرور ماینکرفت فارسی",
    "سرور ماینکرافت فارسی",
    "سرورهای ماینکرفت فارسی",
    "سرورهای ماینکرافت فارسی",
    "سرور ماینکرفت ایرانی",
    "سرور ماینکرافت ایرانی",
    "سرورهای ماینکرفت ایرانی",
    "سرورهای ماینکرافت ایرانی",
    "سرور ماینکرافت ایران",
    "سرور ماینکرفت ایران",
    "سرور ماینکرافت جاوا",
    "سرور ماینکرفت جاوا",
    "سرورهای ماینکرافت جاوا",
    "Minecraft Java Server",
    "Minecraft Java Server Iran",
    "Minecraft Java Server Persian",
    "Minecraft Persian Server",
    "Minecraft Persian Servers",
    "Persian Minecraft Server",
    "Persian Minecraft Servers",
    "Iranian Minecraft Server",
    "Iranian Minecraft Servers",
    "Minecraft Iran Server",
    "Minecraft Server Iran",
    "Minecraft Server List Iran",
    "سرور SMP فارسی",
    "سرور SMP ایرانی",
    "SMP فارسی",
    "Iranian SMP",
    "Persian SMP",
    "Minecraft SMP",
    "سرور Survival ماینکرافت",
    "سرور Survival فارسی",
    "سرور بقا ماینکرافت",
    "سرور بقا فارسی",
    "Survival Minecraft Server",
    "Persian Survival Server",
    "Iranian Survival Server",
    "Minecraft multiplayer server",
    "Minecraft online server",
    "سرور ماینکرافت آنلاین",
    "ماینکرفت آنلاین فارسی",
    "آی پی سرور ماینکرافت",
    "IP سرور ماینکرافت",
    "Minecraft Server IP",
    "Minecraft Server Address",
    "آدرس سرور ماینکرفت",
    "آدرس سرور ماینکرافت",
    "اتصال به سرور ماینکرافت",
    "ورود به سرور ماینکرافت",
    "How to join Minecraft server",
    "Minecraft server status",
    "Minecraft server online status",
    "وضعیت سرور ماینکرافت",
    "وضعیت سرور ماینکرفت",
    "استاتوس سرور ماینکرافت",
    "بازیکنان آنلاین سرور ماینکرافت",
    "Minecraft server players",
    "Minecraft server player count",
    "اخبار سرور ماینکرافت",
    "اخبار کتلت لند",
    "Minecraft server news",
    "قوانین سرور ماینکرافت",
    "قوانین کتلت لند",
    "Minecraft server rules",
    "پشتیبانی سرور ماینکرافت",
    "پشتیبانی کتلت لند",
    "Minecraft server support",
    "فروشگاه سرور ماینکرافت",
    "فروشگاه کتلت لند",
    "Minecraft server store",
    "پروفایل بازیکن ماینکرافت",
    "آمار بازیکن ماینکرافت",
    "Minecraft player profile",
    "Minecraft player stats",
    "Minecraft server stats",
    "سرور ماینکرافت با چت صوتی",
    "چت صوتی ماینکرافت",
    "Simple Voice Chat Minecraft Server",
    "Minecraft proximity voice chat server",
    "Jobs Minecraft server",
    "Minecraft jobs server",
    "Minecraft auction server",
    "Minecraft shop server",
    "Minecraft survival jobs server",
    "Minecraft parkour server",
    "Minecraft anti cheat server",
    "سرور ماینکرافت شغل",
    "سرور ماینکرافت حراجی",
    "سرور ماینکرافت مغازه",
    "سرور ماینکرافت پارکور",
    "سرور ماینکرافت ضد چیت",
    "سرور ماینکرفت چند نفره",
    "بازی چند نفره ماینکرفت",
    "Minecraft multiplayer Persian",
    "Persian Minecraft multiplayer",
    "KootletLand Minecraft Server",
    "KootletLand Persian Server",
    "KootletLand Iranian Server"

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
        <script async src="https://savri.io/script.js" data-site-id="e79ff654-f39b-431b-b13e-c7c095b84a88" data-api="https://savri.io" />
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
