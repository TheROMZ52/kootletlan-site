import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyUser } from '@/lib/notifications'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const NAME_RE = /^[A-Za-z0-9_]{3,16}$/
const CODE_RE = /^\d{8}$/

export async function POST(request: Request) {
  const token = request.headers.get('x-kootletland-server-token')?.trim()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tokenHash = createHash('sha256').update(token).digest('hex')
  const [serverRows] = await db.execute<any[]>(
    'SELECT installation_id FROM minecraft_server_registrations WHERE token_hash = ? LIMIT 1',
    [tokenHash]
  )
  if (!serverRows[0]) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const code = typeof body.code === 'string' ? body.code.trim() : ''
  const uuid = typeof body.uuid === 'string' ? body.uuid.trim().toLowerCase() : ''
  const username = typeof body.username === 'string' ? body.username.trim() : ''

  if (!CODE_RE.test(code) || !UUID_RE.test(uuid) || !NAME_RE.test(username)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const [rows] = await db.execute<any[]>(
    'SELECT user_id FROM minecraft_link_codes WHERE code = ? AND expires_at > NOW() LIMIT 1',
    [code]
  )
  const row = rows[0]
  if (!row) return NextResponse.json({ error: 'Code expired or invalid' }, { status: 404 })

  const [existing] = await db.execute<any[]>(
    'SELECT user_id FROM profiles WHERE minecraft_uuid = ? LIMIT 1',
    [uuid]
  )
  if (existing[0] && existing[0].user_id !== row.user_id) {
    return NextResponse.json({ error: 'Minecraft account is already linked' }, { status: 409 })
  }

  await db.execute(
    'UPDATE profiles SET minecraft_uuid = ?, minecraft_nickname = ? WHERE user_id = ?',
    [uuid, username, row.user_id]
  )
  await db.execute('DELETE FROM minecraft_link_codes WHERE user_id = ?', [row.user_id])
  await notifyUser(String(row.user_id), 'اتصال Minecraft انجام شد', `حساب Minecraft ${username} با موفقیت به حساب سایتت متصل شد.`, 'minecraft', '/account')

  return NextResponse.json({ ok: true })
}
