import Link from 'next/link'
import { categoryLabels } from '@/lib/data'
import { formatDate } from '@/lib/format'
import type { NewsItem } from '@/lib/news'

export function NewsRow({ item }: { item: NewsItem }) {
  return (
    <li className="news-row">
      <Link href={`/news/${item.slug}`}>
        <span className="news-meta">
          <span className="chip">{categoryLabels[item.category] ?? item.category}</span>
          <time dateTime={item.published_at}>{formatDate(item.published_at)}</time>
        </span>
        <h3>{item.title}</h3>
        <p>{item.excerpt}</p>
      </Link>
    </li>
  )
}
