'use client'

import { useEffect, useState } from 'react'

type Log = { id: string; action: string; target_username: string | null; details: string | null; created_at: string; admin_username: string }

const labels: Record<string, string> = {
  role: 'تغییر نقش',
  email_verified: 'تغییر تأیید ایمیل',
  account_banned: 'مسدودسازی',
  account_unbanned: 'رفع مسدودی',
  minecraft_unlinked: 'قطع اتصال Minecraft',
  sessions_revoked: 'خروج اجباری',
  password_reset: 'ریست رمز',
  player_rank_changed: 'تغییر رنک بازیکن'
}

export function AdminAuditPanel() {
  const [logs, setLogs] = useState<Log[]>([])
  const [query, setQuery] = useState('')
  const [action, setAction] = useState('')
  const [notice, setNotice] = useState('')

  async function load() {
    const r = await fetch('/api/admin/audit?search=' + encodeURIComponent(query) + '&action=' + encodeURIComponent(action), { cache: 'no-store' })
    const d = await r.json()
    if (!r.ok) throw Error(d.error || 'خطا')
    setLogs(d.logs || [])
  }

  useEffect(() => { load().catch(e => setNotice(e.message)) }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    load().catch(e => setNotice(e.message))
  }

  return <div>
    <form className="admin-player-search" onSubmit={submit}>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="جستجوی ادمین، کاربر یا جزئیات…" />
      <select value={action} onChange={e => setAction(e.target.value)}>
        <option value="">همه فعالیت‌ها</option>
        {Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
      <button className="btn btn-primary" type="submit">فیلتر</button>
    </form>
    <div className="table-wrap">
      <table>
        <thead><tr><th>زمان</th><th>ادمین</th><th>عملیات</th><th>هدف</th><th>جزئیات</th></tr></thead>
        <tbody>{logs.map(log => <tr key={log.id}><td>{new Date(log.created_at).toLocaleString('fa-IR')}</td><td>{log.admin_username}</td><td>{labels[log.action] || log.action}</td><td>{log.target_username || '—'}</td><td>{log.details || '—'}</td></tr>)}</tbody>
      </table>
    </div>
    {!logs.length && <p className="empty">لاگی پیدا نشد.</p>}
    {notice && <div className="notice">{notice}</div>}
  </div>
}
