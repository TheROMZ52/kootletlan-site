import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

async function admin() {
  const user = await getCurrentUser()
  return user?.role === 'admin' ? user : null
}

const sources = [
  ['ban', 'litebans_bans'],
  ['mute', 'litebans_mutes'],
  ['warn', 'litebans_warnings'],
  ['kick', 'litebans_kicks'],
] as const

export async function GET(request: Request) {
  if (!await admin()) return NextResponse.json({ error: 'دسترسی غیرمجاز.' }, { status: 403 })
  const uuid = new URL(request.url).searchParams.get('uuid')?.trim() || ''
  if (!uuid) return NextResponse.json({ error: 'UUID نامعتبر.' }, { status: 400 })

  const results: any[] = []
  for (const [type, table] of sources) {
    try {
      const [rows] = await db.execute<any[]>(`SELECT id, uuid, reason, banned_by_name, removed_by_name, removed_by_reason, time, until, server_scope, server_origin, active FROM \`${table}\` WHERE uuid = ? ORDER BY time DESC LIMIT 100`, [uuid])
      for (const row of rows) {
        const time = Number(row.time || 0)
        const until = Number(row.until || 0)
        const removed = Boolean(row.removed_by_name)
        const expired = until > 0 && until <= Date.now()
        results.push({
          id: String(row.id), type, reason: row.reason || 'بدون دلیل', staff: row.banned_by_name || 'Console',
          removedBy: row.removed_by_name || null, removedReason: row.removed_by_reason || null,
          time, until, serverScope: row.server_scope || null, serverOrigin: row.server_origin || null,
          active: Boolean(row.active), status: removed ? 'removed' : expired ? 'expired' : 'active'
        })
      }
    } catch { continue }
  }
  results.sort((a, b) => b.time - a.time)
  return NextResponse.json({ punishments: results.slice(0, 200) })
}