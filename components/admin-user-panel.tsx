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
    setNotice('')
  }

  async function save() {
    if (!editing) return
    setBusy(true)
    setNotice('')
    try {
      const r = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: editing.id, role, email_verified: verified })
      })
      const d = await r.json()
      if (!r.ok) throw Error(d.error || 'ذخیره نشد')
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
      <button className="btn btn-primary" disabled={busy || (editing.id === adminId && role !== 'admin')} onClick={save}>{busy ? 'در حال ذخیره…' : 'ذخیره تغییرات'}</button>
      {notice && <div className="notice">{notice}</div>}
    </div>}
  </div>
}
