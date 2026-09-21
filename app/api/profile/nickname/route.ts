import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'وارد حساب شو.' }, { status: 401 })
  const { nickname } = await request.json()
  const value = typeof nickname === 'string' ? nickname.trim() : ''
  if (value && !/^[A-Za-z0-9_.]{2,32}$/.test(value)) return NextResponse.json({ error: 'نام Minecraft نامعتبر است.' }, { status: 400 })
  const [players] = value ? await db.execute<any[]>('SELECT uuid FROM players WHERE LOWER(username) = LOWER(?) LIMIT 1', [value]) : [[]]
  const player = players[0]
  await db.execute('UPDATE profiles SET minecraft_uuid = ?, minecraft_nickname = ? WHERE user_id = ?', [player?.uuid ?? null, value || null, user.id])
  return NextResponse.json({ ok: true })
}
