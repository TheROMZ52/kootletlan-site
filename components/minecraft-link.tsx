'use client'

import { useState } from 'react'

export function MinecraftLink() {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setBusy(true)
    setError('')
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

  return <div className="link-card">
    <p className="muted">برای اتصال اکانت سایت به بازیکن Minecraft، کد موقت بگیر و داخل بازی با دستور <code>/link کد</code> استفاده کن.</p>
    <button className="btn btn-primary" type="button" onClick={generate} disabled={busy}>{busy ? 'در حال ساخت…' : 'ساخت کد اتصال'}</button>
    {error && <div className="notice notice-error">{error}</div>}
    {code && <div className="notice notice-ok"><strong className="ltr">{code}</strong><br />این کد ۱۰ دقیقه اعتبار دارد و فقط یک‌بار قابل استفاده است.</div>}
  </div>
}
