import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteMark } from '@/components/site-logo'
import { navLinks } from '@/lib/data'

export const metadata: Metadata = {
  title: 'صفحه پیدا نشد',
  description: 'صفحه‌ای که دنبالش بودی در کتلت‌لند پیدا نشد. از این‌جا به بخش‌های اصلی سایت برگرد.',
  robots: { index: false, follow: true }
}

export default function NotFound() {
  return (
    <div className="container empty-page">
      <SiteMark size={72} />
      <h1>این لایه گم شد</h1>
      <p>صفحه‌ای که دنبالش بودی پیدا نشد. ولی بقیه‌ی ساندویچ سر جایش است.</p>
      <Link className="btn btn-primary" href="/">برگشت به صفحه‌ی اصلی</Link>
      <nav className="notfound-links" aria-label="بخش‌های اصلی سایت">
        <h2>یا یکی از این بخش‌ها را باز کن</h2>
        <ul>
          {navLinks.map((item) => (
            <li key={item.href}><Link className="text-link" href={item.href}>{item.label}</Link></li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
