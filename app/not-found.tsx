import Link from 'next/link'
import { SiteMark } from '@/components/site-logo'

export default function NotFound() {
  return (
    <div className="container empty-page">
      <SiteMark size={72} />
      <h1>این لایه گم شد</h1>
      <p>صفحه‌ای که دنبالش بودی پیدا نشد. ولی بقیه‌ی ساندویچ سر جایش است.</p>
      <Link className="btn btn-primary" href="/">برگشت به صفحه‌ی اصلی</Link>
    </div>
  )
}
