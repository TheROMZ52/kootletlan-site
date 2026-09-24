'use client'

import { useEffect, useState } from 'react'

type Notification = {
  id: number
  title: string
  message: string
  type: string
  link: string | null
  created_at: string
}

export function NotificationsPanel() {
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const response = await fetch('/api/notifications', { cache: 'no-store' })
      if (!response.ok) return
      const data = await response.json()
      setItems(Array.isArray(data.notifications) ? data.notifications : [])
    } finally {
      setLoading(false)
    }
  }

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    setItems([])
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <section className="block block-wide" aria-labelledby="notifications-title">
      <div className="admin-player-editor-head">
        <h2 id="notifications-title">اعلان‌ها</h2>
        {items.length > 0 && <button className="button button-ghost" type="button" onClick={markAllRead}>خواندم همه را</button>}
      </div>
      {loading ? <p className="muted">در حال بررسی اعلان‌ها...</p> : !items.length ? <p className="muted">اعلان جدیدی نداری.</p> : (
        <div className="notification-list">
          {items.map(item => (
            <article className="notification-item" key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.message}</p>
              </div>
              {item.link && <a className="text-link" href={item.link}>مشاهده</a>}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
