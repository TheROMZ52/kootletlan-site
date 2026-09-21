'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type ServerState = {
  online: boolean
  players?: { online: number; max: number }
  version?: string | null
}

type Phase = 'loading' | 'ready' | 'error'
type Value = { status: ServerState | null; phase: Phase; checkedAt: number | null }

const StatusContext = createContext<Value>({ status: null, phase: 'loading', checkedAt: null })
const REFRESH_MS = 30_000

/** One shared poll for the whole page (header pill, hero, status page) instead of one per widget. */
export function StatusProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<Value>({ status: null, phase: 'loading', checkedAt: null })

  useEffect(() => {
    let stopped = false

    async function load() {
      if (document.hidden) return
      try {
        const response = await fetch('/api/status', { signal: AbortSignal.timeout(8000) })
        if (!response.ok) throw new Error('bad status')
        const data = (await response.json()) as ServerState
        if (!stopped) setValue({ status: data, phase: 'ready', checkedAt: Date.now() })
      } catch {
        // keep the last known state if we have one; otherwise say we don't know
        if (!stopped) setValue((v) => (v.status ? v : { status: null, phase: 'error', checkedAt: null }))
      }
    }

    load()
    const timer = window.setInterval(load, REFRESH_MS)
    const onVisible = () => { if (!document.hidden) load() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      stopped = true
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return <StatusContext.Provider value={value}>{children}</StatusContext.Provider>
}

export function useServerStatus() {
  return useContext(StatusContext)
}
