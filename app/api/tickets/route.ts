import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { notifyAdmins, notifyUser } from '@/lib/notifications'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'وارد حساب شو.' }, { status: 401 })
  const body = await request.json()
  const { subject, message, ticketId } = body
  const cleanSubject = typeof subject === 'string' ? subject.trim().slice(0, 120) : ''
  const cleanMessage = typeof message === 'string' ? message.trim().slice(0, 4000) : ''
  if (cleanSubject.length < 3) return NextResponse.json({ error: 'موضوع را بنویس.' }, { status: 400 })
  if (cleanMessage.length < 10) return NextResponse.json({ error: 'توضیح را کامل‌تر بنویس.' }, { status: 400 })
  if (ticketId) {
    const [owned] = await db.execute<any[]>('SELECT id FROM support_tickets WHERE id = ? AND user_id = ? LIMIT 1', [Number(ticketId), user.id])
    if (!owned[0]) return NextResponse.json({ error: 'تیکت پیدا نشد.' }, { status: 404 })
    await db.execute('INSERT INTO ticket_messages (ticket_id, user_id, message) VALUES (?, ?, ?)', [Number(ticketId), user.id, cleanMessage])
    await db.execute("UPDATE support_tickets SET status = 'open' WHERE id = ?", [Number(ticketId)])
    await notifyAdmins('پاسخ جدید تیکت', `کاربر ${user.username} به تیکت #${ticketId} پاسخ داد.`, 'ticket', `/admin?ticket=${ticketId}`)
    return NextResponse.json({ ok: true })
  }
  const [result] = await db.execute<any>('INSERT INTO support_tickets (user_id, subject, message) VALUES (?, ?, ?)', [user.id, cleanSubject, cleanMessage])
  await db.execute('INSERT INTO ticket_messages (ticket_id, user_id, message) VALUES (?, ?, ?)', [result.insertId, user.id, cleanMessage])
  await notifyAdmins('تیکت پشتیبانی جدید', `${user.username} یک تیکت جدید با موضوع «${cleanSubject}» ثبت کرد.`, 'ticket', `/admin?ticket=${result.insertId}`)
  return NextResponse.json({ ok: true, ticketId: result.insertId })
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'وارد حساب شو.' }, { status: 401 })
  const [tickets] = await db.execute<any[]>('SELECT id, subject, status, created_at, updated_at FROM support_tickets WHERE user_id = ? ORDER BY updated_at DESC', [user.id])
  const [messages] = await db.execute<any[]>('SELECT m.id, m.ticket_id, m.message, m.created_at, u.username, u.role FROM ticket_messages m JOIN users u ON u.id = m.user_id JOIN support_tickets t ON t.id = m.ticket_id WHERE t.user_id = ? ORDER BY m.created_at ASC', [user.id])
  return NextResponse.json({ tickets, messages })
}
