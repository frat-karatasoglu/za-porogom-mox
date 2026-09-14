import { computeOccupancy } from '../../domain/allocation'
import {
  PLACE_TYPE_LABELS,
  describeHumidity,
  describeLevel,
} from '../../domain/labels'
import type { BureauState } from '../../state/useBureau'
import { PageHead } from '../components/PageHead'
import { Badge, EmptyState, Meter, type Tone } from '../components/Primitives'
import { IconPin, IconRotate, PLACE_TYPE_ICON } from '../components/icons'

function loadTone(occupied: number, capacity: number): Tone {
  if (occupied > capacity) return 'danger'
  if (occupied >= capacity) return 'warn'
  return 'ok'
}

export function PlacesTab({ data, report, actions }: BureauState) {
  const occupancy = computeOccupancy(data.assignments)
  const ghostsById = new Map(data.ghosts.map((ghost) => [ghost.id, ghost]))

  const head = (
    <PageHead
      eyebrow="Рабочий стол оператора"
      title="Места переселения"
      subtitle={`Свободно ${report.freeSlotsTotal} мест из ${data.places.reduce((sum, place) => sum + place.capacity, 0)}`}
    />
  )

  if (data.places.length === 0) {
    return (
      <>
        {head}
        <div className="card">
          <EmptyState
            icon={<IconPin size={34} />}
            title="Мест переселения нет"
            text="Без мест бюро не может расселить никого. Верните демо-данные, чтобы продолжить работу."
            action={
              <button type="button" className="btn btn--primary" onClick={actions.resetDemo}>
                <IconRotate size={17} /> Вернуть демо-данные
              </button>
            }
          />
        </div>
      </>
    )
  }

  return (
    <>
      {head}
      <div className="grid-cards">
        {data.places.map((place) => {
          const occupied = occupancy.get(place.id) ?? 0
          const residents = data.assignments.filter(
            (assignment) => assignment.placeId === place.id,
          )
          const overloaded = occupied > place.capacity
          const PlaceIcon = PLACE_TYPE_ICON[place.type]

          return (
            <article
              key={place.id}
              className={`card place-card${overloaded ? ' place-card--overloaded' : ''}`}
            >
              <header className="place-card__head">
                <span className="place-card__icon">
                  <PlaceIcon size={22} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="place-card__name">{place.name}</div>
                  <div className="place-card__type">{PLACE_TYPE_LABELS[place.type]}</div>
                </div>
              </header>

              <div>
                <div className="place-card__occupancy">
                  <strong>
                    {occupied} / {place.capacity}
                  </strong>
                  <span>{overloaded ? 'превышена вместимость' : 'занято мест'}</span>
                </div>
                <Meter
                  value={place.capacity === 0 ? 1 : occupied / place.capacity}
                  tone={loadTone(occupied, place.capacity)}
                  label={`Заполненность: ${place.name}`}
                />
              </div>

              <div className="chips">
                {place.restrictions.closedForIntake ? (
                  <Badge tone="warn">Закрыто на приём</Badge>
                ) : null}
                {overloaded ? <Badge tone="danger">Перегружено</Badge> : null}
                {place.restrictions.maxAnxiety !== null ? (
                  <Badge>Тревожность до {place.restrictions.maxAnxiety}</Badge>
                ) : null}
                {place.hasAttic ? <Badge>Есть чердак</Badge> : null}
                {place.hasDraught ? <Badge>Сквозняк</Badge> : null}
                {place.hasTickingClocks ? <Badge>Тикают часы</Badge> : null}
                {place.hasBells ? <Badge>Есть колокола</Badge> : null}
                {place.hasMirrors ? <Badge>Есть зеркала</Badge> : null}
                {place.hasHumans ? <Badge>В здании люди</Badge> : null}
              </div>

              <div className="params">
                <div className="param">
                  <span className="param__label">Температура</span>
                  <span className="param__value">{place.temperature} °C</span>
                </div>
                <div className="param">
                  <span className="param__label">Освещённость</span>
                  <span className="param__value">
                    {place.light}/10 · {describeLevel(place.light)}
                  </span>
                </div>
                <div className="param">
                  <span className="param__label">Шум</span>
                  <span className="param__value">
                    {place.noise}/10 · {describeLevel(place.noise)}
                  </span>
                </div>
                <div className="param">
                  <span className="param__label">Влажность</span>
                  <span className="param__value">
                    {place.humidity}% · {describeHumidity(place.humidity)}
                  </span>
                </div>
              </div>

              {place.note ? <p className="place-note">{place.note}</p> : null}

              <div>
                <div className="section-label">Жильцы</div>
                {residents.length === 0 ? (
                  <p className="field__hint">Пока никого не заселили.</p>
                ) : (
                  <div className="residents">
                    {residents.map((assignment) => {
                      const ghost = ghostsById.get(assignment.ghostId)
                      return (
                        <div key={assignment.ghostId} className="resident">
                          <span className="resident__name">
                            {ghost?.name ?? assignment.ghostId}
                          </span>
                          {assignment.forced ? (
                            <Badge tone="warn">вопреки условиям</Badge>
                          ) : null}
                          <Badge>{assignment.score} б.</Badge>
                          <button
                            type="button"
                            className="btn btn--sm btn--ghost"
                            onClick={() => actions.unassign(assignment.ghostId)}
                          >
                            Выселить
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
