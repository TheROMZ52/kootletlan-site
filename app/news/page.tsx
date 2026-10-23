import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { NewsRow } from '@/components/news-row'
import { getNews } from '@/lib/news'
import { RelatedLinks } from '@/components/related-links'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 60
export const metadata: Metadata = pageMetadata({
  title: 'اخبار ماینکرفت',
  description: 'آخرین اخبار، اطلاعیه‌ها، به‌روزرسانی‌ها و راهنماهای کتلت‌لند، سرور ماینکرفت فارسی.',
  path: '/news'
})

export default async function NewsPage() {
  const news = await getNews()
  return (
    <>
      <PageHeader title="اخبار" path="/news" lead="آپدیت‌ها، اطلاعیه‌ها و اتفاق‌های کتلت‌لند." />
      <div className="container">
        {news.length ? (
          <ul className="news-list">{news.map((item) => <NewsRow key={item.slug} item={item} />)}</ul>
        ) : (
          <p className="empty">هنوز خبری منتشر نشده.</p>
        )}
      </div>
      <RelatedLinks keys={['status', 'rules', 'support']} />
    </>
  )
}
