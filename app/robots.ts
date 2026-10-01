import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/account', '/admin', '/admin-preview', '/login', '/register', '/api/', '/auth/'] },
    sitemap: `${getSiteUrl()}/sitemap.xml`
  }
}
