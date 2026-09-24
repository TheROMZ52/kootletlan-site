import { requireAdmin } from '@/lib/auth'

export async function getAdmin() {
  return requireAdmin()
}
