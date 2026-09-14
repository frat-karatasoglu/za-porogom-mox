import { useMemo, useState } from 'react'
import type { UnplacedStatus } from '../../domain/allocation'
import type { Ghost } from '../../domain/types'
import type { BureauState } from '../../state/useBureau'
import { GhostCard } from '../components/GhostCard'
import { GhostDetails } from '../components/GhostDetails'
import { GhostForm } from '../components/GhostForm'
import { PageHead } from '../components/PageHead'
import { EmptyState } from '../components/Primitives'
import { StatsStrip } from '../components/StatsStrip'
import { deadlineInfo } from '../components/ghostView'
import {
  IconFile,
  IconPlus,
  IconRotate,
  IconSearch,
  IconSliders,
  IconSparkles,
} from '../components/icons'

type Filter = 'all' | 'unplaced' | 'placed' | 'overdue'

const FILTER_LABELS: Record<Filter, string> = {
  all: 'Все',
  unplaced: 'Без места',
  placed: 'Расселены',
  overdue: 'Просроченные',
}

export function ApplicationsTab({ data, today, report, actions }: BureauState) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<{ ghost: Ghost | null } | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [onlyWithConditions, setOnlyWithConditions] = useState(false)

  const assignmentsByGhost = useMemo(
    () => new Map(data.assignments.map((assignment) => [assignment.ghostId, assignment])),
    [data.assignments],
  )
  const placesById = useMemo(
    () => new Map(data.places.map((place) => [place.id, place])),
    [data.places],
  )
  const reasonByGhost = useMemo(
    () =>
      new Map<string, UnplacedStatus>(
        report.problemGhosts.map((problem) => [problem.ghost.id, problem.reason]),
      ),
    [report.problemGhosts],
  )

  const counts = useMemo(
    () => ({
      all: data.ghosts.length,
      placed: report.placed,
      unplaced: report.unplaced,
      overdue: report.overdue,
    }),
    [data.ghosts.length, report.placed, report.unplaced, report.overdue],
  )

  const visibleGhosts = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return data.ghosts.filter((ghost) => {
      const assigned = assignmentsByGhost.has(ghost.id)
      if (filter === 'unplaced' && assigned) return false
      if (filter === 'placed' && !assigned) return false
      if (filter === 'overdue' && !deadlineInfo(ghost, today).overdue) return false

      if (onlyWithConditions) {
        const { conditions } = ghost
        const hasAny =
          conditions.needsAttic ||
          conditions.fearsMirrors ||
          conditions.avoidsHumans ||
          conditions.noTickingClocks ||
          conditions.noBells ||
          conditions.needsDraught ||
          conditions.maxLight !== null ||
          conditions.maxNoise !== null ||
          conditions.forbiddenTypes.length > 0
        if (!hasAny) return false
      }

      if (needle.length === 0) return true
      return (
        ghost.name.toLowerCase().includes(needle) ||
        ghost.caseNumber.toLowerCase().includes(needle) ||
        ghost.note.toLowerCase().includes(needle)
      )
    })
  }, [data.ghosts, assignmentsByGhost, filter, today, query, onlyWithConditions])

  const selected = data.ghosts.find((ghost) => ghost.id === selectedId) ?? null

  const head = (
    <PageHead
      eyebrow="Рабочий стол оператора"
      title="Заявки на переселение"
      subtitle="Новый дом для тех, кто задержался между мирами"
      actions={
        <>
          <button type="button" className="btn" onClick={() => setEditing({ ghost: null })}>
            <IconPlus size={17} /> Новая заявка
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={actions.runAllocation}
            disabled={data.ghosts.length === 0 || data.places.length === 0}
          >
            <IconSparkles size={17} /> Подобрать места
          </button>
        </>
      }
    />
  )

  if (editing) {
    return (
      <>
        {head}
        <GhostForm
          ghost={editing.ghost}
          ghosts={data.ghosts}
          today={today}
          onSave={(ghost) => {
            actions.saveGhost(ghost)
            setSelectedId(ghost.id)
            setEditing(null)
          }}
          onCancel={() => setEditing(null)}
        />
      </>
    )
  }

  if (data.ghosts.length === 0) {
    return (
      <>
        {head}
        <div className="card">
          <EmptyState
            icon={<IconFile size={34} />}
            title="Заявок пока нет"
            text="Очередь пуста: подбирать некого. Создайте первую заявку вручную или верните демо-данные, чтобы посмотреть, как бюро работает целиком."
            action={
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => setEditing({ ghost: null })}
                >
                  <IconPlus size={17} /> Новая заявка
                </button>
                <button type="button" className="btn" onClick={actions.resetDemo}>
                  <IconRotate size={17} /> Вернуть демо-данные
                </button>
              </div>
            }
          />
        </div>
      </>
    )
  }

  const tabs: Filter[] = filter === 'overdue' ? ['all', 'unplaced', 'placed', 'overdue'] : ['all', 'unplaced', 'placed']

  return (
    <>
      {head}
      <StatsStrip report={report} onShowOverdue={() => setFilter('overdue')} />

      <div className="workspace">
        <section className="card queue">
          <div className="queue__head">
            <h2 className="queue__title">
              Очередь заявок <span className="count-pill">{counts.all}</span>
            </h2>
            <div className="queue__tools">
              <div className="search">
                <IconSearch size={17} className="icon search__icon" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Найти заявку…"
                  aria-label="Поиск по имени, номеру дела и заметке"
                />
              </div>
              <button
                type="button"
                className="icon-btn"
                aria-pressed={onlyWithConditions}
                aria-label="Показать только заявки с особыми условиями"
                title="Только заявки с особыми условиями"
                onClick={() => setOnlyWithConditions((value) => !value)}
              >
                <IconSliders size={18} />
              </button>
            </div>
          </div>

          <div className="filter-tabs" role="tablist" aria-label="Фильтр заявок">
            {tabs.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                className="filter-tab"
                aria-selected={filter === key}
                onClick={() => setFilter(key)}
              >
                {FILTER_LABELS[key]}
                <span className="count-pill">{counts[key]}</span>
              </button>
            ))}
          </div>

          {visibleGhosts.length === 0 ? (
            <EmptyState
              icon={<IconSearch size={32} />}
              title="Ничего не нашлось"
              text="В этой выборке нет заявок. Измените запрос или вернитесь ко всем делам."
              action={
                <button
                  type="button"
                  className="btn btn--sm"
                  onClick={() => {
                    setFilter('all')
                    setQuery('')
                    setOnlyWithConditions(false)
                  }}
                >
                  Сбросить фильтры
                </button>
              }
            />
          ) : (
            <div className="case-grid">
              {visibleGhosts.map((ghost) => {
                const assignment = assignmentsByGhost.get(ghost.id)
                const place = assignment ? placesById.get(assignment.placeId) : undefined
                return (
                  <GhostCard
                    key={ghost.id}
                    ghost={ghost}
                    today={today}
                    placeName={place?.name ?? null}
                    reason={reasonByGhost.get(ghost.id) ?? null}
                    forced={assignment?.forced ?? false}
                    selected={selectedId === ghost.id}
                    onSelect={() =>
                      setSelectedId((current) => (current === ghost.id ? null : ghost.id))
                    }
                  />
                )
              })}
            </div>
          )}

          <div className="queue__footer">
            Показано {visibleGhosts.length} из {counts.all} заявок
          </div>
        </section>

        {selected ? (
          <>
            <div
              className="dossier-backdrop"
              role="presentation"
              onClick={() => setSelectedId(null)}
            />
            <GhostDetails
              ghost={selected}
              places={data.places}
              assignments={data.assignments}
              today={today}
              onAssign={actions.assignManually}
              onUnassign={actions.unassign}
              onEdit={() => setEditing({ ghost: selected })}
              onDelete={() => {
                actions.removeGhost(selected.id)
                setSelectedId(null)
              }}
              onClose={() => setSelectedId(null)}
            />
          </>
        ) : (
          <section className="card">
            <EmptyState
              icon={<IconFile size={32} />}
              title="Выберите дело"
              text="Откройте карточку слева, чтобы увидеть условия переселения, объяснение решения и все проверенные места с причинами отказа."
            />
          </section>
        )}
      </div>
    </>
  )
}
