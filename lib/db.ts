import mysql from 'mysql2/promise'

const url = process.env.DATABASE_URL

if (!url) throw new Error('DATABASE_URL is not configured')

export const db = mysql.createPool({
  uri: url,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  enableKeepAlive: true
})
