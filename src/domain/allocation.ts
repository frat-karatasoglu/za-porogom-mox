import { daysUntil } from './dates'
import { PLACE_TYPE_LABELS } from './labels'
import type {
  Assignment,
  Ghost,
  HardRuleResult,
  Place,
  PlaceEvaluation,
  SoftRuleResult,
} from './types'

/**
 * Разница температур, при которой соответствие по температуре считается
 * нулевым. 15 °C — вся осмысленная шкала бюро от крипты (2 °C) до
 * библиотеки (12 °C) с запасом.
 */
const TEMPERATURE_TOLERANCE = 15

/** Занятость всегда вычисляется, а не хранится. */
export function computeOccupancy(assignments: Assignment[]): Map<string, number> {
  const occupancy = new Map<string, number>()
  for (const assignment of assignments) {
    occupancy.set(assignment.placeId, (occupancy.get(assignment.placeId) ?? 0) + 1)
  }
  return occupancy
}

export function occupantsOf(placeId: string, assignments: Assignment[]): Assignment[] {
  return assignments.filter((assignment) => assignment.placeId === placeId)
}

/**
 * Веса мягких критериев. Чем тревожнее привидение, тем важнее для него
 * тишина и темнота; температура и влажность остаются базовыми критериями.
 * Веса нормируются так, чтобы в сумме давать 100 баллов.
 */
