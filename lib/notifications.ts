import { db } from '@/lib/db'

export async function notifyUser(userId: string, title: string, message: string, type = 'system', link: string | null = null) {
  await db.execute(
    'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
    [userId, title.slice(0, 160), message.slice(0, 1000), type.slice(0, 32), link?.slice(0, 500) || null]
  )
}

export async function notifyAdmins(title: string, message: string, type = 'system', link: string | null = null) {
  const [admins] = await db.execute<any[]>('SELECT id FROM users WHERE role = ? LIMIT 100', ['admin'])
  for (const admin of admins) {
    await notifyUser(String(admin.id), title, message, type, link)
  }
}
