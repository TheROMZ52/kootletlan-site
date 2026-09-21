import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { NewsRow } from '@/components/news-row'
import { getNews } from '@/lib/news'

export const revalidate = 60
export const metadata: Metadata = { title: 'اخبار' }

export default async function NewsPage() {
  const news = await getNews()
  return (
    <>
      <PageHeader title="اخبار" lead="آپدیت‌ها، اطلاعیه‌ها و اتفاق‌های کوتلت‌لند." />
      <div className="container">
        {news.length ? (
          <ul className="news-list">{news.map((item) => <NewsRow key={item.slug} item={item} />)}</ul>
        ) : (
          <p className="empty">هنوز خبری منتشر نشده.</p>
        )}
      </div>
    </>
  )
}
