import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'
import { getNews } from '@/lib/news'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl()
  const pages = ['', '/news', '/status', '/store', '/rules', '/support'].map((path) => ({ url: base + path }))
  const news = await getNews()
  return [...pages, ...news.map((n) => ({ url: `${base}/news/${n.slug}`, lastModified: n.published_at }))]
}
