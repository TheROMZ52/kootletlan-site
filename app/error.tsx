'use client'

import Link from 'next/link'
import { SiteMark } from '@/components/site-logo'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container empty-page">
      <SiteMark size={72} />
      <h1>یک چیزی خراب شد</h1>
      <p>مشکل از سمت ماست، نه تو. دوباره امتحان کن؛ اگر ادامه داشت به پشتیبانی خبر بده.</p>
      <div className="row">
        <button className="btn btn-primary" type="button" onClick={reset}>دوباره امتحان کن</button>
        <Link className="btn btn-ghost" href="/support">پشتیبانی</Link>
      </div>
    </div>
  )
}
