import type { ReactNode } from 'react'

export type Tone = 'neutral' | 'ok' | 'warn' | 'danger' | 'brand'

const BADGE_TONE: Record<Tone, string> = {
  neutral: '',
  ok: ' badge--ok',
  warn: ' badge--warn',
  danger: ' badge--danger',
  brand: ' badge--brand',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`badge${BADGE_TONE[tone]}`}>{children}</span>
}

const METER_TONE: Record<Tone, string> = {
  neutral: '',
  ok: ' meter__fill--ok',
  warn: ' meter__fill--warn',
  danger: ' meter__fill--danger',
  brand: '',
}

export function Meter({
  value,
  tone = 'brand',
  className,
  label,
}: {
  /** Доля заполнения от 0 до 1. */
  value: number
  tone?: Tone
  className?: string
  label?: string
}) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div
      className={`meter${className ? ` ${className}` : ''}`}
      role="meter"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={`meter__fill${METER_TONE[tone]}`} style={{ width: `${percent}%` }} />
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__text">{text}</p>
      {action}
    </div>
  )
}

export type AlertKind = 'info' | 'warning' | 'error'

export function Alert({
  kind,
  icon,
  children,
  action,
  className,
}: {
  kind: AlertKind
  icon?: ReactNode
  children: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`alert alert--${kind}${className ? ` ${className}` : ''}`} role="status">
      {icon}
      <span className="alert__text">{children}</span>
      {action}
    </div>
  )
}
