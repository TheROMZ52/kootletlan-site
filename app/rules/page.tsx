import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { rules } from '@/lib/data'

export const metadata: Metadata = {
  title: 'قوانین سرور',
  description: 'قوانین سرور ماینکرفت کوتلت‌لند؛ قوانین چت، بازی منصفانه، ساخت‌وساز و گزارش تخلف را قبل از ورود بخوان.'
}

export default function RulesPage() {
  return (
    <>
      <PageHeader title="قوانین" lead="چند قانون ساده تا بازی برای همه منصفانه بماند. قبل از ورود بخوانشان." />
      <div className="container">
        <ol className="rules">
          {rules.map((rule, i) => (
            <li key={rule.title}>
              <span className="rule-no" aria-hidden="true">{i + 1}</span>
              <div>
                <h2>قانون {i + 1}: {rule.title}</h2>
                <p>{rule.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="rules-foot">تخلفی دیدی؟ <Link className="text-link" href="/support">از پشتیبانی گزارش بده</Link>.</p>
      </div>
    </>
  )
}
