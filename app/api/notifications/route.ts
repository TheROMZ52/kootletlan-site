import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'وارد حساب شو.' }, { status: 401 })
  const [rows] = await db.execute<any[]>(
    'SELECT id, title, message, type, link, created_at FROM notifications WHERE user_id = ? AND read_at IS NULL ORDER BY created_at DESC LIMIT 50',
    [user.id]
  )
  return NextResponse.json({ notifications: rows })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'وارد حساب شو.' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const ids = Array.isArray(body.ids) ? body.ids.map(Number).filter(Number.isInteger).slice(0, 100) : []
  if (ids.length) {
    const placeholders = ids.map(() => '?').join(',')
    await db.execute(
      'UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND id IN (' + placeholders + ')',
      [user.id, ...ids]
    )
  } else if (body.all === true) {
    await db.execute('UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL', [user.id])
  } else {
    return NextResponse.json({ error: 'درخواست نامعتبر.' }, { status: 400 })
  }
  return NextResponse.json({ ok: true })
}
