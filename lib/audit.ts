import { db } from '@/lib/db'

export async function logAdminAction(adminId: string, action: string, targetUserId: string | null = null, targetUsername: string | null = null, details: string | null = null) {
  await db.execute(
    'INSERT INTO admin_audit_logs (admin_id, action, target_user_id, target_username, details) VALUES (?, ?, ?, ?, ?)',
    [adminId, action.slice(0, 64), targetUserId, targetUsername?.slice(0, 16) || null, details?.slice(0, 1000) || null]
  )
}
