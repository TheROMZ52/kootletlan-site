'use client'

import { useState } from 'react'

export function MinecraftLink({ linkedUsername = '' }: { linkedUsername?: string }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [unlinking, setUnlinking] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function generate() {
    setBusy(true)
    setError('')
    setMessage('')
    setCode('')
    try {
      const response = await fetch('/api/minecraft/link', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'ساخت کد ناموفق بود.')
      setCode(data.code)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ساخت کد ناموفق بود.')
    } finally {
      setBusy(false)
    }
  }

  async function unlink() {
    if (!window.confirm('مطمئنی می‌خواهی اتصال Minecraft را قطع کنی؟')) return
    setUnlinking(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/minecraft/unlink', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'قطع اتصال ناموفق بود.')
      setMessage('اتصال Minecraft با موفقیت قطع شد.')
      setCode('')
      window.location.reload()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'قطع اتصال ناموفق بود.')
    } finally {
      setUnlinking(false)
    }
  }

  return <div className="link-card">
    {linkedUsername ? (
      <>
        <p className="muted">حساب Minecraft <strong className="ltr">{linkedUsername}</strong> به این حساب سایت متصل است.</p>
        <button className="btn btn-danger" type="button" onClick={unlink} disabled={unlinking}>{unlinking ? 'در حال قطع اتصال…' : 'قطع اتصال Minecraft'}</button>
      </>
    ) : (
      <>
        <p className="muted">برای اتصال اکانت سایت به بازیکن Minecraft، کد موقت بگیر و داخل بازی با دستور <code>/link کد</code> استفاده کن.</p>
        <button className="btn btn-primary" type="button" onClick={generate} disabled={busy}>{busy ? 'در حال ساخت…' : 'ساخت کد اتصال'}</button>
      </>
    )}
    {error && <div className="notice notice-error">{error}</div>}
    {message && <div className="notice notice-ok">{message}</div>}
    {code && <div className="notice notice-ok"><strong className="ltr">{code}</strong><br />این کد ۱۰ دقیقه اعتبار دارد و فقط یک‌بار قابل استفاده است.</div>}
  </div>
}
