import { db } from '@/lib/db'

export type Player = {
  uuid: string
  username: string
  skin_url: string | null
  rank_name: string | null
  rank_prefix: string | null
  rank_suffix: string | null
  rank_weight: number
  online: boolean
  playtime_minutes: number
  coins: number
  kills: number
  deaths: number
  first_joined_at: string | null
  last_seen_at: string | null
}

export async function getPlayerByUsername(username: string) {
  const [rows] = await db.execute<any[]>(
    'SELECT uuid, username, skin_url, rank_name, rank_prefix, rank_suffix, rank_weight, online, playtime_minutes, coins, kills, deaths, first_joined_at, last_seen_at FROM players WHERE LOWER(username) = LOWER(?) LIMIT 1',
    [username]
  )
  return (rows[0] as Player | undefined) ?? null
}

export async function getPlayerByUuid(uuid: string) {
  const [rows] = await db.execute<any[]>(
    'SELECT uuid, username, skin_url, rank_name, rank_prefix, rank_suffix, rank_weight, online, playtime_minutes, coins, kills, deaths, first_joined_at, last_seen_at FROM players WHERE uuid = ? LIMIT 1',
    [uuid]
  )
  return (rows[0] as Player | undefined) ?? null
}

export type MinecraftServer = {
  server_id: string
  name: string
}

export type PlayerServerStats = {
  server_id: string
  uuid: string
  online: boolean
  playtime_minutes: number
  coins: number
  kills: number
  deaths: number
  first_joined_at: string | null
  last_seen_at: string | null
}

export async function getMinecraftServers() {
  const [rows] = await db.execute<any[]>(
    'SELECT server_id, name FROM minecraft_servers ORDER BY name ASC'
  )
  return rows as MinecraftServer[]
}

export async function getPlayerServerStats(uuid: string, serverId: string) {
  const [rows] = await db.execute<any[]>(
    'SELECT server_id, uuid, online, playtime_minutes, coins, kills, deaths, first_joined_at, last_seen_at FROM player_server_stats WHERE uuid = ? AND server_id = ? LIMIT 1',
    [uuid, serverId]
  )
  return (rows[0] as PlayerServerStats | undefined) ?? null
}
