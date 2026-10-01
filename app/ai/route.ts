import { NextResponse } from 'next/server'
import { getNews } from '@/lib/news'
import { getSiteUrl } from '@/lib/site'
import { serverAddress, siteName } from '@/lib/data'

export const revalidate = 60

export async function GET() {
  const generatedAt = new Date().toISOString()
  let status: {
    online: boolean | null
    players?: { online: number; max: number }
    version?: string | null
    checkedAt: string | null
    source: string | null
  } = { online: null, checkedAt: null, source: null }

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
          : null,
        checkedAt: new Date().toISOString(),
        source: 'mcstatus.io'
      }
    }
  } catch {}

  const news = await getNews(10)
  const siteUrl = getSiteUrl()

  return NextResponse.json(
    {
      schemaVersion: 1,
      site: {
        name: siteName,
        url: siteUrl + '/',
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
        url: siteUrl + '/news/' + slug
      })),
      resources: {
        rules: siteUrl + '/rules',
        support: siteUrl + '/support',
        store: siteUrl + '/store',
        news: siteUrl + '/news',
        status: siteUrl + '/status'
      },
      generatedAt
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    }
  )
}