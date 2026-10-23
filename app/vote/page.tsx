import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { voteSites } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'رأی به سرور',
  description: 'با رأی دادن به کتلت‌لند در سایت‌های معرفی سرور ماینکرفت، کمک کن بازیکن‌های بیشتری سرور را پیدا کنند.',
  path: '/vote',
  noindex: voteSites.length === 0
})

export default function VotePage() {
  return (
    <>
      <PageHeader title="رأی به سرور" path="/vote" lead="با رأی دادن به کوتلت‌لند کمک می‌کنی بازیکن‌های بیشتری ما را پیدا کنند." />
      <div className="container">
        {voteSites.length ? (
          <ul className="help-grid">
            {voteSites.map((site) => (
              <li key={site.url}>
                <h2>{site.name}</h2>
                {site.note && <p>{site.note}</p>}
                <a className="btn btn-primary" href={site.url} target="_blank" rel="noopener noreferrer">رأی بده</a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">
            <p>لینک‌های رأی هنوز اضافه نشده‌اند. تا آن موقع می‌توانی از <Link className="text-link" href="/news">اخبار</Link> خبردار شوی.</p>
          </div>
        )}
      </div>
    </>
  )
}
