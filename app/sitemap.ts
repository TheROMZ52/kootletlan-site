import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'
import { getNews } from '@/lib/news'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl()
  const now = new Date()

  const pages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily' },
    { url: `${base}/news`, lastModified: now, changeFrequency: 'daily' },
    { url: `${base}/status`, lastModified: now, changeFrequency: 'always' },
    { url: `${base}/store`, lastModified: now, changeFrequency: 'weekly' },
    { url: `${base}/rules`, lastModified: now, changeFrequency: 'monthly' },
    { url: `${base}/support`, lastModified: now, changeFrequency: 'monthly' }
  ]

  const news = await getNews()

  return [
    ...pages,
    ...news.map((item) => ({
      url: `${base}/news/${item.slug}`,
      lastModified: item.published_at,
      changeFrequency: 'monthly' as const
    }))
  ]
}
