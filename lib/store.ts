import { db } from '@/lib/db'

export type StoreProduct = {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  popular: boolean
}

export async function getStoreProducts() {
  const [rows] = await db.execute<any[]>(
    'SELECT id, name, description, price, currency, popular FROM store_products WHERE active = TRUE ORDER BY popular DESC, id ASC'
  )
  return rows as StoreProduct[]
}
