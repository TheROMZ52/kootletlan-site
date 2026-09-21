'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function logout() {
    setBusy(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.push('/')
      router.refresh()
    }
  }

  return <button className="btn btn-ghost btn-small" onClick={logout} disabled={busy} type="button">{busy ? 'در حال خروج…' : 'خروج'}</button>
}
