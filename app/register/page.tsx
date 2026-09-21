import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth-form'

export const metadata: Metadata = { title: 'ثبت‌نام', robots: { index: false } }

export default function RegisterPage() {
  return <div className="container auth-wrap"><AuthForm mode="register" /></div>
}
