import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  const secret = request.headers.get('x-kootletland-link-secret')
  if (!secret || secret !== process.env.MINECRAFT_LINK_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const code = typeof body.code === 'string' ? body.code.trim() : ''
  const uuid = typeof body.uuid === 'string' ? body.uuid.trim() : ''
  const username = typeof body.username === 'string' ? body.username.trim() : ''
  if (!/^\\d{8}$/.test(code) || !uuid || !username) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const [rows] = await db.execute<any[]>('SELECT user_id FROM minecraft_link_codes WHERE code = ? AND expires_at > NOW() LIMIT 1', [code])
  const row = rows[0]
  if (!row) return NextResponse.json({ error: 'Code expired or invalid' }, { status: 404 })
  await db.execute('UPDATE profiles SET minecraft_uuid = ?, minecraft_nickname = ? WHERE user_id = ?', [uuid, username, row.user_id])
  await db.execute('DELETE FROM minecraft_link_codes WHERE user_id = ?', [row.user_id])
  return NextResponse.json({ ok: true })
}
