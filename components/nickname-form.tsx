'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { isValidMinecraftName } from '@/lib/format'

export function NicknameForm({ initial }: { userId: string; initial: string; fallbackUsername: string }) {
  const router = useRouter()
  const [value, setValue] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setMessage(null)
    const nickname = value.trim()
    if (nickname && !isValidMinecraftName(nickname)) return setMessage({ kind: 'err', text: 'نام Minecraft نامعتبر است.' })
    setBusy(true)
    try {
      const response = await fetch('/api/profile/nickname', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ nickname }) })
      const text = await response.text()
      let data: any = {}
      try {
        if (text) data = JSON.parse(text)
      } catch {
        data = { error: `پاسخ نامعتبر از سرور (HTTP ${response.status}).` }
      }
      if (!response.ok) throw new Error(data.error || 'ذخیره نشد.')
      setMessage({ kind: 'ok', text: nickname ? 'ذخیره شد.' : 'نام بازیکن حذف شد.' })
      router.refresh()
    } catch (error) {
      setMessage({ kind: 'err', text: error instanceof Error ? error.message : 'ذخیره نشد.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save} className="form">
      <div className="field"><label htmlFor="nickname">نام کاربری در Minecraft</label><input id="nickname" dir="ltr" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Steve" autoComplete="off" spellCheck={false} /><span className="hint">دقیقاً همان‌طور که داخل بازی نوشته می‌شود.</span></div>
      <button className="btn btn-primary" disabled={busy} type="submit">{busy ? 'در حال ذخیره…' : 'ذخیره'}</button>
      {message && <div className={`notice notice-${message.kind}`} role={message.kind === 'err' ? 'alert' : 'status'}>{message.text}</div>}
    </form>
  )
}
