export function PageHeader({ title, lead, children }: { title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <header className="page-head container">
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
      <div className="strip strip-short" aria-hidden="true" />
      {children}
    </header>
  )
}
