import type { ReactNode } from 'react'

export function PageHead({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <header className="page-head">
      <div>
        <div className="page-head__eyebrow">{eyebrow}</div>
        <h1 className="page-head__title">{title}</h1>
        {subtitle ? <p className="page-head__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-head__actions">{actions}</div> : null}
    </header>
  )
}
