import Link from 'next/link'
import { JsonLd } from '@/components/json-ld'
import { absoluteUrl } from '@/lib/site'

export type Crumb = { name: string; path: string }

/** Visible breadcrumb trail + BreadcrumbList structured data. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path)
    }))
  }

  return (
    <nav className="crumbs" aria-label="مسیر صفحه">
      <ol>
        {items.map((crumb, index) => (
          <li key={crumb.path}>
            {index < items.length - 1 ? (
              <Link href={crumb.path}>{crumb.name}</Link>
            ) : (
              <span aria-current="page">{crumb.name}</span>
            )}
          </li>
        ))}
      </ol>
      <JsonLd data={data} />
    </nav>
  )
}
