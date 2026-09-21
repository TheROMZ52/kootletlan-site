import Link from 'next/link'
import { SiteLogo } from './site-logo'
import { MainNav } from './main-nav'
import { StatusPill } from './server-status'
import { CopyIp } from './copy-ip'
import { navLinks, rubikaUrl, serverAddress, siteName } from '@/lib/data'

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">پرش به محتوا</a>

      <header className="topbar">
        <div className="container bar">
          <Link href="/" className="brand-link" aria-label={`${siteName}، صفحه‌ی اصلی`}>
            <SiteLogo />
          </Link>
          <MainNav items={navLinks} />
          <div className="bar-actions">
            <StatusPill />
            <Link className="btn btn-ghost btn-small bar-account" href="/account">حساب من</Link>
          </div>
        </div>
      </header>

      <main id="main">{children}</main>

      <footer className="footer">
        <div className="strip" aria-hidden="true" />
        <div className="container footer-grid">
          <div className="footer-about">
            <SiteLogo />
            <p>سرور ماینکرفت فارسی‌زبان‌ها. دنیات را لایه‌به‌لایه بساز.</p>
          </div>
          <nav aria-label="پیوندهای پایین صفحه">
            <ul className="footer-links">
              {navLinks.map((item) => (
                <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
              ))}
              <li><Link href="/account">حساب من</Link></li>
              <li><a href={rubikaUrl} target="_blank" rel="noopener noreferrer">روبیکا</a></li>
            </ul>
          </nav>
          <div className="footer-join">
            <span className="footer-label">آدرس سرور</span>
            <CopyIp address={serverAddress} compact />
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} {siteName}</span>
          <span>ساخته‌شده برای جامعه‌ی بازیکن‌ها</span>
        </div>
      </footer>
    </>
  )
}
