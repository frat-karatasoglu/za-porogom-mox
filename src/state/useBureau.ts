import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { allocate, evaluatePlace, occupancyExcludingGhost } from '../domain/allocation'
import { todayIso } from '../domain/dates'
import { MOVED_VERB, PLACED_VERB } from '../domain/grammar'
import { buildReport, type BureauReport } from '../domain/report'
import { createSeedData } from '../domain/seed'
import type { BureauData, Ghost, PlaceEvaluation } from '../domain/types'
import {
  createLocalStorageAdapter,
  loadBureauData,
  saveBureauData,
  type StorageAdapter,
} from './storage'

export type NoticeKind = 'info' | 'warning' | 'error'

export interface Notice {
  kind: NoticeKind
  text: string
}

export interface ManualAssignResult {
  ok: boolean
  evaluation: PlaceEvaluation
}

export interface BureauActions {
  runAllocation: () => void
  clearAssignments: () => void
  /** Без `force` размещение с нарушениями не применяется — оператор должен подтвердить. */
  assignManually: (ghostId: string, placeId: string, force?: boolean) => ManualAssignResult
  unassign: (ghostId: string) => void
  saveGhost: (ghost: Ghost) => void
  removeGhost: (ghostId: string) => void
  resetDemo: () => void
  dismissNotice: () => void
}

export interface BureauState {
  data: BureauData
  today: string
  report: BureauReport
  notice: Notice | null
  actions: BureauActions
}

export function useBureau(adapter?: StorageAdapter): BureauState {
  const storage = useRef<StorageAdapter | null>(null)
  if (storage.current === null) {
    storage.current = adapter ?? createLocalStorageAdapter()
  }

  const [today] = useState(todayIso)
  const [initial] = useState(() => loadBureauData(storage.current!, today))
  const [data, setData] = useState<BureauData>(initial.data)
  const [notice, setNotice] = useState<Notice | null>(
    initial.recoveryNotice ? { kind: 'error', text: initial.recoveryNotice } : null,
  )

  useEffect(() => {
    const error = saveBureauData(storage.current!, data)
    if (error) setNotice({ kind: 'error', text: error })
  }, [data])

  const report = useMemo(() => buildReport(data, today), [data, today])

  const runAllocation = useCallback(() => {
    setData((current) => {
      const { assignments, outcomes } = allocate(
        current.ghosts,
        current.places,
        current.assignments,
        today,
      )
      const placed = outcomes.filter((outcome) => outcome.reason === 'placed').length
      const failed = outcomes.length - placed
      setNotice({
        kind: failed > 0 ? 'warning' : 'info',
        text:
          failed > 0
            ? `Подбор завершён: размещено ${placed}, без места осталось ${failed}. Причины видны в карточках заявок.`
            : `Подбор завершён: размещены все ${placed} заявок.`,
      })
      return { ...current, assignments }
    })
  }, [today])

  const clearAssignments = useCallback(() => {
    setData((current) => ({ ...current, assignments: [] }))
    setNotice({ kind: 'info', text: 'Все размещения сняты, места освобождены.' })
  }, [])

  const assignManually = useCallback<BureauActions['assignManually']>(
    (ghostId, placeId, force = false) => {
      const ghost = data.ghosts.find((item) => item.id === ghostId)
      const place = data.places.find((item) => item.id === placeId)
      if (!ghost || !place) {
        throw new Error('Заявка или место не найдены: обновите страницу.')
      }

      const occupancy = occupancyExcludingGhost(data.assignments, ghostId)
      const evaluation = evaluatePlace(ghost, place, occupancy)

      if (!evaluation.eligible && !force) {
        return { ok: false, evaluation }
      }

      setData((current) => ({
        ...current,
        assignments: [
          ...current.assignments.filter((assignment) => assignment.ghostId !== ghostId),
          {
            ghostId,
            placeId,
            source: 'manual',
            score: evaluation.score,
            forced: !evaluation.eligible,
            assignedAt: new Date().toISOString(),
          },
        ],
      }))

      const violations = evaluation.violations.length
      setNotice(
        evaluation.eligible
          ? {
              kind: 'info',
              text: `«${ghost.name}» ${MOVED_VERB[ghost.gender]} в «${place.name}».`,
            }
          : {
              kind: 'warning',
              text: `«${ghost.name}» ${PLACED_VERB[ghost.gender]} в «${place.name}» вопреки условиям (${violations}). Размещение помечено в отчёте.`,
            },
      )

      return { ok: true, evaluation }
    },
    [data],
  )

  const unassign = useCallback((ghostId: string) => {
    setData((current) => ({
      ...current,
      assignments: current.assignments.filter((assignment) => assignment.ghostId !== ghostId),
    }))
  }, [])

  const saveGhost = useCallback((ghost: Ghost) => {
    setData((current) => {
      const exists = current.ghosts.some((item) => item.id === ghost.id)
      return {
        ...current,
        ghosts: exists
          ? current.ghosts.map((item) => (item.id === ghost.id ? ghost : item))
          : [...current.ghosts, ghost],
        // Условия заявки изменились — прежнее размещение могло стать некорректным.
        assignments: exists
          ? current.assignments.filter((assignment) => assignment.ghostId !== ghost.id)
          : current.assignments,
      }
    })
  }, [])

  const removeGhost = useCallback((ghostId: string) => {
    setData((current) => ({
      ...current,
      ghosts: current.ghosts.filter((ghost) => ghost.id !== ghostId),
      assignments: current.assignments.filter((assignment) => assignment.ghostId !== ghostId),
    }))
  }, [])

  const resetDemo = useCallback(() => {
    setData(createSeedData(today))
    setNotice({ kind: 'info', text: 'Демо-данные восстановлены, дедлайны пересчитаны от сегодня.' })
  }, [today])

  const actions = useMemo<BureauActions>(
    () => ({
      runAllocation,
      clearAssignments,
      assignManually,
      unassign,
      saveGhost,
      removeGhost,
      resetDemo,
      dismissNotice: () => setNotice(null),
    }),
    [runAllocation, clearAssignments, assignManually, unassign, saveGhost, removeGhost, resetDemo],
  )

  return { data, today, report, notice, actions }
}
