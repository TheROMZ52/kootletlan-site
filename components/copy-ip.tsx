'use client'

import { useRef, useState } from 'react'

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // older browsers / non-secure contexts
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(area)
      return ok
    } catch {
      return false
    }
  }
}

export function CopyIp({ address, compact = false }: { address: string; compact?: boolean }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const addressRef = useRef<HTMLElement>(null)
  const timer = useRef<number | undefined>(undefined)

  async function copy() {
    const ok = await writeClipboard(address)
    if (!ok && addressRef.current) {
      // let the person copy by hand
      const range = document.createRange()
      range.selectNodeContents(addressRef.current)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
    setState(ok ? 'copied' : 'failed')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState('idle'), 2200)
  }

  return (
    <div className={compact ? 'plate plate-compact' : 'plate'}>
      <code className="plate-address" dir="ltr" ref={addressRef}>{address}</code>
      <button className="btn btn-primary" type="button" onClick={copy}>
        {state === 'copied' ? 'کپی شد' : state === 'failed' ? 'دستی کپی کن' : 'کپی'}
      </button>
      <span className="sr-only" role="status">
        {state === 'copied' ? 'آدرس سرور کپی شد' : state === 'failed' ? 'کپی خودکار انجام نشد، آدرس انتخاب شد' : ''}
      </span>
    </div>
  )
}
