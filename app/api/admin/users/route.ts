import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'دسترسی غیرمجاز.' }, { status: 403 })

  const search = new URL(request.url).searchParams.get('search')?.trim() || ''
  const term = search ? '%' + search + '%' : '%'
  const [rows] = await db.execute<any[]>(
    `SELECT u.id, u.username, u.email, u.email_verified, u.role, u.created_at,
            p.minecraft_uuid, p.minecraft_nickname, p.display_name
     FROM users u
     LEFT JOIN profiles p ON p.user_id = u.id
     WHERE u.username LIKE ? OR u.email LIKE ? OR p.minecraft_nickname LIKE ?
     ORDER BY u.created_at DESC
     LIMIT 100`,
    [term, term, term]
  )
  return NextResponse.json({ users: rows })
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'دسترسی غیرمجاز.' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const id = typeof body.id === 'string' ? body.id.trim() : ''
  const role = body.role
  const emailVerified = body.email_verified

  if (!id) return NextResponse.json({ error: 'شناسه کاربر نامعتبر است.' }, { status: 400 })
  if (id === admin.id && role !== undefined && role !== 'admin') {
    return NextResponse.json({ error: 'نمی‌توانی نقش ادمین خودت را حذف کنی.' }, { status: 400 })
  }
  if (role !== undefined && !['user', 'moderator', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'نقش نامعتبر است.' }, { status: 400 })
  }
  if (emailVerified !== undefined && typeof emailVerified !== 'boolean') {
    return NextResponse.json({ error: 'وضعیت ایمیل نامعتبر است.' }, { status: 400 })
  }

  const [existing] = await db.execute<any[]>('SELECT id FROM users WHERE id = ? LIMIT 1', [id])
  if (!existing[0]) return NextResponse.json({ error: 'کاربر پیدا نشد.' }, { status: 404 })

  const updates: string[] = []
  const values: unknown[] = []
  if (role !== undefined) {
    updates.push('role = ?')
    values.push(role)
  }
  if (emailVerified !== undefined) {
    updates.push('email_verified = ?')
    values.push(emailVerified)
  }
  if (!updates.length) return NextResponse.json({ error: 'تغییری ارسال نشده است.' }, { status: 400 })

  values.push(id)
  await db.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values)
  return NextResponse.json({ ok: true })
}
