import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site'
import { siteName } from '@/lib/data'

type PageMeta = {
  title: string
  description: string
  /** Path of the page, e.g. "/rules". Used for the canonical tag and og:url. */
  path: string
  noindex?: boolean
  type?: 'website' | 'article'
}

/** One place that gives every page a canonical URL, Open Graph and Twitter tags. */
export function pageMetadata({ title, description, path, noindex, type = 'website' }: PageMeta): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: 'fa_IR',
      siteName,
      url: absoluteUrl(path),
      title: `${title} | ${siteName}`,
      description,
      images: [{ url: '/og.png', width: 1200, height: 630, alt: `${siteName}، سرور ماینکرفت فارسی` }]
    },
    twitter: { card: 'summary_large_image', title: `${title} | ${siteName}`, description, images: ['/og.png'] },
    ...(noindex ? { robots: { index: false, follow: true } } : {})
  }
}
