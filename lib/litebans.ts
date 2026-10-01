import { db } from '@/lib/db'

export type LiteBansPunishment = {
  id: string | number
  type: 'ban' | 'mute' | 'warn' | 'kick'
  label: 'بن' | 'میوت' | 'اخطار' | 'کیک'
  reason: string
  staff: string
  removedBy: string | null
  removedReason: string | null
  time: number
  until: number
  serverScope: string | null
  serverOrigin: string | null
  active: boolean
  status: 'active' | 'expired' | 'removed'
}

const sources = [
  { type: 'ban', label: 'بن', table: 'litebans_bans', staffColumn: 'banned_by_name' },
  { type: 'mute', label: 'میوت', table: 'litebans_mutes', staffColumn: 'muted_by_name' },
  { type: 'warn', label: 'اخطار', table: 'litebans_warnings', staffColumn: 'warned_by_name' },
  { type: 'kick', label: 'کیک', table: 'litebans_kicks', staffColumn: 'kicked_by_name' }
] as const

export async function getLiteBansPunishments(uuid: string, limit = 100): Promise<LiteBansPunishment[]> {
  const result: LiteBansPunishment[] = []

  for (const source of sources) {
    try {
      const sql = [
        'SELECT id, reason, time, until, removed_by_name, removed_by_reason,',
        source.staffColumn + ', server_scope, server_origin',
        'FROM `' + source.table + '`',
        'WHERE uuid = ?',
        'ORDER BY time DESC',
        'LIMIT 200'
      ].join(' ')
      const [rows] = await db.execute<any[]>(sql, [uuid])

      for (const row of rows) {
        const time = Number(row.time || 0)
        const until = Number(row.until || 0)
        const removedBy = row.removed_by_name ? String(row.removed_by_name) : null
        const active = !removedBy && (until <= 0 || until > Date.now())

        result.push({
          id: row.id ?? source.type + '-' + time,
          type: source.type,
          label: source.label,
          reason: row.reason ? String(row.reason) : 'بدون دلیل',
          staff: row[source.staffColumn] ? String(row[source.staffColumn]) : 'نامشخص',
          removedBy,
          removedReason: row.removed_by_reason ? String(row.removed_by_reason) : null,
          time,
          until,
          serverScope: row.server_scope ? String(row.server_scope) : null,
          serverOrigin: row.server_origin ? String(row.server_origin) : null,
          active,
          status: removedBy ? 'removed' : active ? 'active' : 'expired'
        })
      }
    } catch {}
  }

  return result
    .sort((a, b) => b.time - a.time)
    .slice(0, Math.max(1, Math.min(limit, 500)))
}