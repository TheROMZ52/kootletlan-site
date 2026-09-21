'use client'

import Link from 'next/link'
import { useServerStatus } from './status-provider'

function label(phase: string, online: boolean | undefined) {
  if (phase === 'loading') return 'در حال بررسی'
  if (phase === 'error') return 'وضعیت نامشخص'
  return online ? 'آنلاین' : 'آفلاین'
}

function dotClass(phase: string, online: boolean | undefined) {
  if (phase !== 'ready') return 'dot dot-idle'
  return online ? 'dot dot-on' : 'dot dot-off'
}

/** Small pill for the header. */
export function StatusPill() {
  const { status, phase } = useServerStatus()
  const count = status?.online && status.players ? status.players.online : null
  return (
    <Link href="/status" className="pill" aria-label={`وضعیت سرور: ${label(phase, status?.online)}`}>
      <span className={dotClass(phase, status?.online)} aria-hidden="true" />
      <span className="pill-text">{count != null ? `${count} آنلاین` : label(phase, status?.online)}</span>
    </Link>
  )
}

/** One-line status used in the hero. */
export function StatusLine() {
  const { status, phase } = useServerStatus()
  return (
    <p className="status-line" aria-live="polite">
      <span className={dotClass(phase, status?.online)} aria-hidden="true" />
      <strong>{label(phase, status?.online)}</strong>
      {status?.online && status.players && <span>{status.players.online} از {status.players.max} بازیکن</span>}
      {status?.online && status.version && <span className="ltr">{status.version}</span>}
    </p>
  )
}

/** Full board for the status page. */
export function StatusBoard() {
  const { status, phase, checkedAt } = useServerStatus()
  const online = status?.online
  const players = status?.players
  const fill = players && players.max > 0 ? Math.min(100, Math.round((players.online / players.max) * 100)) : 0

  return (
    <section className={`board ${phase === 'ready' ? (online ? 'board-on' : 'board-off') : ''}`} aria-live="polite">
      <div className="board-state">
        <span className={dotClass(phase, online)} aria-hidden="true" />
        <span className="board-word">{label(phase, online)}</span>
      </div>

      <dl className="board-grid">
        <div>
          <dt>بازیکن‌های آنلاین</dt>
          <dd className="game-num">
            {online && players ? <>{players.online}<small> / {players.max}</small></> : '—'}
          </dd>
          <div className="meter" role="presentation"><i style={{ width: `${fill}%` }} /></div>
        </div>
        <div>
          <dt>نسخه</dt>
          <dd className="game-num ltr">{online && status?.version ? status.version : '—'}</dd>
        </div>
      </dl>

      <p className="board-note">
        {phase === 'error'
          ? 'الان نمی‌توانیم وضعیت را بگیریم. چند لحظه‌ی دیگر دوباره امتحان کن.'
          : checkedAt
            ? `آخرین بررسی ${new Intl.DateTimeFormat('fa-IR-u-nu-latn', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Tehran' }).format(checkedAt)} · هر ۳۰ ثانیه به‌روز می‌شود`
            : 'در حال بررسی…'}
      </p>
    </section>
  )
}
