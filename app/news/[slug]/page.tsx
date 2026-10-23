import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { JsonLd } from '@/components/json-ld'
import { RelatedLinks } from '@/components/related-links'
import { categoryLabels, siteName } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'
import { absoluteUrl, getSiteUrl } from '@/lib/site'
import { formatDate } from '@/lib/format'
import { getNewsItem, paragraphs } from '@/lib/news'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await getNewsItem(slug)
  if (!item) return { title: 'خبر پیدا نشد', robots: { index: false, follow: true } }
  return pageMetadata({ title: item.title, description: item.excerpt, path: `/news/${item.slug}`, type: 'article' })
}

export default async function NewsDetail({ params }: Props) {
  const { slug } = await params
  const item = await getNewsItem(slug)
  if (!item) notFound()

  const body = paragraphs(item.content || item.excerpt)
  const path = `/news/${item.slug}`
  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    description: item.excerpt,
    datePublished: new Date(item.published_at).toISOString(),
    inLanguage: 'fa-IR',
    mainEntityOfPage: absoluteUrl(path),
    image: [absoluteUrl('/og.png')],
    author: { '@type': 'Organization', name: siteName, url: getSiteUrl() },
    publisher: { '@type': 'Organization', name: siteName, logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.png') } }
  }

  return (
    <>
    <article className="container article">
      <JsonLd data={articleData} />
      <Breadcrumbs items={[{ name: 'خانه', path: '/' }, { name: 'اخبار', path: '/news' }, { name: item.title, path }]} />
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
    <RelatedLinks keys={['news', 'status', 'rules']} />
    </>
  )
}
