import {
  classifyPlacement,
  computeOccupancy,
  evaluatePlacesForGhost,
  occupancyExcludingGhost,
  type UnplacedStatus,
} from './allocation'
import { daysUntil } from './dates'
import { HARD_RULE_LABELS } from './labels'
import type { BureauData, Ghost, HardRuleCode, Place } from './types'

export interface PlaceLoad {
  place: Place
  occupied: number
  free: number
  /** Жильцов больше вместимости: возможно после принудительного размещения. */
  overloaded: boolean
  loadRatio: number
}

export interface ProblemGhost {
  ghost: Ghost
  reason: UnplacedStatus
  /** Сколько дней осталось до дедлайна; отрицательное — просрочено. */
  daysLeft: number
  /** Сколько мест прошли все жёсткие проверки. */
  eligibleCount: number
  /** Условия, которые чаще всего закрывали места для этой заявки. */
  blockingRules: Array<{ code: HardRuleCode; label: string; count: number }>
}

export interface BureauReport {
  total: number
  placed: number
  unplaced: number
  /** Размещения, принятые оператором вопреки нарушенным условиям. */
  forced: number
  /** Все заявки с истёкшим сроком, независимо от размещения. */
  overdue: number
  /** Просроченные заявки, которые до сих пор без места. */
  overdueUnplaced: number
  freeSlotsTotal: number
  placeLoads: PlaceLoad[]
  overloadedPlaces: PlaceLoad[]
  problemGhosts: ProblemGhost[]
}

function analyseUnplaced(ghost: Ghost, places: Place[], data: BureauData, today: string): ProblemGhost {
  const occupancy = occupancyExcludingGhost(data.assignments, ghost.id)
  const evaluations = evaluatePlacesForGhost(ghost, places, occupancy)
  const counts = new Map<HardRuleCode, number>()

  for (const evaluation of evaluations) {
    for (const violation of evaluation.violations) {
      counts.set(violation.code, (counts.get(violation.code) ?? 0) + 1)
    }
  }

  const blockingRules = [...counts.entries()]
    .map(([code, count]) => ({ code, label: HARD_RULE_LABELS[code], count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'ru'))

  return {
    ghost,
    reason: classifyPlacement(evaluations),
    daysLeft: daysUntil(ghost.deadline, today),
    eligibleCount: evaluations.filter((evaluation) => evaluation.eligible).length,
    blockingRules,
  }
}

/**
 * Итоговая сводка. Всё считается от текущих размещений, поэтому отчёт
 * остаётся верным и после ручных переносов, и после правки заявок.
 */
export function buildReport(data: BureauData, today: string): BureauReport {
  const occupancy = computeOccupancy(data.assignments)
  const assignedGhostIds = new Set(data.assignments.map((assignment) => assignment.ghostId))

  const placeLoads: PlaceLoad[] = data.places
    .map((place) => {
      const occupied = occupancy.get(place.id) ?? 0
      return {
        place,
        occupied,
        free: Math.max(0, place.capacity - occupied),
        overloaded: occupied > place.capacity,
        loadRatio: place.capacity === 0 ? 1 : occupied / place.capacity,
      }
    })
    .sort((a, b) => b.loadRatio - a.loadRatio || a.place.name.localeCompare(b.place.name, 'ru'))

  const unplacedGhosts = data.ghosts.filter((ghost) => !assignedGhostIds.has(ghost.id))

  const problemGhosts = unplacedGhosts
    .map((ghost) => analyseUnplaced(ghost, data.places, data, today))
    .sort(
      (a, b) =>
        a.daysLeft - b.daysLeft ||
        a.eligibleCount - b.eligibleCount ||
        b.ghost.anxiety - a.ghost.anxiety ||
        a.ghost.name.localeCompare(b.ghost.name, 'ru'),
    )

  return {
    total: data.ghosts.length,
    placed: data.assignments.length,
    unplaced: unplacedGhosts.length,
    forced: data.assignments.filter((assignment) => assignment.forced).length,
    overdue: data.ghosts.filter((ghost) => daysUntil(ghost.deadline, today) < 0).length,
    overdueUnplaced: problemGhosts.filter((problem) => problem.daysLeft < 0).length,
    freeSlotsTotal: placeLoads.reduce((sum, load) => sum + load.free, 0),
    placeLoads,
    overloadedPlaces: placeLoads.filter((load) => load.overloaded),
    problemGhosts,
  }
}
