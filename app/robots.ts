import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // private / app-only areas. /ai, /llms.txt and /llms-full.txt stay open on purpose for AI crawlers.
      disallow: ['/account', '/admin', '/admin-preview', '/login', '/register', '/api/']
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  }
}
