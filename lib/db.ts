import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

function getPool() {
  if (pool) return pool
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not configured')
  pool = mysql.createPool(url)
  return pool
}

export const db = new Proxy({} as mysql.Pool, {
  get(_, property) {
    const target = getPool() as any
    const value = target[property]
    return typeof value === 'function' ? value.bind(target) : value
  }
})
