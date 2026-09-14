import type { UnplacedStatus } from '../../domain/allocation'
import { formatDate, formatDays } from '../../domain/dates'
import type { BureauState } from '../../state/useBureau'
import { PageHead } from '../components/PageHead'
import { Alert, Badge, EmptyState, Meter } from '../components/Primitives'
import { IconChart, IconRotate, IconWarning, PLACE_TYPE_ICON } from '../components/icons'

const REASON_TEXT: Record<UnplacedStatus, string> = {
  awaiting: 'Подходящие места есть — заявка ждёт автоподбора или ручного решения.',
  'no-eligible-place': 'Ни одно место не проходит по особым условиям заявки.',
  'all-eligible-full': 'Места, подходящие по условиям, полностью заняты.',
}

export function ReportTab({ data, today, report, actions }: BureauState) {
  const head = (
    <PageHead
      eyebrow="Рабочий стол оператора"
      title="Отчёт бюро"
      subtitle={`Состояние на ${formatDate(today)}`}
    />
  )

  if (data.ghosts.length === 0) {
    return (
      <>
        {head}
        <div className="card">
          <EmptyState
            icon={<IconChart size={34} />}
            title="Отчитываться не о чем"
            text="В бюро нет ни одной заявки, поэтому сводка пуста."
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

      <div className="kpis">
        <div className="card kpi kpi--ok">
          <div className="kpi__value">{report.placed}</div>
          <div className="kpi__label">Расселено привидений</div>
        </div>
        <div className={`card kpi${report.unplaced > 0 ? ' kpi--danger' : ''}`}>
          <div className="kpi__value">{report.unplaced}</div>
          <div className="kpi__label">Осталось без места</div>
        </div>
        <div className={`card kpi${report.overdueUnplaced > 0 ? ' kpi--danger' : ''}`}>
          <div className="kpi__value">{report.overdueUnplaced}</div>
          <div className="kpi__label">Просрочены и без места</div>
        </div>
        <div className={`card kpi${report.forced > 0 ? ' kpi--warn' : ''}`}>
          <div className="kpi__value">{report.forced}</div>
          <div className="kpi__label">Размещены вопреки условиям</div>
        </div>
        <div className="card kpi">
          <div className="kpi__value">{report.freeSlotsTotal}</div>
          <div className="kpi__label">
            Свободных мест для приёма
            {report.closedSlotsTotal > 0
              ? ` · ещё ${report.closedSlotsTotal} закрыты`
              : ''}
          </div>
        </div>
      </div>

      {report.overloadedPlaces.length > 0 ? (
        <Alert kind="error" icon={<IconWarning size={18} />} className="notice-bar">
          Превышена вместимость:{' '}
          {report.overloadedPlaces
            .map((load) => `«${load.place.name}» (${load.occupied} из ${load.place.capacity})`)
            .join(', ')}
          . Такое возможно только после принудительного размещения — снимите лишних жильцов на
          вкладке «Места».
        </Alert>
      ) : null}

      <div className="report-grid">
        <section className="card panel">
          <h3 className="panel__title">Самые проблемные заявки</h3>
          <p className="panel__hint">
            Сортировка по срочности: сверху те, у кого срок ближе или уже прошёл.
          </p>
          {report.problemGhosts.length === 0 ? (
            <p className="field__hint">Все заявки расселены — проблемных нет.</p>
          ) : (
            <ul>
              {report.problemGhosts.map((problem) => (
                <li key={problem.ghost.id} className="problem">
                  <div className="problem__head">
                    <span className="problem__name">{problem.ghost.name}</span>
                    <Badge>Дело {problem.ghost.caseNumber}</Badge>
                    {problem.daysLeft < 0 ? (
                      <Badge tone="danger">
                        Просрочено на {formatDays(problem.daysLeft)}
                      </Badge>
                    ) : (
                      <Badge tone={problem.daysLeft <= 3 ? 'warn' : 'neutral'}>
                        До {formatDate(problem.ghost.deadline)}
                      </Badge>
                    )}
                  </div>
                  <p className="problem__reason">{REASON_TEXT[problem.reason]}</p>
                  {problem.blockingRules.length > 0 ? (
                    <div className="problem__rules">
                      {problem.blockingRules.slice(0, 4).map((rule) => (
                        <Badge key={rule.code}>
                          {rule.label}: закрыл {rule.count} из {data.places.length}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card panel">
          <h3 className="panel__title">Загрузка мест</h3>
          <p className="panel__hint">
            Сверху — самые загруженные. Занятость считается от текущих размещений, а не хранится
            отдельно.
          </p>
          <ul>
            {report.placeLoads.map((load) => {
              const PlaceIcon = PLACE_TYPE_ICON[load.place.type]
              return (
                <li key={load.place.id} className="load-row">
                  <span className="load-row__name">
                    <PlaceIcon size={17} />
                    {load.place.name}
                    {load.place.restrictions.closedForIntake ? (
                      <Badge tone="warn">закрыто</Badge>
                    ) : null}
                  </span>
                  <span className="load-row__value">
                    {load.occupied} / {load.place.capacity}
                  </span>
                  <Meter
                    className={`load-row__meter${load.closed ? ' meter--closed' : ''}`}
                    value={load.closed ? 0 : load.loadRatio}
                    tone={load.overloaded ? 'danger' : load.free === 0 ? 'warn' : 'ok'}
                    label={`Заполненность: ${load.place.name}`}
                  />
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </>
  )
}
