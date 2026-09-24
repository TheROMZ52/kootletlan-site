import { NextResponse } from 'next/server'
import { randomInt } from 'node:crypto'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'وارد حساب شو.' }, { status: 401 })

    const code = String(randomInt(10000000, 100000000))
    const expires = new Date(Date.now() + 10 * 60 * 1000)

    await db.execute(
      'INSERT INTO minecraft_link_codes (user_id, code, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE code = VALUES(code), expires_at = VALUES(expires_at)',
      [user.id, code, expires]
    )

    return NextResponse.json({ code, expiresAt: expires.toISOString() })
  } catch (error) {
    console.error('Minecraft link code generation failed:', error)
    return NextResponse.json({ error: 'خطای سرور هنگام ساخت کد اتصال Minecraft.' }, { status: 500 })
  }
}
