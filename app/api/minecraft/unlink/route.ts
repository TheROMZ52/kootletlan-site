import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { notifyUser } from '@/lib/notifications'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'وارد حساب شو.' }, { status: 401 })

  const [rows] = await db.execute<any[]>(
    'SELECT minecraft_uuid, minecraft_nickname FROM profiles WHERE user_id = ? LIMIT 1',
    [user.id]
  )
  const profile = rows[0]
  if (!profile?.minecraft_uuid) {
    return NextResponse.json({ error: 'هیچ حساب Minecraft متصل نیست.' }, { status: 400 })
  }

  await db.execute(
    'UPDATE profiles SET minecraft_uuid = NULL, minecraft_nickname = NULL WHERE user_id = ?',
    [user.id]
  )
  await db.execute(
    'DELETE FROM minecraft_link_codes WHERE user_id = ?',
    [user.id]
  )
  await notifyUser(user.id, 'اتصال Minecraft قطع شد', 'حساب Minecraft از حساب سایتت جدا شد.', 'minecraft', '/account')

  return NextResponse.json({ ok: true })
}
