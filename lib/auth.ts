import { cookies } from 'next/headers'
import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { db } from '@/lib/db'

const SESSION_COOKIE = 'kootletland_session'
const SESSION_DAYS = 30

export type CurrentUser = {
  id: string
  username: string
  email: string
  email_verified: boolean
  role: 'user' | 'moderator' | 'admin'
  is_banned: boolean
  ban_reason: string | null
  banned_until: string | null
}

function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(password, salt, 64).toString('hex')
  return { salt, hash: `scrypt:${salt}:${hash}` }
}

function verifyPassword(password: string, stored: string) {
  const parts = stored.split(':')
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false
  const expected = Buffer.from(parts[2], 'hex')
  const actual = scryptSync(password, parts[1], expected.length)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function newId() {
  return randomUUID()
}

async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000)
  await db.execute('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)', [token, userId, expires])
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires
  })
}

export async function registerUser(username: string, email: string, password: string) {
  const id = newId()
  const normalizedEmail = email.trim().toLowerCase()
  const passwordHash = hashPassword(password).hash
  await db.execute(
    'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
    [id, username, normalizedEmail, passwordHash]
  )
  await db.execute('INSERT INTO profiles (user_id, display_name) VALUES (?, ?)', [id, username])
  await createSession(id)
}

export async function loginUser(email: string, password: string) {
  const [rows] = await db.execute<any[]>('SELECT id, username, email, password_hash, email_verified, is_banned, ban_reason, banned_until FROM users WHERE email = ? LIMIT 1', [email.trim().toLowerCase()])
  const user = rows[0]
  if (!user || !verifyPassword(password, user.password_hash)) throw new Error('INVALID_CREDENTIALS')
  if (user.is_banned && (!user.banned_until || new Date(user.banned_until).getTime() > Date.now())) throw new Error('ACCOUNT_BANNED')
  await createSession(user.id)
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  const [rows] = await db.execute<any[]>(
    'SELECT u.id, u.username, u.email, u.email_verified, u.role, u.is_banned, u.ban_reason, u.banned_until FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > NOW() LIMIT 1',
    [token]
  )
  const user = rows[0]
  if (!user) {
    store.delete(SESSION_COOKIE)
    return null
  }
  return user
}

export async function logoutUser() {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (token) await db.execute('DELETE FROM sessions WHERE id = ?', [token])
  store.delete(SESSION_COOKIE)
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') return null
  return user
}
