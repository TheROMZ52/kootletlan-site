import { NextResponse } from 'next/server'
import { getNews } from '@/lib/news'
import { serverAddress, siteName } from '@/lib/data'

export const revalidate = 60

export async function GET() {
  let status: {
    online: boolean | null
    players?: { online: number; max: number }
    version?: string | null
  } = { online: null }

  try {
    const response = await fetch(
      'https://api.mcstatus.io/v2/status/java/' + encodeURIComponent(serverAddress),
      { next: { revalidate: 30 }, signal: AbortSignal.timeout(6000) }
    )

    if (response.ok) {
      const data = await response.json()
      status = {
        online: Boolean(data.online),
        players: data.players
          ? { online: Number(data.players.online ?? 0), max: Number(data.players.max ?? 0) }
          : undefined,
        version: data.version
          ? (data.version.name_clean ?? data.version.name_raw ?? null)
          : null
      }
    }
  } catch {}

  const news = await getNews(10)

  return NextResponse.json(
    {
      site: {
        name: siteName,
        url: 'https://kootletlan-site.vercel.app/',
        language: 'fa-IR'
      },
      minecraft: {
        edition: 'Java',
        address: serverAddress
      },
      status,
      news: news.map(({ slug, title, excerpt, category, published_at }) => ({
        slug,
        title,
        excerpt,
        category,
        published_at,
        url: 'https://kootletlan-site.vercel.app/news/' + slug
      })),
      resources: {
        rules: 'https://kootletlan-site.vercel.app/rules',
        support: 'https://kootletlan-site.vercel.app/support',
        store: 'https://kootletlan-site.vercel.app/store',
        news: 'https://kootletlan-site.vercel.app/news',
        status: 'https://kootletlan-site.vercel.app/status'
      },
      generatedAt: new Date().toISOString()
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    }
  )
}
