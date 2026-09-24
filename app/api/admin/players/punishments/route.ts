import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

async function admin() {
  const user = await getCurrentUser()
  return user?.role === 'admin' ? user : null
}

export async function GET() {
  const user = await admin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [rows] = await db.execute(
    `SELECT p.*, u.username
     FROM punishments p
     LEFT JOIN users u ON u.id = p.user_id
     ORDER BY p.created_at DESC
     LIMIT 200`
  )

  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const user = await admin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await request.json()
    const { user_id, type, reason, duration_minutes } = body

    if (!user_id || !type || !reason) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const duration = duration_minutes == null ? null : Number(duration_minutes)
    if (duration !== null && (!Number.isFinite(duration) || duration < 0)) {
      return NextResponse.json({ error: 'Invalid duration' }, { status: 400 })
    }

    await db.execute(
      `INSERT INTO punishments (user_id, type, reason, duration_minutes, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, type, reason, duration, user.id]
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}