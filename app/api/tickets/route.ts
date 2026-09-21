import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'وارد حساب شو.' }, { status: 401 })
  const { subject, message } = await request.json()
  const cleanSubject = typeof subject === 'string' ? subject.trim().slice(0, 120) : ''
  const cleanMessage = typeof message === 'string' ? message.trim().slice(0, 4000) : ''
  if (cleanSubject.length < 3) return NextResponse.json({ error: 'موضوع را بنویس.' }, { status: 400 })
  if (cleanMessage.length < 10) return NextResponse.json({ error: 'توضیح را کامل‌تر بنویس.' }, { status: 400 })
  await db.execute('INSERT INTO support_tickets (user_id, subject, message) VALUES (?, ?, ?)', [user.id, cleanSubject, cleanMessage])
  return NextResponse.json({ ok: true })
}
