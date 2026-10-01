import type { MetadataRoute } from 'next'
import { getNews } from '@/lib/news'
import { getSiteUrl } from '@/lib/site'

export const revalidate = 3600

const siteUrl = getSiteUrl()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const pages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: 'daily' },
    { url: `${siteUrl}/news`, lastModified: now, changeFrequency: 'daily' },
    { url: `${siteUrl}/status`, lastModified: now, changeFrequency: 'always' },
    { url: `${siteUrl}/store`, lastModified: now, changeFrequency: 'weekly' },
    { url: `${siteUrl}/rules`, lastModified: now, changeFrequency: 'monthly' },
    { url: `${siteUrl}/support`, lastModified: now, changeFrequency: 'monthly' }
  ]

  const news = await getNews()

  return [
    ...pages,
    ...news.map((item) => ({
      url: `${siteUrl}/news/${item.slug}`,
      lastModified: item.published_at,
      changeFrequency: 'monthly' as const
    }))
  ]
}
