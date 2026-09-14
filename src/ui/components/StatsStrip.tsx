import type { BureauReport } from '../../domain/report'
import { IconArrowRight, IconClock, IconDoor, IconFile } from './icons'

interface Props {
  report: BureauReport
  onShowOverdue: () => void
}

/**
 * Полоса показателей. Все числа берутся из отчёта, который считается от
 * текущих размещений, — в разметке нет ни одного зашитого значения.
 */
export function StatsStrip({ report, onShowOverdue }: Props) {
  return (
    <div className="card stats">
      <div className="stat">
        <IconFile size={19} className="icon stat__icon" />
        <span className="stat__value">{report.total}</span>
        <span className="stat__label">{plural(report.total, 'заявка', 'заявки', 'заявок')}</span>
      </div>

      <div className="stat">
        <span className="stat__dot" style={{ background: 'var(--ok)' }} />
        <span className="stat__value">{report.placed}</span>
        <span className="stat__label">расселены</span>
      </div>

      <div className="stat">
        <span className="stat__dot" style={{ background: 'var(--warn)' }} />
        <span className="stat__value">{report.unplaced}</span>
        <span className="stat__label">без места</span>
      </div>

      <div className="stat">
        <IconDoor size={19} className="icon stat__icon" />
        <span className="stat__value">{report.freeSlotsTotal}</span>
        <span className="stat__label">
          {plural(report.freeSlotsTotal, 'свободное место', 'свободных места', 'свободных мест')}
        </span>
      </div>

      <div className="stat stat--action">
        <IconClock
          size={19}
          className="icon stat__icon"
          style={{ color: report.overdue > 0 ? 'var(--warn)' : undefined }}
        />
        <button
          type="button"
          className={`stat__link${report.overdue > 0 ? '' : ' stat__link--quiet'}`}
          onClick={onShowOverdue}
          disabled={report.overdue === 0}
        >
          {report.overdue}{' '}
          {plural(report.overdue, 'просрочена', 'просрочены', 'просрочено')}
          <IconArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

function plural(count: number, one: string, few: string, many: string): string {
  const lastTwo = Math.abs(count) % 100
  const last = Math.abs(count) % 10
  if (lastTwo >= 11 && lastTwo <= 14) return many
  if (last === 1) return one
  if (last >= 2 && last <= 4) return few
  return many
}