export function softWeights(anxiety: number): Record<SoftRuleResult['code'], number> {
  const a = clamp(anxiety, 1, 10) / 10
  const raw = {
    temperature: 35,
    humidity: 20,
    quiet: 15 + 20 * a,
    darkness: 10 + 15 * a,
  }
  const total = raw.temperature + raw.humidity + raw.quiet + raw.darkness
  return {
    temperature: (raw.temperature / total) * 100,
    humidity: (raw.humidity / total) * 100,
    quiet: (raw.quiet / total) * 100,
    darkness: (raw.darkness / total) * 100,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Жёсткие проверки. В список попадают только применимые правила: если
 * привидение не боится зеркал, строка про зеркала оператору не нужна.
 */
export function checkHardRules(
  ghost: Ghost,
  place: Place,
  freeSlots: number,
): HardRuleResult[] {
  const rules: HardRuleResult[] = []
  const occupied = place.capacity - freeSlots

  rules.push({
    code: 'capacity',
    passed: freeSlots > 0,
    message:
      freeSlots > 0
        ? `Свободно ${freeSlots} из ${place.capacity} мест.`
        : `Мест нет: занято ${occupied} из ${place.capacity}.`,
  })

  if (place.restrictions.closedForIntake) {
    rules.push({
      code: 'closedForIntake',
      passed: false,
      message: 'Место закрыто на приём новых жильцов.',
    })
  }

  if (ghost.conditions.needsAttic) {
    rules.push({
      code: 'attic',
      passed: place.hasAttic,
      message: place.hasAttic
        ? 'Чердак есть, как и требуется.'
        : 'Чердака нет, а он обязателен.',
    })
  }

  if (ghost.conditions.fearsMirrors) {
    rules.push({
      code: 'mirrors',
      passed: !place.hasMirrors,
      message: place.hasMirrors
        ? 'В помещении сохранились зеркала, а привидение их боится.'
        : 'Зеркал нет.',
    })
  }

  if (ghost.conditions.avoidsHumans) {
    rules.push({
      code: 'humans',
      passed: !place.hasHumans,
      message: place.hasHumans
        ? 'В здании есть люди, а селить рядом с ними нельзя.'
        : 'Людей нет.',
    })
  }

  const { maxLight, maxNoise } = ghost.conditions
  if (maxLight !== null) {
    rules.push({
      code: 'light',
      passed: place.light <= maxLight,
      message:
        place.light <= maxLight
          ? `Освещённость ${place.light} из 10 — в пределах допустимых ${maxLight}.`
          : `Слишком светло: ${place.light} из 10 при допустимых ${maxLight}.`,
    })
  }

  if (maxNoise !== null) {
    rules.push({
      code: 'noise',
      passed: place.noise <= maxNoise,
      message:
        place.noise <= maxNoise
          ? `Шум ${place.noise} из 10 — в пределах допустимых ${maxNoise}.`
          : `Слишком шумно: ${place.noise} из 10 при допустимых ${maxNoise}.`,
    })
  }

  if (ghost.conditions.forbiddenTypes.includes(place.type)) {
    rules.push({
      code: 'forbiddenType',
      passed: false,
      message: `Тип «${PLACE_TYPE_LABELS[place.type]}» указан в заявке как неприемлемый.`,
    })
  }

  const { maxAnxiety } = place.restrictions
  if (maxAnxiety !== null) {
    rules.push({
      code: 'maxAnxiety',
      passed: ghost.anxiety <= maxAnxiety,
      message:
        ghost.anxiety <= maxAnxiety
          ? `Тревожность ${ghost.anxiety} укладывается в предел места (${maxAnxiety}).`
          : `Место не принимает тревожность выше ${maxAnxiety}, у заявки ${ghost.anxiety}.`,
    })
  }

  return rules
}

/** Мягкие критерии: считают, насколько место комфортно, но не запрещают его. */
export function scoreSoftRules(ghost: Ghost, place: Place): SoftRuleResult[] {
  const weights = softWeights(ghost.anxiety)

  const tempDelta = Math.abs(ghost.preferredTemp - place.temperature)
  const temperatureFit = 1 - Math.min(1, tempDelta / TEMPERATURE_TOLERANCE)

  const humidityFit = ghost.conditions.lovesDamp
    ? place.humidity / 100
    : 1 - Math.abs(place.humidity - 50) / 50

  const quietFit = 1 - place.noise / 10
  const darknessFit = 1 - place.light / 10

  return [
    {
      code: 'temperature',
      fit: temperatureFit,
      weight: weights.temperature,
      message:
        tempDelta === 0
          ? `Температура ровно та, что нужна (${place.temperature} °C).`
          : `Температура ${place.temperature} °C против желаемых ${ghost.preferredTemp} °C — разница ${tempDelta} °C.`,
    },
    {
      code: 'humidity',
      fit: clamp(humidityFit, 0, 1),
      weight: weights.humidity,
      message: ghost.conditions.lovesDamp
        ? `Влажность ${place.humidity} %, а привидение любит сырость.`
        : `Влажность ${place.humidity} % при комфортных 50 %.`,
    },
    {
      code: 'quiet',
      fit: quietFit,
      weight: weights.quiet,
      message: `Шум ${place.noise} из 10 (вес критерия растёт с тревожностью ${ghost.anxiety}).`,
    },
    {
      code: 'darkness',
      fit: darknessFit,
      weight: weights.darkness,
      message: `Освещённость ${place.light} из 10 (вес критерия растёт с тревожностью ${ghost.anxiety}).`,
    },
  ]
}

export function evaluatePlace(
  ghost: Ghost,
  place: Place,
  occupancy: Map<string, number>,
): PlaceEvaluation {
  const occupied = occupancy.get(place.id) ?? 0
  const freeSlots = place.capacity - occupied
  const hardRules = checkHardRules(ghost, place, freeSlots)
  const violations = hardRules.filter((rule) => !rule.passed)
  const softRules = scoreSoftRules(ghost, place)
  const score = Math.round(
    softRules.reduce((sum, rule) => sum + rule.fit * rule.weight, 0),
  )

  return {
    placeId: place.id,
    eligible: violations.length === 0,
    score,
    hardRules,
    softRules,
    violations,
    freeSlots,
  }
}

/**
 * Занятость для конкретной заявки считается без её собственного размещения:
 * иначе её текущее место выглядело бы переполненным при выборе альтернатив.
 */
export function occupancyExcludingGhost(
  assignments: Assignment[],
  ghostId: string,
): Map<string, number> {
  return computeOccupancy(assignments.filter((item) => item.ghostId !== ghostId))
}

/**
 * Порядок перебора мест при равном балле детерминирован: сначала больше
 * свободных мест (равномернее расселение), затем алфавит.
 */
function compareEvaluations(
  a: PlaceEvaluation,
  b: PlaceEvaluation,
  placesById: Map<string, Place>,
): number {
  if (b.score !== a.score) return b.score - a.score
  if (b.freeSlots !== a.freeSlots) return b.freeSlots - a.freeSlots
  const nameA = placesById.get(a.placeId)?.name ?? a.placeId
  const nameB = placesById.get(b.placeId)?.name ?? b.placeId
  return nameA.localeCompare(nameB, 'ru')
}

export function evaluatePlacesForGhost(
  ghost: Ghost,
  places: Place[],
  occupancy: Map<string, number>,
): PlaceEvaluation[] {
  const placesById = new Map(places.map((place) => [place.id, place]))
  return places
    .map((place) => evaluatePlace(ghost, place, occupancy))
    .sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1
      return compareEvaluations(a, b, placesById)
    })
}

