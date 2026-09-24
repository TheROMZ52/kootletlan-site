import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { StatusBoard } from '@/components/server-status'
import { CopyIp } from '@/components/copy-ip'
import { joinSteps, serverAddress } from '@/lib/data'

export const metadata: Metadata = {
  title: 'وضعیت سرور ماینکرفت',
  description: 'وضعیت آنلاین بودن سرور ماینکرفت کوتلت‌لند و تعداد بازیکنان آنلاین را بررسی کن.'
}

export default function StatusPage() {
  return (
    <>
      <PageHeader title="وضعیت سرور" lead="ببین سرور آنلاین است و چند نفر توش بازی می‌کنند." />
      <div className="container status-layout">
        <StatusBoard />
        <aside className="status-side">
          <div className="side-block">
            <h2>آدرس سرور</h2>
            <CopyIp address={serverAddress} />
            <p className="muted">فقط Minecraft Java Edition.</p>
          </div>
          <div className="side-block">
            <h2>وصل نمی‌شوی؟</h2>
            <ul className="tips">
              <li>آدرس را کپی کن، نه دستی بنویس؛ فاصله‌ی اضافه جلوی آدرس مشکل درست می‌کند.</li>
              <li>مطمئن شو نسخه‌ی Java Edition را باز کرده‌ای.</li>
              <li>اگر بالا «آفلاین» نوشته، چند دقیقه صبر کن و دوباره سر بزن.</li>
            </ul>
            <p><Link className="text-link" href="/support">هنوز حل نشد؟ به پشتیبانی بگو</Link></p>
          </div>
          <div className="side-block">
            <h2>اولین بار است؟</h2>
            <ol className="steps steps-small">
              {joinSteps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </div>
        </aside>
      </div>
    </>
  )
}
