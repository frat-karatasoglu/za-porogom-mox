import type { UnplacedStatus } from '../../domain/allocation'
import { daysUntil, formatDate, formatDays } from '../../domain/dates'
import { PLACED_LABEL } from '../../domain/grammar'
import { conditionLabels } from '../../domain/labels'
import type { Ghost } from '../../domain/types'
import { Badge, type Tone } from './Primitives'
import { CONDITION_ICON } from './icons'

export interface DeadlineInfo {
  tone: Tone
  text: string
  daysLeft: number
  overdue: boolean
}

export function deadlineInfo(ghost: Ghost, today: string): DeadlineInfo {
  const daysLeft = daysUntil(ghost.deadline, today)
  if (daysLeft < 0) {
    return {
      tone: 'danger',
      text: `Просрочено на ${formatDays(daysLeft)}`,
      daysLeft,
      overdue: true,
    }
  }
  if (daysLeft === 0) {
    return { tone: 'warn', text: 'Срок истекает сегодня', daysLeft, overdue: false }
  }
  if (daysLeft <= 3) {
    return { tone: 'warn', text: `Осталось ${formatDays(daysLeft)}`, daysLeft, overdue: false }
  }
  return { tone: 'neutral', text: `До ${formatDate(ghost.deadline)}`, daysLeft, overdue: false }
}

export type StatusLineTone = 'muted' | 'warn' | 'danger'

export interface GhostStatus {
  badgeText: string
  badgeTone: Tone
  lineText: string
  lineTone: StatusLineTone
  lineIcon: 'pin' | 'warning'
}

/**
 * Статус заявки для карточки: подпись строится из реального результата
 * подбора, а не задаётся вручную.
 */
export function ghostStatus(
  ghost: Ghost,
  today: string,
  placeName: string | null,
  reason: UnplacedStatus | null,
  forced: boolean,
): GhostStatus {
  const overdue = deadlineInfo(ghost, today).overdue

  if (placeName) {
    return {
      badgeText: forced ? 'Вопреки условиям' : PLACED_LABEL[ghost.gender],
      badgeTone: forced ? 'warn' : 'ok',
      lineText: placeName,
      lineTone: 'muted',
      lineIcon: 'pin',
    }
  }

  if (overdue) {
    return {
      badgeText: 'Просрочена',
      badgeTone: 'danger',
      lineText: 'Срок переселения истёк',
      lineTone: 'danger',
      lineIcon: 'warning',
    }
  }

  if (reason === 'awaiting' || reason === null) {
    return {
      badgeText: 'Ожидает места',
      badgeTone: 'warn',
      lineText: 'Подходящие места есть — ждёт подбора',
      lineTone: 'muted',
      lineIcon: 'warning',
    }
  }

  return {
    badgeText: 'Нет места',
    badgeTone: 'warn',
    lineText:
      reason === 'all-eligible-full' ? 'Подходящее место занято' : 'Нет подходящего места',
    lineTone: 'warn',
    lineIcon: 'warning',
  }
}

export function ConditionChips({
  ghost,
  variant = 'full',
  limit,
}: {
  ghost: Ghost
  variant?: 'short' | 'full'
  limit?: number
}) {
  const labels = conditionLabels(ghost)
  if (labels.length === 0) {
    return (
      <span className="field__hint">Особых условий нет — подойдёт любое свободное место.</span>
    )
  }

  const shown = limit ? labels.slice(0, limit) : labels
  const rest = labels.length - shown.length

  if (variant === 'short') {
    return (
      <div className="case__chips">
        {shown.map((label) => (
          <span key={label.full} className="case__chip">
            {label.short}
          </span>
        ))}
        {rest > 0 ? <span className="case__chip">+{rest}</span> : null}
      </div>
    )
  }

  return (
    <div className="chips">
      {shown.map((label) => {
        const Icon = CONDITION_ICON[label.icon]
        return (
          <span key={label.full} className="chip">
            <Icon size={15} />
            {label.full}
          </span>
        )
      })}
    </div>
  )
}

export function AnxietyBadge({ anxiety }: { anxiety: number }) {
  const tone: Tone = anxiety >= 9 ? 'danger' : anxiety >= 7 ? 'warn' : 'neutral'
  return <Badge tone={tone}>Тревожность {anxiety}/10</Badge>
}