/**
 * Очерёдность заявок: сначала самые срочные по дедлайну (просроченные имеют
 * отрицательный остаток и потому идут первыми), при равенстве — самые
 * тревожные, затем по алфавиту ради воспроизводимости.
 */
export function prioritizeGhosts(ghosts: Ghost[], today: string): Ghost[] {
  return [...ghosts].sort((a, b) => {
    const left = daysUntil(a.deadline, today)
    const right = daysUntil(b.deadline, today)
    if (left !== right) return left - right
    if (b.anxiety !== a.anxiety) return b.anxiety - a.anxiety
    return a.name.localeCompare(b.name, 'ru')
  })
}

export type UnplacedReason = 'no-eligible-place' | 'all-eligible-full'

export interface AllocationOutcome {
  ghostId: string
  placeId: string | null
  score: number
  reason: UnplacedReason | 'placed'
  /** Разбор по всем местам — на нём строится объяснение в карточке заявки. */
  evaluations: PlaceEvaluation[]
}

export interface AllocationResult {
  assignments: Assignment[]
  outcomes: AllocationOutcome[]
}

/**
 * Если место не подошло только из-за занятости, значит по условиям оно
 * годится — причина отказа именно в нехватке мест, а не в конфликте условий.
 */
export function classifyUnplaced(evaluations: PlaceEvaluation[]): UnplacedReason {
  const blockedOnlyByCapacity = evaluations.some(
    (evaluation) =>
      evaluation.violations.length === 1 && evaluation.violations[0]?.code === 'capacity',
  )
  return blockedOnlyByCapacity ? 'all-eligible-full' : 'no-eligible-place'
}

/**
 * Жадный последовательный подбор: заявки обрабатываются по приоритету, каждая
 * получает лучшее доступное место на своём шаге.
 *
 * Алгоритм НЕ гарантирует оптимального суммарного результата — заявка с
 * высоким приоритетом может занять место, которое сильнее подошло бы
 * следующей. Это осознанный размен: решение остаётся объяснимым оператору.
 *
 * Ручные размещения сохраняются и учитываются как занятость; пересчитываются
 * только автоматические.
 */
export function allocate(
  ghosts: Ghost[],
  places: Place[],
  existingAssignments: Assignment[],
  today: string,
  now: string = new Date().toISOString(),
): AllocationResult {
  const manual = existingAssignments.filter((assignment) => assignment.source === 'manual')
  const manualGhostIds = new Set(manual.map((assignment) => assignment.ghostId))
  const occupancy = computeOccupancy(manual)

  const assignments: Assignment[] = [...manual]
  const outcomes: AllocationOutcome[] = []

  for (const ghost of prioritizeGhosts(ghosts, today)) {
    if (manualGhostIds.has(ghost.id)) continue

    const evaluations = evaluatePlacesForGhost(ghost, places, occupancy)
    const best = evaluations.find((evaluation) => evaluation.eligible)

    if (!best) {
      outcomes.push({
        ghostId: ghost.id,
        placeId: null,
        score: 0,
        reason: classifyUnplaced(evaluations),
        evaluations,
      })
      continue
    }

    occupancy.set(best.placeId, (occupancy.get(best.placeId) ?? 0) + 1)
    assignments.push({
      ghostId: ghost.id,
      placeId: best.placeId,
      source: 'auto',
      score: best.score,
      forced: false,
      assignedAt: now,
    })
    outcomes.push({
      ghostId: ghost.id,
      placeId: best.placeId,
      score: best.score,
      reason: 'placed',
      evaluations,
    })
  }

  return { assignments, outcomes }
}

/** Короткое объяснение выбора из реальных значений: две сильнейшие стороны места. */
export function explainMatch(evaluation: PlaceEvaluation): string {
  const strengths = [...evaluation.softRules]
    .sort((a, b) => b.fit * b.weight - a.fit * a.weight)
    .slice(0, 2)
    .map((rule) => rule.message)
  const passedConditions = evaluation.hardRules
    .filter((rule) => rule.passed && rule.code !== 'capacity')
    .map((rule) => rule.message)

  return [...passedConditions.slice(0, 2), ...strengths].join(' ')
}
