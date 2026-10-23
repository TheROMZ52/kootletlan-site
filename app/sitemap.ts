import type { MetadataRoute } from 'next'
import { voteSites } from '@/lib/data'
import { getNews } from '@/lib/news'
import { absoluteUrl } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const news = await getNews()
  // Only real dates: a fake "modified now" on every page makes search engines ignore lastmod.
  const newestNews = news.length ? new Date(Math.max(...news.map((item) => new Date(item.published_at).getTime()))) : undefined

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: newestNews, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/news'), lastModified: newestNews, changeFrequency: 'daily', priority: 0.8 },
    { url: absoluteUrl('/guide'), changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/leaderboard'), changeFrequency: 'hourly', priority: 0.5 },
    { url: absoluteUrl('/status'), changeFrequency: 'hourly', priority: 0.7 },
    { url: absoluteUrl('/store'), changeFrequency: 'weekly', priority: 0.6 },
    { url: absoluteUrl('/rules'), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/support'), changeFrequency: 'monthly', priority: 0.6 },
    ...(voteSites.length ? [{ url: absoluteUrl('/vote'), changeFrequency: 'monthly' as const, priority: 0.4 }] : [])
  ]

  return [
    ...pages,
    ...news.map((item) => ({
      url: absoluteUrl(`/news/${item.slug}`),
      lastModified: new Date(item.published_at),
      changeFrequency: 'monthly' as const,
      priority: 0.5
    }))
  ]
}
