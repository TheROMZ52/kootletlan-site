import Link from 'next/link'

const pages = {
  guide: { href: '/guide', label: 'شروع سریع', text: 'اولین بار است؟ مراحل اتصال و شروع بازی را ببین.' },
  leaderboard: { href: '/leaderboard', label: 'برترین‌ها', text: 'پیشتازان زمان بازی، سکه و کیل.' },
  news: { href: '/news', label: 'اخبار', text: 'آخرین اطلاعیه‌ها و آپدیت‌های کتلت‌لند.' },
  status: { href: '/status', label: 'وضعیت سرور', text: 'ببین سرور آنلاین است و چند نفر بازی می‌کنند.' },
  rules: { href: '/rules', label: 'قوانین', text: 'قبل از ورود، قوانین سرور را بخوان.' },
  store: { href: '/store', label: 'فروشگاه', text: 'پکیج‌ها و رنک‌های حمایتی سرور.' },
  support: { href: '/support', label: 'پشتیبانی', text: 'مشکلی داری؟ تیکت بفرست یا سؤال‌های پرتکرار را ببین.' }
} as const

export type RelatedKey = keyof typeof pages

/** A short "see also" block that links a page to the pages most related to it. */
export function RelatedLinks({ keys, title = 'این‌ها را هم ببین' }: { keys: RelatedKey[]; title?: string }) {
  return (
    <section className="container related" aria-labelledby="related-title">
      <h2 id="related-title">{title}</h2>
      <ul className="related-list">
        {keys.map((key) => (
          <li key={key}>
            <Link className="text-link" href={pages[key].href}>{pages[key].label}</Link>
            <p>{pages[key].text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
