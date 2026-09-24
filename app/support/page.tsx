import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { faq, rubikaUrl } from '@/lib/data'

export const metadata: Metadata = {
  title: 'پشتیبانی سرور',
  description: 'پشتیبانی کتلت‌لند برای مشکلات اکانت، گزارش بازیکن، وضعیت سرور و سؤال‌های پرتکرار Minecraft.'
}

export default function SupportPage() {
  return (
    <>
      <PageHeader title="پشتیبانی" lead="گیر کردی؟ راه درست را انتخاب کن تا سریع‌تر جواب بگیری." />
      <div className="container">
        <ul className="help-grid">
          <li>
            <h2>تیکت خصوصی</h2>
            <p>مشکل اکانت، خرید یا گزارش بازیکن را خصوصی برای تیم بفرست.</p>
            <Link className="btn btn-primary" href="/account">ثبت تیکت</Link>
          </li>
          <li>
            <h2>روبیکا</h2>
            <p>با بقیه‌ی بازیکن‌ها و استاف چت کن. آی‌دی: <span className="ltr">@kootletland</span></p>
            <a className="btn btn-ghost" href={rubikaUrl} target="_blank" rel="noopener noreferrer">ورود به روبیکا</a>
          </li>
          <li>
            <h2>وضعیت سرور</h2>
            <p>قبل از تیکت، ببین سرور آنلاین است یا نه.</p>
            <Link className="btn btn-ghost" href="/status">بررسی وضعیت</Link>
          </li>
        </ul>

        <h2 className="faq-title">سؤال‌های پرتکرار</h2>
        <div className="faq">
          {faq.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  )
}
