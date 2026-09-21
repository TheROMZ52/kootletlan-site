import { NextResponse } from 'next/server'

const address = process.env.NEXT_PUBLIC_SERVER_ADDRESS || 'play.kootletland.kal.how'

export async function GET() {
  const headers = { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' }

  try {
    const response = await fetch('https://api.mcstatus.io/v2/status/java/' + encodeURIComponent(address), {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(6000)
    })
    if (!response.ok) return NextResponse.json({ online: false }, { headers })

    const data = await response.json()
    return NextResponse.json(
      {
        online: Boolean(data.online),
        players: data.players ? { online: Number(data.players.online ?? 0), max: Number(data.players.max ?? 0) } : undefined,
        version: data.version ? (data.version.name_clean ?? data.version.name_raw ?? null) : null
      },
      { headers }
    )
  } catch {
    // The checker being down is not the same as the server being down: answer 502 so the UI shows "unknown".
    return NextResponse.json({ online: false }, { status: 502, headers: { 'Cache-Control': 'no-store' } })
  }
}
