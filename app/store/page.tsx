import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { getStoreProducts } from '@/lib/layerbase'
import { formatNumber } from '@/lib/format'

export const revalidate = 60
export const metadata: Metadata = { title: 'فروشگاه' }

type Item = { id: string; name: string; description: string; price: number; currency: string; popular: boolean }

const currencyLabel: Record<string, string> = { COINS: 'سکه' }
const tierClass = ['tier-lettuce', 'tier-mustard', 'tier-tomato']

async function loadItems(): Promise<Item[]> {
  try {
    const rows = await getStoreProducts()
    if (rows.length) {
      return rows.map((r) => ({
        id: r.id, name: r.name, description: r.description ?? '', price: r.price, currency: r.currency, popular: r.popular
      }))
    }
  } catch (error) {
    console.error('[store] could not load products:', error)
  }
  return []
}

export default async function StorePage() {
  const items = await loadItems()

  return (
    <>
      <PageHeader
        title="فروشگاه"
        lead="پکیج‌های حمایتی کوتلت‌لند. خرید آنلاین هنوز فعال نشده و به‌زودی از همین صفحه انجام می‌شود."
      />
      <div className="container">
        {items.length === 0 && (
          <p className="empty">پکیج‌ها هنوز اضافه نشده‌اند. به‌زودی رنک‌ها و پکیج‌های حمایتی اینجا نمایش داده می‌شوند.</p>
        )}
        <ul className="tiers">
          {items.map((item, i) => (
            <li key={item.id} className={`tier ${tierClass[i % tierClass.length]}`}>
              {item.popular && <span className="tier-flag">پیشنهادی</span>}
              <h2>{item.name}</h2>
              <p>{item.description}</p>
              <p className="tier-price">
                <span className="game-num">{formatNumber(item.price)}</span>
                <span>{currencyLabel[item.currency] ?? item.currency}</span>
              </p>
              <button className="btn btn-ghost btn-block" type="button" disabled>به‌زودی</button>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
