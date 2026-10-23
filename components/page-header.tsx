import { Breadcrumbs } from '@/components/breadcrumbs'

type Props = {
  title: string
  lead?: string
  /** When given, a breadcrumb trail (خانه › title) with BreadcrumbList markup is rendered above the title. */
  path?: string
  children?: React.ReactNode
}

export function PageHeader({ title, lead, path, children }: Props) {
  return (
    <header className="page-head container">
      {path && <Breadcrumbs items={[{ name: 'خانه', path: '/' }, { name: title, path }]} />}
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
      <div className="strip strip-short" aria-hidden="true" />
      {children}
    </header>
  )
}
