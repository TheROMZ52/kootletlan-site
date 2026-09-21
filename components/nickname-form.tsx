'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { isValidMinecraftName } from '@/lib/format'

export function NicknameForm({ userId, initial, fallbackUsername }: { userId: string; initial: string; fallbackUsername: string }) {
  const router = useRouter()
  const [value, setValue] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setMessage(null)
    const nickname = value.trim()

    if (nickname && !isValidMinecraftName(nickname)) {
      setMessage({ kind: 'err', text: 'نام Minecraft فقط می‌تواند حرف انگلیسی، عدد، _ و نقطه داشته باشد.' })
      return
    }
    if (!isSupabaseConfigured()) {
      setMessage({ kind: 'err', text: 'سیستم حساب کاربری هنوز روی این سایت فعال نشده است.' })
      return
    }

    setBusy(true)
    try {
      const supabase = createClient()
      const nextValue = nickname || null

      // .select() lets us see whether a row was really updated (an update that matches 0 rows is not an error).
      const { data, error } = await supabase.from('profiles').update({ minecraft_nickname: nextValue }).eq('id', userId).select('id')
      if (error) throw error

      if (!data?.length) {
        const insert = await supabase.from('profiles').insert({
          id: userId,
          username: fallbackUsername || null,
          minecraft_nickname: nextValue
        })
        if (insert.error) throw insert.error
      }

      setMessage({ kind: 'ok', text: nickname ? 'ذخیره شد.' : 'نام بازیکن حذف شد.' })
      router.refresh()
    } catch {
      setMessage({ kind: 'err', text: 'ذخیره نشد. چند لحظه بعد دوباره امتحان کن.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save} className="form">
      <div className="field">
        <label htmlFor="nickname">نام کاربری در Minecraft</label>
        <input id="nickname" dir="ltr" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Steve" autoComplete="off" spellCheck={false} />
        <span className="hint">دقیقاً همان‌طور که داخل بازی نوشته می‌شود (با حروف کوچک و بزرگ).</span>
      </div>
      <button className="btn btn-primary" disabled={busy} type="submit">{busy ? 'در حال ذخیره…' : 'ذخیره'}</button>
      {message && <div className={`notice notice-${message.kind}`} role={message.kind === 'err' ? 'alert' : 'status'}>{message.text}</div>}
    </form>
  )
}
