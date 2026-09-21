'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

const USERNAME = /^[A-Za-z0-9_]{3,16}$/

function translate(message: string) {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'ایمیل یا رمز عبور درست نیست.'
  if (m.includes('email not confirmed')) return 'ایمیلت هنوز تأیید نشده. لینک فعال‌سازی را در ایمیلت باز کن.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'با این ایمیل قبلاً ثبت‌نام شده. وارد شو.'
  if (m.includes('password') && (m.includes('at least') || m.includes('weak'))) return 'رمز عبور خیلی کوتاه یا ضعیف است. حداقل 8 کاراکتر بنویس.'
  if (m.includes('rate limit') || m.includes('too many')) return 'تعداد تلاش‌ها زیاد بود. چند دقیقه بعد دوباره امتحان کن.'
  if (m.includes('email') && (m.includes('valid') || m.includes('invalid'))) return 'این ایمیل معتبر نیست.'
  return 'مشکلی پیش آمد. دوباره امتحان کن.'
}

export function AuthForm({ mode, notice }: { mode: 'login' | 'register'; notice?: string }) {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(
    notice ? { kind: 'err', text: notice } : null
  )

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setMessage(null)

    if (mode === 'register' && !USERNAME.test(username)) {
      setMessage({ kind: 'err', text: 'نام کاربری باید 3 تا 16 کاراکتر و فقط شامل حرف انگلیسی، عدد و _ باشد.' })
      return
    }
    if (mode === 'register' && password.length < 8) {
      setMessage({ kind: 'err', text: 'رمز عبور باید حداقل 8 کاراکتر باشد.' })
      return
    }
    if (!isSupabaseConfigured()) {
      setMessage({ kind: 'err', text: 'سیستم حساب کاربری هنوز روی این سایت فعال نشده است.' })
      return
    }

    setBusy(true)
    try {
      const supabase = createClient()

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) setMessage({ kind: 'err', text: translate(error.message) })
        else { router.push('/account'); router.refresh() }
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback',
          data: { username, display_name: username }
        }
      })
      if (error) setMessage({ kind: 'err', text: translate(error.message) })
      else if (data.session) { router.push('/account'); router.refresh() }
      else setMessage({ kind: 'ok', text: 'اکانت ساخته شد. برای فعال‌سازی، لینکی که به ایمیلت فرستادیم را باز کن.' })
    } catch {
      setMessage({ kind: 'err', text: 'اتصال به سیستم حساب کاربری برقرار نشد. اینترنتت را چک کن و دوباره امتحان کن.' })
    } finally {
      setBusy(false)
    }
  }

  const isLogin = mode === 'login'

  return (
    <div className="auth-card">
      <h1>{isLogin ? 'خوش برگشتی' : 'به کوتلت‌لند بپیوند'}</h1>
      <p className="auth-lead">
        {isLogin ? 'با ایمیل و رمزت وارد شو.' : 'یک اکانت بساز تا پروفایل، آمار و تیکت‌هایت یک‌جا باشند.'}
      </p>

      <form onSubmit={submit} className="form">
        {!isLogin && (
          <div className="field">
            <label htmlFor="username">نام کاربری</label>
            <input id="username" dir="ltr" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <span className="hint">ترجیحاً همان نام داخل بازی. حرف انگلیسی، عدد و _</span>
          </div>
        )}
        <div className="field">
          <label htmlFor="email">ایمیل</label>
          <input id="email" dir="ltr" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">رمز عبور</label>
          <input
            id="password"
            dir="ltr"
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            minLength={isLogin ? undefined : 8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLogin && <span className="hint">حداقل 8 کاراکتر</span>}
        </div>
        <button className="btn btn-primary btn-block" disabled={busy} type="submit">
          {busy ? 'کمی صبر کن…' : isLogin ? 'ورود' : 'ساخت اکانت'}
        </button>
      </form>

      {message && <div className={`notice notice-${message.kind}`} role={message.kind === 'err' ? 'alert' : 'status'}>{message.text}</div>}

      <p className="auth-switch">
        {isLogin ? <>اکانت نداری؟ <Link href="/register">ثبت‌نام کن</Link></> : <>اکانت داری؟ <Link href="/login">وارد شو</Link></>}
      </p>
    </div>
  )
}
