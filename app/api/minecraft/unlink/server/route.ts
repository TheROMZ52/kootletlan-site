import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyUser } from '@/lib/notifications'

function authorized(request: Request) {
  const expected = process.env.MINECRAFT_LINK_SECRET?.trim()
  const received = request.headers.get('x-kootletland-link-secret')?.trim()
  return Boolean(expected && received && received === expected)
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const uuid = typeof body.uuid === 'string' ? body.uuid.trim().toLowerCase() : ''
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid)) {
    return NextResponse.json({ error: 'Invalid UUID' }, { status: 400 })
  }

  const [rows] = await db.execute<any[]>(
    'SELECT user_id FROM profiles WHERE minecraft_uuid = ? LIMIT 1',
    [uuid]
  )
  if (!rows[0]) return NextResponse.json({ error: 'Minecraft account is not linked' }, { status: 404 })

  const userId = String(rows[0].user_id)
  await db.execute(
    'UPDATE profiles SET minecraft_uuid = NULL, minecraft_nickname = NULL WHERE user_id = ? AND minecraft_uuid = ?',
    [userId, uuid]
  )
  await db.execute('DELETE FROM minecraft_link_codes WHERE user_id = ?', [userId])
  await notifyUser(userId, 'اتصال Minecraft قطع شد', 'اتصال Minecraft شما از داخل بازی قطع شد.', 'minecraft', '/account')

  return NextResponse.json({ ok: true })
}
