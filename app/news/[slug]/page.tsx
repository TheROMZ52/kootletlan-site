import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { categoryLabels } from '@/lib/data'
import { formatDate } from '@/lib/format'
import { getNewsItem, paragraphs } from '@/lib/news'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await getNewsItem(slug)
  return item ? { title: item.title, description: item.excerpt } : { title: 'خبر پیدا نشد' }
}

export default async function NewsDetail({ params }: Props) {
  const { slug } = await params
  const item = await getNewsItem(slug)
  if (!item) notFound()

  const body = paragraphs(item.content || item.excerpt)

  return (
    <article className="container article">
      <Link href="/news" className="text-link">همه‌ی خبرها</Link>
      <header className="article-head">
        <span className="news-meta">
          <span className="chip">{categoryLabels[item.category] ?? item.category}</span>
          <time dateTime={item.published_at}>{formatDate(item.published_at)}</time>
        </span>
        <h1>{item.title}</h1>
        <p className="lead">{item.excerpt}</p>
        <div className="strip strip-short" aria-hidden="true" />
      </header>
      <div className="article-body">
        {body.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </article>
  )
}
