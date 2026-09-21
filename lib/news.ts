import { createPublicClient } from '@/lib/supabase/public'
import { fallbackNews } from '@/lib/data'

export type NewsItem = {
  slug: string
  title: string
  excerpt: string
  category: string
  published_at: string
  content?: string | null
}

// The list never needs the article body; the detail query uses '*' so it works whatever columns the table has.
const LIST_COLUMNS = 'slug,title,excerpt,category,published_at'

export async function getNews(limit?: number): Promise<NewsItem[]> {
  const supabase = createPublicClient()
  if (!supabase) return limit ? fallbackNews.slice(0, limit) : fallbackNews

  try {
    let query = supabase
      .from('news')
      .select(LIST_COLUMNS)
      .order('pinned', { ascending: false })
      .order('published_at', { ascending: false })
    if (limit) query = query.limit(limit)
    const { data, error } = await query
    if (error) throw error
    if (data?.length) return data as NewsItem[]
  } catch (error) {
    console.error('[news] could not load from Supabase, using fallback:', error)
  }
  return limit ? fallbackNews.slice(0, limit) : fallbackNews
}

export async function getNewsItem(slug: string): Promise<NewsItem | null> {
  const supabase = createPublicClient()
  if (supabase) {
    try {
      const { data, error } = await supabase.from('news').select('*').eq('slug', slug).maybeSingle()
      if (error) throw error
      if (data) return data as NewsItem
    } catch (error) {
      console.error('[news] could not load article:', error)
    }
  }
  return fallbackNews.find((n) => n.slug === slug) ?? null
}

/** Article bodies may use real line breaks or a literal "\n" (both exist in older rows). */
export function paragraphs(text: string | null | undefined) {
  return String(text ?? '')
    .replace(/\\n/g, '\n')
    .split(/\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}
