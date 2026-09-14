import type { UnplacedStatus } from '../../domain/allocation'
import { formatDate } from '../../domain/dates'
import type { Ghost } from '../../domain/types'
import { GhostPortrait } from './GhostPortrait'
import { Badge } from './Primitives'
import { ConditionChips, ghostStatus } from './ghostView'
import { IconCheck, IconPin, IconWarning } from './icons'

interface Props {
  ghost: Ghost
  today: string
  placeName: string | null
  reason: UnplacedStatus | null
  forced: boolean
  selected: boolean
  onSelect: () => void
}

export function GhostCard({
  ghost,
  today,
  placeName,
  reason,
  forced,
  selected,
  onSelect,
}: Props) {
  const status = ghostStatus(ghost, today, placeName, reason, forced)
  const StatusIcon = status.lineIcon === 'pin' ? IconPin : IconWarning

  return (
    <button type="button" className="case" aria-pressed={selected} onClick={onSelect}>
      <span className="case__number">Дело {ghost.caseNumber}</span>
      {selected ? (
        <span className="case__check">
          <IconCheck size={13} />
        </span>
      ) : null}

      <span className="case__body">
        <span className="case__portrait">
          <GhostPortrait kind={ghost.avatar} size={44} />
        </span>
        <span className="case__main">
          <span className="case__title-row">
            <span className="case__name">{ghost.name}</span>
            <Badge tone={status.badgeTone}>{status.badgeText}</Badge>
          </span>
          <span className="case__stats">
            {ghost.preferredTemp}°C · {ghost.anxiety}/10 · {formatDate(ghost.deadline)}
          </span>
          <ConditionChips ghost={ghost} variant="short" limit={2} />
        </span>
      </span>

      <span className={`case__status case__status--${status.lineTone}`}>
        <StatusIcon size={15} />
        {status.lineText}
      </span>
    </button>
  )
}
