'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function logout() {
    setBusy(true)
    try {
      if (isSupabaseConfigured()) await createClient().auth.signOut()
    } finally {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <button className="btn btn-ghost btn-small" onClick={logout} disabled={busy} type="button">
      {busy ? 'در حال خروج…' : 'خروج'}
    </button>
  )
}
