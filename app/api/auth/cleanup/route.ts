import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    await db.execute('DELETE FROM sessions WHERE expires_at <= NOW()')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}