'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const USERNAME = /^[A-Za-z0-9_]{3,16}$/

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
    if (mode === 'register' && !USERNAME.test(username)) return setMessage({ kind: 'err', text: 'نام کاربری باید 3 تا 16 کاراکتر و فقط شامل حرف انگلیسی، عدد و _ باشد.' })
    if (mode === 'register' && password.length < 8) return setMessage({ kind: 'err', text: 'رمز عبور باید حداقل 8 کاراکتر باشد.' })

    setBusy(true)
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login' ? { email: email.trim(), password } : { username, email: email.trim(), password }
      const response = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      const data = await response.json()
      if (!response.ok) {
        setMessage({ kind: 'err', text: data.error || 'مشکلی پیش آمد. دوباره امتحان کن.' })
        return
      }
      router.push('/account')
      router.refresh()
    } catch {
      setMessage({ kind: 'err', text: 'اتصال به سیستم حساب کاربری برقرار نشد.' })
    } finally {
      setBusy(false)
    }
  }

  const isLogin = mode === 'login'

  return (
    <div className="auth-card">
      <h1>{isLogin ? 'خوش برگشتی' : 'به کوتلت‌لند بپیوند'}</h1>
      <p className="auth-lead">{isLogin ? 'با ایمیل و رمزت وارد شو.' : 'یک اکانت بساز تا پروفایل، آمار و تیکت‌هایت یک‌جا باشند.'}</p>
      <form onSubmit={submit} className="form">
        {!isLogin && <div className="field"><label htmlFor="username">نام کاربری</label><input id="username" dir="ltr" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required /><span className="hint">حرف انگلیسی، عدد و _</span></div>}
        <div className="field"><label htmlFor="email">ایمیل</label><input id="email" dir="ltr" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="field"><label htmlFor="password">رمز عبور</label><input id="password" dir="ltr" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} minLength={isLogin ? undefined : 8} value={password} onChange={(e) => setPassword(e.target.value)} required />{!isLogin && <span className="hint">حداقل 8 کاراکتر</span>}</div>
        <button className="btn btn-primary btn-block" disabled={busy} type="submit">{busy ? 'کمی صبر کن…' : isLogin ? 'ورود' : 'ساخت اکانت'}</button>
      </form>
      {message && <div className={`notice notice-${message.kind}`} role={message.kind === 'err' ? 'alert' : 'status'}>{message.text}</div>}
      <p className="auth-switch">{isLogin ? <>اکانت نداری؟ <Link href="/register">ثبت‌نام کن</Link></> : <>اکانت داری؟ <Link href="/login">وارد شو</Link></>}</p>
    </div>
  )
}
