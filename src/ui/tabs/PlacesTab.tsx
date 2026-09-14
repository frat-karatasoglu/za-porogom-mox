import { computeOccupancy } from '../../domain/allocation'
import {
  PLACE_TYPE_LABELS,
  describeHumidity,
  describeLevel,
} from '../../domain/labels'
import type { BureauState } from '../../state/useBureau'
import { PageHead } from '../components/PageHead'
import { PlaceIllustration } from '../components/PlaceIllustration'
import { Badge, EmptyState, Meter, type Tone } from '../components/Primitives'
import { IconPin, IconRotate } from '../components/icons'

function loadTone(occupied: number, capacity: number): Tone {
  if (occupied > capacity) return 'danger'
  if (occupied >= capacity) return 'warn'
  return 'ok'
}

export function PlacesTab({ data, report, actions }: BureauState) {
  const occupancy = computeOccupancy(data.assignments)
  const ghostsById = new Map(data.ghosts.map((ghost) => [ghost.id, ghost]))

  const openCapacity = data.places
    .filter((place) => !place.restrictions.closedForIntake)
    .reduce((sum, place) => sum + place.capacity, 0)

  const head = (
    <PageHead
      eyebrow="Рабочий стол оператора"
      title="Места переселения"
      subtitle={
        report.closedSlotsTotal > 0
          ? `Свободно ${report.freeSlotsTotal} из ${openCapacity} мест · ещё ${report.closedSlotsTotal} в местах, закрытых на приём`
          : `Свободно ${report.freeSlotsTotal} из ${openCapacity} мест`
      }
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
          const closed = place.restrictions.closedForIntake

          const params = [
            { label: 'Температура', value: `${place.temperature} °C` },
            { label: 'Освещённость', value: `${place.light}/10 · ${describeLevel(place.light)}` },
            { label: 'Шум', value: `${place.noise}/10 · ${describeLevel(place.noise)}` },
            { label: 'Влажность', value: `${place.humidity}% · ${describeHumidity(place.humidity)}` },
          ]

          return (
            <article
              key={place.id}
              className={`card place-card${overloaded ? ' place-card--overloaded' : ''}${
                closed ? ' place-card--closed' : ''
              }`}
            >
              <header className="place-card__head">
                <PlaceIllustration type={place.type} size={76} />
                <div className="place-card__title">
                  <div className="place-card__name">{place.name}</div>
                  <div className="place-card__type">{PLACE_TYPE_LABELS[place.type]}</div>
                </div>
              </header>

              {/*
                У закрытого места «0 / 2» читалось бы как два свободных места,
                поэтому статус приёма стоит прямо в строке занятости.
              */}
              <div>
                {closed ? (
                  <div className="place-card__occupancy place-card__occupancy--closed">
                    <strong>Приём закрыт</strong>
                    <span>
                      {occupied} из {place.capacity} · новых жильцов не принимает
                    </span>
                  </div>
                ) : (
                  <div className="place-card__occupancy">
                    <strong>
                      {occupied} / {place.capacity}
                    </strong>
                    <span>
                      {overloaded
                        ? 'превышена вместимость'
                        : occupied >= place.capacity
                          ? 'мест нет'
                          : `свободно ${place.capacity - occupied}`}
                    </span>
                  </div>
                )}
                <Meter
                  className={closed ? 'meter--closed' : undefined}
                  value={closed ? 0 : place.capacity === 0 ? 1 : occupied / place.capacity}
                  tone={loadTone(occupied, place.capacity)}
                  label={
                    closed
                      ? `${place.name}: приём закрыт`
                      : `Заполненность: ${place.name}`
                  }
                />
              </div>

              <div className="chips">
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

              <dl className="params">
                {params.map((param) => (
                  <div key={param.label} className="param">
                    <dt className="param__label">{param.label}</dt>
                    <dd className="param__value">{param.value}</dd>
                  </div>
                ))}
              </dl>

              {place.note ? <p className="place-note">{place.note}</p> : null}

              <div>
                <div className="section-label">Жильцы</div>
                {residents.length === 0 ? (
                  <p className="place-empty">
                    {closed ? 'Никого нет: место закрыто на приём.' : 'Пока никого не заселили.'}
                  </p>
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
