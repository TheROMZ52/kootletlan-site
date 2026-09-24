'use client'

import { useState } from 'react'

export function MinecraftLink() {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  async function generate() {
    setBusy(true)
    try {
      const response = await fetch('/api/minecraft/link', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setCode(data.code)
    } finally {
      setBusy(false)
    }
  }

  return <div className="link-card">
    <p className="muted">برای اتصال واقعی اکانت سایت به بازیکن Minecraft، کد موقت بگیر و داخل بازی با دستور <code>/link کد</code> استفاده کن.</p>
    <button className="btn btn-primary" type="button" onClick={generate} disabled={busy}>{busy ? 'در حال ساخت…' : 'ساخت کد اتصال'}</button>
    {code && <div className="notice notice-ok"><strong className="ltr">{code}</strong><br />این کد ۱۰ دقیقه اعتبار دارد.</div>}
  </div>
}
