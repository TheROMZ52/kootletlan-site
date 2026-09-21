import { NextResponse } from 'next/server'
import { registerUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()
    if (!/^[A-Za-z0-9_]{3,16}$/.test(username ?? '')) return NextResponse.json({ error: 'نام کاربری نامعتبر است.' }, { status: 400 })
    if (typeof email !== 'string' || !email.includes('@')) return NextResponse.json({ error: 'ایمیل نامعتبر است.' }, { status: 400 })
    if (typeof password !== 'string' || password.length < 8) return NextResponse.json({ error: 'رمز عبور باید حداقل 8 کاراکتر باشد.' }, { status: 400 })
    await registerUser(username, email, password)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error?.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: 'این نام کاربری یا ایمیل قبلاً ثبت شده.' }, { status: 409 })
    return NextResponse.json({ error: 'ساخت اکانت انجام نشد.' }, { status: 500 })
  }
}
