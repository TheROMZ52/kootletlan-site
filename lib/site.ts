const FALLBACK_SITE_URL = 'https://kootletlan-site.vercel.app'

/**
 * Public URL of the website itself (NOT the Minecraft server address).
 * Set NEXT_PUBLIC_SITE_URL to your custom domain (e.g. https://kootletland.ir) and
 * every canonical tag, sitemap entry, JSON-LD block and llms.txt URL follows it.
 */
export function getSiteUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '')
  if (!raw) return FALLBACK_SITE_URL
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
}

export function absoluteUrl(path = '/') {
  return `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`
}
