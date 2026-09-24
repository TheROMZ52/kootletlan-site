'use client'

import { useEffect, useState } from 'react'

type User = {
  id: string
  username: string
  email: string
  email_verified: boolean
  role: 'user' | 'moderator' | 'admin'
  created_at: string
  minecraft_uuid: string | null
  minecraft_nickname: string | null
  display_name: string | null
}

const roleLabels = { user: 'کاربر', moderator: 'مودریتور', admin: 'ادمین' }

export function AdminUserPanel({ adminId }: { adminId: string }) {
  const [items, setItems] = useState<User[]>([])
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<User | null>(null)
  const [role, setRole] = useState<User['role']>('user')
  const [verified, setVerified] = useState(false)
  const [banned, setBanned] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [bannedUntil, setBannedUntil] = useState<string | null>(null)
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  async function load(q = '') {
    const r = await fetch('/api/admin/users?search=' + encodeURIComponent(q), { cache: 'no-store' })
    const d = await r.json()
    if (!r.ok) throw Error(d.error || 'خطا')
    setItems(d.users || [])
  }

  useEffect(() => { load().catch(e => setNotice(e.message)) }, [])

  async function search(e: React.FormEvent) {
    e.preventDefault()
    load(query).catch(e => setNotice(e.message))
  }

  function edit(user: User) {
    setEditing(user)
    setRole(user.role)
    setVerified(Boolean(user.email_verified))
    setBanned(Boolean(user.is_banned))
    setBanReason(user.ban_reason || '')
    setBannedUntil(user.banned_until ? new Date(user.banned_until).toISOString().slice(0, 16) : null)
    setTemporaryPassword(null)
    setNotice('')
  }

  async function action(body: Record<string, unknown>) {
    if (!editing) return
    setBusy(true)
    setNotice('')
    try {
      const r = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...body }) })
      const d = await r.json()
      if (!r.ok) throw Error(d.error || 'عملیات انجام نشد')
      if (d.temporaryPassword) setTemporaryPassword(d.temporaryPassword)
      setNotice('عملیات با موفقیت انجام شد.')
      await load(query)
    } catch (e) { setNotice(e instanceof Error ? e.message : 'خطا') } finally { setBusy(false) }
  }

  async function save() {
    if (!editing) return
    setBusy(true)
    setNotice('')
    try {
      const r = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: editing.id, role, email_verified: verified, is_banned: banned, ban_reason: banned ? banReason : null, banned_until: banned ? bannedUntil : null })
      })
      const d = await r.json()
      if (!r.ok) throw Error(d.error || 'ذخیره نشد')
      setTemporaryPassword(null)
      setNotice('تغییرات کاربر ذخیره شد.')
      await load(query)
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'خطا')
    } finally {
      setBusy(false)
    }
  }

  return <div>
    <form className="admin-player-search" onSubmit={search}>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="جستجوی نام، ایمیل یا Minecraft…" />
      <button className="btn btn-primary" type="submit">جستجو</button>
    </form>

    <div className="table-wrap">
      <table>
        <thead><tr><th>کاربر</th><th>نقش</th><th>Minecraft</th><th>ایمیل</th><th>عملیات</th></tr></thead>
        <tbody>{items.map(user => <tr key={user.id}>
          <td><strong>{user.username}</strong><small className="admin-player-uuid">{new Date(user.created_at).toLocaleDateString('fa-IR')}</small></td>
          <td>{roleLabels[user.role]}</td>
          <td className="ltr">{user.minecraft_nickname || '—'}</td>
          <td>{user.email_verified ? 'تأییدشده' : 'تأییدنشده'}</td>
          <td><button className="btn btn-quiet btn-small" onClick={() => edit(user)}>مدیریت</button></td>
        </tr>)}</tbody>
      </table>
    </div>

    {!items.length && <p className="empty">کاربری پیدا نشد.</p>}

    {editing && <div className="admin-player-editor">
      <div className="admin-player-editor-head">
        <h3>مدیریت {editing.username}</h3>
        <button className="btn btn-quiet btn-small" onClick={() => setEditing(null)}>بستن</button>
      </div>
      <p className="muted">{editing.email}</p>
      {editing.minecraft_nickname && <p className="muted">Minecraft: <span className="ltr">{editing.minecraft_nickname}</span></p>}
      <div className="admin-form-grid">
        <div className="field">
          <label>نقش</label>
          <select value={role} onChange={e => setRole(e.target.value as User['role'])}>
            <option value="user">کاربر</option>
            <option value="moderator">مودریتور</option>
            <option value="admin">ادمین</option>
          </select>
        </div>
        <label className="field">
          <span>ایمیل تأیید شده</span>
          <input type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)} />
        </label>
      </div>
      <div className="admin-account-actions">
        <label className="field"><span>حساب مسدود باشد</span><input type="checkbox" checked={banned} onChange={e => setBanned(e.target.checked)} /></label>
        {banned && <div className="admin-form-grid">
          <div className="field"><label>دلیل مسدودی</label><input value={banReason} onChange={e => setBanReason(e.target.value)} maxLength={500} /></div>
          <div className="field"><label>تا تاریخ</label><input type="datetime-local" value={bannedUntil || ''} onChange={e => setBannedUntil(e.target.value || null)} /></div>
        </div>}
      </div>
      <button className="btn btn-primary" disabled={busy || (editing.id === adminId && role !== 'admin')} onClick={save}>{busy ? 'در حال ذخیره…' : 'ذخیره تغییرات'}</button>
      <div className="admin-account-action-row">
        <button className="btn btn-quiet btn-small" disabled={busy || editing.id === adminId} onClick={() => action({ force_logout: true })}>خروج اجباری از همه نشست‌ها</button>
        <button className="btn btn-quiet btn-small" disabled={busy} onClick={() => action({ unlink_minecraft: true })}>قطع اتصال Minecraft</button>
        <button className="btn btn-danger btn-small" disabled={busy || editing.id === adminId} onClick={() => { if (confirm('رمز عبور جدید تولید شود؟ همه نشست‌های فعلی کاربر خارج می‌شوند.')) action({ reset_password: true }) }}>تولید رمز موقت</button>
      </div>
      {temporaryPassword && <div className="notice">رمز موقت را فقط همین الان نمایش می‌دهیم: <strong className="ltr">{temporaryPassword}</strong></div>}
      {notice && <div className="notice">{notice}</div>}
    </div>}
  </div>
}
