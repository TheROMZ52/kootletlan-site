import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { voteSites } from '@/lib/data'

export const metadata: Metadata = { title: 'رأی به سرور' }

export default function VotePage() {
  return (
    <>
      <PageHeader title="رأی به سرور" lead="با رأی دادن به کوتلت‌لند کمک می‌کنی بازیکن‌های بیشتری ما را پیدا کنند." />
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
