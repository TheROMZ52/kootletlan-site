// All numbers use Latin digits (game data reads better that way); dates use the Persian calendar.
const LOCALE = 'fa-IR-u-nu-latn'
const TZ = 'Asia/Tehran'

export function formatNumber(value: number | string | null | undefined) {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? new Intl.NumberFormat('en-US').format(n) : '0'
}

function toDate(value: string | Date | null | undefined) {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDate(value: string | Date | null | undefined) {
  const d = toDate(value)
  if (!d) return '—'
  return new Intl.DateTimeFormat(LOCALE, { year: 'numeric', month: 'long', day: 'numeric', timeZone: TZ }).format(d)
}

export function formatDateTime(value: string | Date | null | undefined) {
  const d = toDate(value)
  if (!d) return '—'
  return new Intl.DateTimeFormat(LOCALE, {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: TZ
  }).format(d)
}

export function formatPlaytime(minutes: number | null | undefined) {
  const total = Math.max(0, Math.floor(Number(minutes ?? 0)))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m} دقیقه`
  return m === 0 ? `${h} ساعت` : `${h} ساعت و ${m} دقیقه`
}

/** Minecraft Java names: 3-16 chars of A-Z a-z 0-9 _ ; we also allow "." (Bedrock/Geyser prefix) and up to 32 chars. */
export const MINECRAFT_NAME = /^[A-Za-z0-9_.]{2,32}$/
export function isValidMinecraftName(value: string) {
  return MINECRAFT_NAME.test(value)
}
