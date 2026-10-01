import type { Metadata } from 'next'

export const dynamic = 'force-static'
export const metadata: Metadata = {
  title: 'پیش‌نمایش مدیریت سایت',
  robots: { index: false, follow: false },
}

const users = [
  ['TheROMZ52', 'admin', 'فعال'],
  ['PlayerOne', 'user', 'فعال'],
  ['BuilderX', 'user', 'مسدود'],
]

const players = [
  ['TheROMZ52', 'مدیریت', 'آنلاین'],
  ['PlayerOne', 'Member', 'آنلاین'],
  ['BuilderX', 'Builder', 'آفلاین'],
]

const tickets = [
  ['#1042', 'مشکل ورود', 'باز'],
  ['#1041', 'مشکل اتصال Minecraft', 'در حال بررسی'],
  ['#1039', 'پیشنهاد سایت', 'بسته'],
]

export default function AdminPreviewPage() {
  return (
    <div className="container">
      <header className="page-head">
        <h1>پیش‌نمایش مدیریت کتلت‌لند</h1>
        <p>این صفحه فقط برای دیدن ظاهر پنل است و به دیتابیس یا عملیات واقعی ادمینی وصل نیست.</p>
      </header>

      <div className="admin-stat-grid">
        <div className="admin-stat"><strong>128</strong><span>کل بازیکن‌ها</span></div>
        <div className="admin-stat"><strong>17</strong><span>آنلاین</span></div>
        <div className="admin-stat"><strong>6</strong><span>تیکت باز</span></div>
        <div className="admin-stat"><strong>24</strong><span>خبرها</span></div>
      </div>

      <section className="block block-wide">
        <h2>کاربران</h2>
        <div className="admin-table">
          {users.map(([name, role, status]) => (
            <div className="admin-row" key={name}>
              <strong>{name}</strong><span>{role}</span><span>{status}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="block block-wide">
        <h2>گزارش فعالیت‌ها</h2>
        <div className="admin-table">
          <div className="admin-row"><strong>ورود کاربر</strong><span>TheROMZ52</span><span>امروز 18:41</span></div>
          <div className="admin-row"><strong>ویرایش خبر</strong><span>Admin</span><span>امروز 17:12</span></div>
          <div className="admin-row"><strong>تغییر رتبه</strong><span>Admin</span><span>امروز 16:58</span></div>
        </div>
      </section>

      <section className="block block-wide">
        <h2>بازیکن‌ها</h2>
        <div className="admin-table">
          {players.map(([name, rank, status]) => (
            <div className="admin-row" key={name}>
              <strong>{name}</strong><span>{rank}</span><span>{status}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="block block-wide">
        <h2>تیکت‌ها</h2>
        <div className="admin-table">
          {tickets.map(([id, subject, status]) => (
            <div className="admin-row" key={id}>
              <strong>{id}</strong><span>{subject}</span><span>{status}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="block">
        <h2>اخبار</h2>
        <div className="admin-table">
          <div className="admin-row"><strong>بازگشت کتلت‌لند</strong><span>منتشر شده</span><span>امروز</span></div>
          <div className="admin-row"><strong>آپدیت سایت</strong><span>پیش‌نویس</span><span>دیروز</span></div>
        </div>
      </section>
    </div>
  )
}
