import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { notifyUser } from '@/lib/notifications'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'دسترسی غیرمجاز.' }, { status: 403 })
  const body = await request.json()
  const ticketId = Number(body.ticketId)
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 4000) : ''
  if (!Number.isInteger(ticketId) || message.length < 1) return NextResponse.json({ error: 'درخواست نامعتبر.' }, { status: 400 })
  const [tickets] = await db.execute<any[]>('SELECT id FROM support_tickets WHERE id = ? LIMIT 1', [ticketId])
  if (!tickets[0]) return NextResponse.json({ error: 'تیکت پیدا نشد.' }, { status: 404 })
  await db.execute('INSERT INTO ticket_messages (ticket_id, user_id, message) VALUES (?, ?, ?)', [ticketId, user.id, message])
  await db.execute("UPDATE support_tickets SET status = 'pending' WHERE id = ?", [ticketId])
  const [owners] = await db.execute<any[]>('SELECT user_id, subject FROM support_tickets WHERE id = ? LIMIT 1', [ticketId])
  if (owners[0]) {
    await notifyUser(String(owners[0].user_id), 'پاسخ جدید پشتیبانی', `ادمین به تیکت «${owners[0].subject}» پاسخ داد.`, 'ticket', `/account#ticket-${ticketId}`)
  }
  return NextResponse.json({ ok: true })
}
