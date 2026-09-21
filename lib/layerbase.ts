import mysql from 'mysql2/promise'
import { isValidMinecraftName } from '@/lib/format'

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------
const databaseUrl = process.env.LAYERBASE_API_URL // mysql://user:pass@host:port/db
const apiUrl = process.env.LAYERBASE_QUERY_API_URL // optional HTTP fallback
const apiKey = process.env.LAYERBASE_API_KEY
const databaseId = process.env.LAYERBASE_DATABASE_ID

type Param = string | number | boolean | null
type PoolHolder = { __layerbasePool?: mysql.Pool }
const holder = globalThis as unknown as PoolHolder

function getPool() {
  if (!databaseUrl) return null
  if (holder.__layerbasePool) return holder.__layerbasePool
  const url = new URL(databaseUrl)
  holder.__layerbasePool = mysql.createPool({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, '')),
    ssl: { rejectUnauthorized: true },
    waitForConnections: true,
    connectionLimit: 4,
    queueLimit: 0,
    connectTimeout: 8000
  })
  return holder.__layerbasePool
}

export function layerbaseConfigured() {
  return Boolean(databaseUrl || (apiUrl && apiKey && databaseId))
}

/** Only used by the HTTP fallback, which cannot take bound parameters. Escapes everything MariaDB treats specially. */
function inlineParam(value: Param) {
  if (value === null) return 'NULL'
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL'
  if (typeof value === 'boolean') return value ? '1' : '0'
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z')
  return `'${escaped}'`
}

export async function layerbaseQuery<T extends Record<string, unknown> = Record<string, unknown>>(
  sql: string,
  params: Param[] = []
): Promise<T[]> {
  if (!layerbaseConfigured()) return []

  if (databaseUrl) {
    const pool = getPool()
    if (!pool) return []
    // Bound parameters: user input can never change the shape of the query.
    const [rows] = await pool.query({ sql, values: params, timeout: 8000 })
    return rows as T[]
  }

  let i = 0
  const inlined = sql.replace(/\?/g, () => inlineParam(params[i++] ?? null))
  const response = await fetch(`${apiUrl!.replace(/\/$/, '')}/v1/databases/${encodeURIComponent(databaseId!)}/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: inlined }),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000)
  })
  if (!response.ok) throw new Error(`Layerbase query failed (${response.status})`)

  const data = (await response.json()) as { rows?: unknown[][]; columns?: string[] }
  const columns = Array.isArray(data.columns) ? data.columns : []
  const rows = Array.isArray(data.rows) ? data.rows : []
  return rows.map((row) => Object.fromEntries(columns.map((c, idx) => [c, row[idx]]))) as T[]
}

// ---------------------------------------------------------------------------
// Types + row normalisation (plain, serialisable values only)
// ---------------------------------------------------------------------------
export type LayerbasePlayer = {
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

export type LayerbaseProduct = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  currency: string
  category: string | null
  accent: string | null
  popular: boolean
  active: boolean
}

export type LayerbasePurchase = {
  id: string
  product_name: string
  amount: number
  currency: string
  status: string
  created_at: string
}

const iso = (v: unknown) => {
  if (!v) return null
  const d = v instanceof Date ? v : new Date(String(v))
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}
const str = (v: unknown) => (v == null ? null : String(v))

function toPlayer(r: Record<string, unknown>): LayerbasePlayer {
  return {
    uuid: String(r.uuid),
    username: String(r.username),
    skin_url: str(r.skin_url),
    rank_name: str(r.rank_name),
    rank_prefix: str(r.rank_prefix),
    rank_suffix: str(r.rank_suffix),
    rank_weight: Number(r.rank_weight ?? 0),
    online: Boolean(Number(r.online ?? 0)),
    playtime_minutes: Number(r.playtime_minutes ?? 0),
    coins: Number(r.coins ?? 0),
    kills: Number(r.kills ?? 0),
    deaths: Number(r.deaths ?? 0),
    first_joined_at: iso(r.first_joined_at),
    last_seen_at: iso(r.last_seen_at)
  }
}

function toProduct(r: Record<string, unknown>): LayerbaseProduct {
  return {
    id: String(r.id),
    name: String(r.name),
    slug: String(r.slug),
    description: str(r.description),
    price: Number(r.price ?? 0),
    currency: String(r.currency ?? 'COINS'),
    category: str(r.category),
    accent: str(r.accent),
    popular: Boolean(Number(r.popular ?? 0)),
    active: Boolean(Number(r.active ?? 1))
  }
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
export async function getPlayerByUsername(username: string): Promise<LayerbasePlayer | null> {
  const name = username.trim()
  if (!isValidMinecraftName(name)) return null
  const rows = await layerbaseQuery(
    `SELECT uuid, username, skin_url, rank_name, rank_prefix, rank_suffix, rank_weight, online,
            playtime_minutes, coins, kills, deaths, first_joined_at, last_seen_at
       FROM players
      WHERE LOWER(username) = LOWER(?)
      LIMIT 1`,
    [name]
  )
  return rows[0] ? toPlayer(rows[0]) : null
}

export async function getStoreProducts(): Promise<LayerbaseProduct[]> {
  const rows = await layerbaseQuery(
    `SELECT id, name, slug, description, price, currency, category, accent, popular, active
       FROM store_products
      WHERE active = 1
      ORDER BY price ASC`
  )
  return rows.map(toProduct)
}

/**
 * Purchase history is private. Only call this for an account whose Minecraft identity has been
 * VERIFIED (see README, "Account linking"). It is intentionally not used by the pages yet.
 */
export async function getPlayerPurchases(uuid: string): Promise<LayerbasePurchase[]> {
  const rows = await layerbaseQuery(
    `SELECT p.id, s.name AS product_name, p.amount, p.currency, p.status, p.created_at
       FROM store_purchases p
       JOIN store_products s ON s.id = p.product_id
      WHERE p.player_uuid = ?
      ORDER BY p.created_at DESC
      LIMIT 12`,
    [uuid]
  )
  return rows.map((r) => ({
    id: String(r.id),
    product_name: String(r.product_name),
    amount: Number(r.amount ?? 0),
    currency: String(r.currency ?? 'COINS'),
    status: String(r.status ?? ''),
    created_at: iso(r.created_at) ?? ''
  }))
}
