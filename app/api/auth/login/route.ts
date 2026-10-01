import { NextResponse } from 'next/server'
import { loginUser } from '@/lib/auth'
import { isDatabaseUnavailable } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (typeof email !== 'string' || typeof password !== 'string') return NextResponse.json({ error: 'ایمیل یا رمز عبور درست نیست.' }, { status: 400 })
    await loginUser(email, password)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (isDatabaseUnavailable(error)) return NextResponse.json({ error: 'در حال حاضر اتصال به دیتابیس برقرار نیست. بعداً دوباره تلاش کن.' }, { status: 503 })
    return NextResponse.json({ error: 'ایمیل یا رمز عبور درست نیست.' }, { status: 401 })
  }
}