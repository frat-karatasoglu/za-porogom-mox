import { useEffect, useState } from 'react'
import {
  classifyPlacement,
  evaluatePlacesForGhost,
  explainMatch,
  occupancyExcludingGhost,
} from '../../domain/allocation'
import { formatDateFull } from '../../domain/dates'
import { HARD_RULE_LABELS } from '../../domain/labels'
import type { Assignment, Ghost, Place, PlaceEvaluation } from '../../domain/types'
import { GhostPortrait } from './GhostPortrait'
import { Alert, Badge } from './Primitives'
import { ConditionChips, deadlineInfo, ghostStatus } from './ghostView'
import {
  IconAlert,
  IconCalendar,
  IconChevronDown,
  IconClose,
  IconDots,
  IconPencil,
  IconPulse,
  IconThermometer,
  IconTrash,
  IconWarning,
  PLACE_TYPE_ICON,
} from './icons'

interface Props {
  ghost: Ghost
  places: Place[]
  assignments: Assignment[]
  today: string
  onAssign: (ghostId: string, placeId: string, force?: boolean) => void
  onUnassign: (ghostId: string) => void
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

/** Короткая подпись под названием места в списке проверенных вариантов. */
function placeSummary(evaluation: PlaceEvaluation): string {
  if (evaluation.eligible) return explainMatch(evaluation)
  const blockedOnlyByCapacity =
    evaluation.violations.length === 1 && evaluation.violations[0]?.code === 'capacity'
  if (blockedOnlyByCapacity) return 'Все условия соблюдены'
  const first = evaluation.violations.find((rule) => rule.code !== 'capacity')
  return first?.message ?? 'Не подходит по условиям'
}

/** Сколько мест показывать сразу: список отсортирован, сверху самые подходящие. */
const VISIBLE_PLACES = 3

export function GhostDetails({
  ghost,
  places,
  assignments,
  today,
  onAssign,
  onUnassign,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  const [choice, setChoice] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [allPlaces, setAllPlaces] = useState(false)

  const placesById = new Map(places.map((place) => [place.id, place]))
  const occupancy = occupancyExcludingGhost(assignments, ghost.id)
  const evaluations = evaluatePlacesForGhost(ghost, places, occupancy)
  const evaluationsById = new Map(evaluations.map((item) => [item.placeId, item]))

  const assignment = assignments.find((item) => item.ghostId === ghost.id)
  const currentPlace = assignment ? placesById.get(assignment.placeId) : undefined
  const deadline = deadlineInfo(ghost, today)
  const placement = classifyPlacement(evaluations)
  const status = ghostStatus(
    ghost,
    today,
    currentPlace?.name ?? null,
    placement,
    assignment?.forced ?? false,
  )

  // При переходе к другому делу сбрасываем незавершённый ручной выбор.
  useEffect(() => {
    setChoice('')
    setMenuOpen(false)
    setAllPlaces(false)
  }, [ghost.id])

  // Текущее место всегда остаётся на виду, даже если по баллам оно не в тройке.
  const shownEvaluations = allPlaces
    ? evaluations
    : evaluations.filter(
        (item, index) => index < VISIBLE_PLACES || item.placeId === assignment?.placeId,
      )

  const chosenEvaluation = choice ? evaluationsById.get(choice) : undefined
  const chosenIsCurrent = choice !== '' && assignment?.placeId === choice

  return (
    <section className="card dossier" aria-label={`Дело ${ghost.caseNumber}`}>
      <div className="dossier__top">
        <Badge tone="brand">Дело {ghost.caseNumber}</Badge>
        <div className="dossier__menu">
          <button
            type="button"
            className="icon-btn"
            aria-expanded={menuOpen}
            aria-label="Действия с заявкой"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <IconDots size={18} />
          </button>
        </div>
        <button
          type="button"
          className="icon-btn dossier__close"
          onClick={onClose}
          aria-label="Закрыть дело"
        >
          <IconClose size={18} />
        </button>
      </div>

      {menuOpen ? (
        <div className="chips">
          <button type="button" className="btn btn--sm" onClick={onEdit}>
            <IconPencil size={15} /> Изменить заявку
          </button>
          {assignment ? (
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => onUnassign(ghost.id)}
            >
              Снять размещение
            </button>
          ) : null}
          <button type="button" className="btn btn--sm btn--danger" onClick={onDelete}>
            <IconTrash size={15} /> Удалить дело
          </button>
        </div>
      ) : null}

      <div className="dossier__identity">
        <GhostPortrait kind={ghost.avatar} size={88} alt={`Портрет: ${ghost.name}`} />
        <div>
          <h2 className="dossier__name">{ghost.name}</h2>
          <div className="chips" style={{ marginTop: 7 }}>
            <Badge tone={status.badgeTone}>{status.badgeText}</Badge>
            {deadline.overdue ? null : <Badge tone={deadline.tone}>{deadline.text}</Badge>}
          </div>
        </div>
      </div>

      <div className="dossier__facts">
        <div className="dossier__fact">
          <IconThermometer size={17} className="icon dossier__fact-icon" />
          <div>
            <div className="dossier__fact-label">Температура</div>
            <div className="dossier__fact-value">{ghost.preferredTemp}°C</div>
          </div>
        </div>
        <div className="dossier__fact">
          <IconPulse size={17} className="icon dossier__fact-icon" />
          <div>
            <div className="dossier__fact-label">Тревожность</div>
            <div className="dossier__fact-value">{ghost.anxiety}/10</div>
          </div>
        </div>
        <div className="dossier__fact">
          <IconCalendar size={17} className="icon dossier__fact-icon" />
          <div>
            <div className="dossier__fact-label">Срок</div>
            <div className="dossier__fact-value">{formatDateFull(ghost.deadline)}</div>
          </div>
        </div>
      </div>

      <div>
        <div className="section-label">Условия переселения</div>
        <ConditionChips ghost={ghost} />
      </div>

      {assignment && currentPlace ? (
        <div>
          <div className="section-label">Где сейчас</div>
          <Alert kind="info">
            {assignment.forced
              ? `Размещено в «${currentPlace.name}» вопреки условиям (${evaluationsById.get(currentPlace.id)?.violations.length ?? 0}). Отмечено в отчёте.`
              : `«${currentPlace.name}», ${assignment.score} баллов. ${
                  assignment.source === 'manual' ? 'Выбрано вручную.' : 'Автоподбор.'
                }`}
          </Alert>
        </div>
      ) : (
        <div>
          <div className="section-label">
            {placement === 'awaiting' ? 'Что дальше' : 'Почему пока нет места'}
          </div>
          <Alert
            kind={placement === 'awaiting' ? 'info' : deadline.overdue ? 'error' : 'warning'}
            icon={<IconAlert size={17} />}
          >
            {placement === 'awaiting'
              ? `Подходящих мест: ${evaluations.filter((item) => item.eligible).length}. Запустите автоподбор или выберите место вручную.`
              : placement === 'all-eligible-full'
                ? 'Все места, подходящие по условиям, заняты. Освободите место или измените условия заявки.'
                : deadline.overdue
                  ? `Срок вышел: ${deadline.text.toLowerCase()}. Заявка идёт первой в очереди автоподбора, но ни одно место не проходит по условиям.`
                  : 'Ни одно место не проходит по особым условиям заявки.'}
          </Alert>
        </div>
      )}

      <div>
        <div className="section-label">
          Проверенные места
          {evaluations.length > VISIBLE_PLACES ? (
            <button
              type="button"
              className="link-btn section-label__action"
              onClick={() => setAllPlaces((open) => !open)}
            >
              {allPlaces
                ? 'Свернуть'
                : `Показать все (${evaluations.length})`}
            </button>
          ) : null}
        </div>
        <div className="checked-places">
          {shownEvaluations.map((evaluation) => {
            const place = placesById.get(evaluation.placeId)
            if (!place) return null
            const PlaceIcon = PLACE_TYPE_ICON[place.type]
            const isCurrent = assignment?.placeId === place.id
            const blockedOnlyByCapacity =
              evaluation.violations.length === 1 &&
              evaluation.violations[0]?.code === 'capacity'

            return (
              <div
                key={place.id}
                className={`checked-place${isCurrent ? ' checked-place--current' : ''}`}
              >
                <PlaceIcon size={22} className="icon checked-place__icon" />
                <div className="checked-place__main">
                  <div className="checked-place__name">{place.name}</div>
                  <div className="checked-place__hint">{placeSummary(evaluation)}</div>
                </div>
                {isCurrent ? (
                  <Badge tone="ok">Здесь сейчас</Badge>
                ) : blockedOnlyByCapacity ? (
                  <Badge tone="warn">
                    Занято {place.capacity}/{place.capacity}
                  </Badge>
                ) : evaluation.eligible ? (
                  <Badge tone="ok">{evaluation.score} баллов</Badge>
                ) : (
                  <Badge tone="danger">Не подходит</Badge>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="manual">
        <div className="section-label">Переселить вручную</div>
        <div className="select">
          <select
            value={choice}
            onChange={(event) => setChoice(event.target.value)}
            aria-label="Выберите место для ручного переселения"
          >
            <option value="">Выберите место…</option>
            {places.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name}
              </option>
            ))}
          </select>
          <IconChevronDown size={18} className="icon select__chevron" />
        </div>

        {chosenEvaluation && !chosenIsCurrent ? (
          chosenEvaluation.eligible ? (
            <div className="manual__validation manual__validation--ok">
              Подходит: все условия соблюдены, {chosenEvaluation.score} баллов.
            </div>
          ) : (
            <div className="manual__validation">
              <IconWarning size={16} />
              <span>
                Не подходит:{' '}
                {chosenEvaluation.violations
                  .map((rule) => `${HARD_RULE_LABELS[rule.code].toLowerCase()} — ${rule.message}`)
                  .join(' ')}
              </span>
            </div>
          )
        ) : null}

        {chosenIsCurrent ? (
          <div className="manual__validation manual__validation--ok">
            Заявка уже размещена здесь.
          </div>
        ) : null}

        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={!chosenEvaluation || !chosenEvaluation.eligible || chosenIsCurrent}
          onClick={() => {
            if (!chosenEvaluation) return
            onAssign(ghost.id, chosenEvaluation.placeId)
            setChoice('')
          }}
        >
          Подтвердить переселение
        </button>

        {chosenEvaluation && !chosenEvaluation.eligible ? (
          <button
            type="button"
            className="btn btn--danger btn--block"
            onClick={() => {
              onAssign(ghost.id, chosenEvaluation.placeId, true)
              setChoice('')
            }}
          >
            Разместить вопреки условиям
          </button>
        ) : null}
      </div>

      <div className="dossier__footer">
        <button type="button" className="link-btn" onClick={onEdit}>
          <IconPencil size={15} /> Изменить заявку
        </button>
      </div>
    </section>
  )
}
