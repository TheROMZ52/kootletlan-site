import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

async function admin() {
  const user = await getCurrentUser()
  return user?.role === 'admin' ? user : null
}

export async function GET() {
  const user = await admin()
  if (!user) return NextResponse.json({ error: 'دسترسی غیرمجاز.' }, { status: 403 })
  const [rows] = await db.execute<any[]>(
    'SELECT t.id, t.subject, t.status, t.created_at, t.updated_at, u.username, u.email FROM support_tickets t JOIN users u ON u.id = t.user_id ORDER BY t.updated_at DESC LIMIT 100'
  )
  return NextResponse.json({ tickets: rows })
}

export async function PATCH(request: Request) {
  const user = await admin()
  if (!user) return NextResponse.json({ error: 'دسترسی غیرمجاز.' }, { status: 403 })
  const body = await request.json()
  const id = Number(body.id)
  const status = body.status
  if (!Number.isInteger(id) || !['open','pending','closed'].includes(status)) return NextResponse.json({ error: 'درخواست نامعتبر.' }, { status: 400 })
  await db.execute('UPDATE support_tickets SET status = ? WHERE id = ?', [status, id])
  return NextResponse.json({ ok: true })
}
