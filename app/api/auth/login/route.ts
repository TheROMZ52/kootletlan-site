import { NextResponse } from 'next/server'
import { loginUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (typeof email !== 'string' || typeof password !== 'string') return NextResponse.json({ error: 'ایمیل یا رمز عبور درست نیست.' }, { status: 400 })
    await loginUser(email, password)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'ایمیل یا رمز عبور درست نیست.' }, { status: 401 })
  }
}
