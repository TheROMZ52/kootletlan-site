import { db } from '@/lib/db'
import { fallbackNews } from '@/lib/data'

export type NewsItem = {
  slug: string
  title: string
  excerpt: string
  category: string
  published_at: string
  content?: string | null
}

export async function getNews(limit?: number): Promise<NewsItem[]> {
  try {
    const [rows] = await db.execute<any[]>(
      `SELECT slug, title, excerpt, category, published_at, content
       FROM news
       ORDER BY pinned DESC, published_at DESC
       ${limit ? 'LIMIT ?' : ''}`,
      limit ? [limit] : []
    )
    if (rows.length) return rows as NewsItem[]
  } catch {}
  return limit ? fallbackNews.slice(0, limit) : fallbackNews
}

export async function getNewsItem(slug: string): Promise<NewsItem | null> {
  try {
    const [rows] = await db.execute<any[]>(
      'SELECT slug, title, excerpt, category, published_at, content FROM news WHERE slug = ? LIMIT 1',
      [slug]
    )
    if (rows[0]) return rows[0] as NewsItem
  } catch {}
  return fallbackNews.find((n) => n.slug === slug) ?? null
}

export function paragraphs(text: string | null | undefined) {
  return String(text ?? '')
    .replace(/\\n/g, '\n')
    .split(/\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}
