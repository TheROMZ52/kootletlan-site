import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth-form'

export const metadata: Metadata = { title: 'ورود', robots: { index: false } }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const notice = error === 'callback' ? 'لینک تأیید معتبر نبود یا منقضی شده. وارد شو یا دوباره ثبت‌نام کن.' : undefined
  return <div className="container auth-wrap"><AuthForm mode="login" notice={notice} /></div>
}
