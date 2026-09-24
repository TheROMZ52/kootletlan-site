import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { randomBytes, scryptSync } from 'node:crypto'
import { logAdminAction } from '@/lib/audit'

export async function GET(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'دسترسی غیرمجاز.' }, { status: 403 })

  const search = new URL(request.url).searchParams.get('search')?.trim() || ''
  const term = search ? '%' + search + '%' : '%'
  const [rows] = await db.execute<any[]>(
    `SELECT u.id, u.username, u.email, u.email_verified, u.role, u.created_at,
            p.minecraft_uuid, p.minecraft_nickname, p.display_name,
            u.is_banned, u.ban_reason, u.banned_until
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
  const banned = body.is_banned
  const banReason = typeof body.ban_reason === 'string' ? body.ban_reason.trim().slice(0, 500) : undefined
  const bannedUntil = body.banned_until === null || typeof body.banned_until === 'string' ? body.banned_until : undefined
  const forceLogout = body.force_logout === true
  const unlinkMinecraft = body.unlink_minecraft === true
  const resetPassword = body.reset_password === true

  if (!id) return NextResponse.json({ error: 'شناسه کاربر نامعتبر است.' }, { status: 400 })
  if (id === admin.id && role !== undefined && role !== 'admin') {
    return NextResponse.json({ error: 'نمی‌توانی نقش ادمین خودت را حذف کنی.' }, { status: 400 })
  }
  if (role !== undefined && !['user', 'moderator', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'نقش نامعتبر است.' }, { status: 400 })
  }
  if (banned !== undefined && typeof banned !== 'boolean') return NextResponse.json({ error: 'وضعیت مسدودی نامعتبر است.' }, { status: 400 })
  if (bannedUntil !== undefined && bannedUntil !== null && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(bannedUntil)) return NextResponse.json({ error: 'تاریخ مسدودی نامعتبر است.' }, { status: 400 })
  if (emailVerified !== undefined && typeof emailVerified !== 'boolean') {
    return NextResponse.json({ error: 'وضعیت ایمیل نامعتبر است.' }, { status: 400 })
  }

  const [existing] = await db.execute<any[]>('SELECT id, username, role, is_banned FROM users WHERE id = ? LIMIT 1', [id])
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
  if (banned !== undefined) {
    updates.push('is_banned = ?', 'ban_reason = ?', 'banned_until = ?')
    values.push(banned, banReason ?? null, banned ? (bannedUntil ? new Date(bannedUntil) : null) : null)
  }
  if (unlinkMinecraft) {
    await db.execute('UPDATE profiles SET minecraft_uuid = NULL, minecraft_nickname = NULL WHERE user_id = ?', [id])
    await db.execute('DELETE FROM minecraft_link_codes WHERE user_id = ?', [id])
  }
  if (forceLogout) await db.execute('DELETE FROM sessions WHERE user_id = ?', [id])
  let temporaryPassword: string | null = null
  if (resetPassword) {
    temporaryPassword = randomBytes(9).toString('base64url')
    const salt = randomBytes(16).toString('hex')
    const hash = scryptSync(temporaryPassword, salt, 64).toString('hex')
    await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [`scrypt:${salt}:${hash}`, id])
    await db.execute('DELETE FROM sessions WHERE user_id = ?', [id])
  }
  if (!updates.length && !unlinkMinecraft && !forceLogout && !resetPassword) return NextResponse.json({ error: 'تغییری ارسال نشده است.' }, { status: 400 })

  if (updates.length) {
    values.push(id)
    await db.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values)
  }
  if (banned === true) await db.execute('DELETE FROM sessions WHERE user_id = ?', [id])
  const actions: string[] = []
  if (role !== undefined && role !== existing[0].role) actions.push(`role: ${existing[0].role} -> ${role}`)
  if (emailVerified !== undefined) actions.push(`email_verified: ${emailVerified}`)
  if (banned !== undefined && Boolean(banned) !== Boolean(existing[0].is_banned)) actions.push(banned ? 'account_banned' : 'account_unbanned')
  if (unlinkMinecraft) actions.push('minecraft_unlinked')
  if (forceLogout) actions.push('sessions_revoked')
  if (resetPassword) actions.push('password_reset')
  if (actions.length) await logAdminAction(admin.id, actions[0].split(':')[0], id, existing[0].username, actions.join(' | '))
  return NextResponse.json({ ok: true, temporaryPassword })
}
