import Link from 'next/link'

const layers = [
  { href: '/news', label: 'اخبار', hint: 'تازه‌ترین اتفاق‌ها', cls: 'bun-top' },
  { href: '/status', label: 'وضعیت', hint: 'چند نفر آنلاین‌اند؟', cls: 'lettuce' },
  { href: '/store', label: 'فروشگاه', hint: 'پکیج‌های حمایتی', cls: 'patty' },
  { href: '/rules', label: 'قوانین', hint: 'قبل از ورود بخوان', cls: 'tomato' },
  { href: '/support', label: 'پشتیبانی', hint: 'گیر کردی؟', cls: 'bun-bottom' }
]

/** The homepage menu: a sandwich whose layers are the site's sections. */
export function SandwichStack() {
  return (
    <nav className="stack" aria-label="بخش‌های سایت">
      {layers.map((layer, i) => (
        <Link
          key={layer.href}
          href={layer.href}
          className={`layer layer-${layer.cls}`}
          style={{ '--i': i } as React.CSSProperties}
        >
          <span className="layer-label">{layer.label}</span>
          <span className="layer-hint">{layer.hint}</span>
        </Link>
      ))}
    </nav>
  )
}
