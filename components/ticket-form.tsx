'use client'

import { useState } from 'react'

export function TicketForm({ userId }: { userId: string }) {
  const [subject, setSubject] = useState('')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  async function send(event: React.FormEvent) {
    event.preventDefault()
    setMessage(null)
    if (subject.trim().length < 3) return setMessage({ kind: 'err', text: 'موضوع را بنویس (حداقل 3 حرف).' })
    if (text.trim().length < 10) return setMessage({ kind: 'err', text: 'مشکل را کمی کامل‌تر توضیح بده (حداقل 10 حرف).' })
    setBusy(true)
    try {
      const response = await fetch('/api/tickets', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ subject, message: text }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setSubject('')
      setText('')
      setMessage({ kind: 'ok', text: 'تیکتت ثبت شد. تیم پشتیبانی بررسی‌اش می‌کند.' })
    } catch (error) {
      setMessage({ kind: 'err', text: error instanceof Error ? error.message : 'تیکت ثبت نشد.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={send} className="form">
      <div className="field"><label htmlFor="ticket-subject">موضوع</label><input id="ticket-subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} /></div>
      <div className="field"><label htmlFor="ticket-text">توضیح</label><textarea id="ticket-text" value={text} onChange={(e) => setText(e.target.value)} rows={5} maxLength={4000} /><span className="hint">اگر بازیکنی را گزارش می‌کنی، نام او و زمان ماجرا را هم بنویس.</span></div>
      <button className="btn btn-primary" disabled={busy} type="submit">{busy ? 'در حال ارسال…' : 'ارسال تیکت'}</button>
      {message && <div className={`notice notice-${message.kind}`} role={message.kind === 'err' ? 'alert' : 'status'}>{message.text}</div>}
    </form>
  )
}
