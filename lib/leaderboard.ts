import { db } from '@/lib/db'

export type TopMetric = 'playtime_minutes' | 'coins' | 'kills'
export type TopPlayer = { username: string; value: number }

// column names come from this whitelist only, never from user input
const COLUMNS: Record<TopMetric, string> = {
  playtime_minutes: 'playtime_minutes',
  coins: 'coins',
  kills: 'kills'
}

export async function getTopPlayers(metric: TopMetric, limit = 10): Promise<TopPlayer[]> {
  const column = COLUMNS[metric]
  const size = Math.min(Math.max(Math.trunc(limit), 1), 50)
  try {
    const [rows] = await db.execute<any[]>(
      `SELECT username, ${column} AS value FROM players WHERE ${column} > 0 ORDER BY ${column} DESC, username ASC LIMIT ${size}`
    )
    return rows.map((row) => ({ username: String(row.username), value: Number(row.value) }))
  } catch (error) {
    console.error('[leaderboard] could not load players:', error)
    return []
  }
}
