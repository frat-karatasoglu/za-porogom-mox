/**
 * Модель данных бюро переселения привидений «За порогом».
 *
 * Главное правило модели: занятость мест нигде не хранится. Она всегда
 * вычисляется из списка `assignments`. Благодаря этому повторный автоподбор
 * не удваивает счётчики, а ручной перенос автоматически освобождает
 * прежнее место.
 */

export type PlaceType = 'tower' | 'station' | 'greenhouse' | 'house' | 'chapel'

/**
 * Рисунок в карточке заявки. Значение постоянно и хранится вместе с заявкой,
 * поэтому персонаж не «уезжает» к соседнему делу при сортировке или фильтре.
 */
export type GhostAvatar =
  | 'postman'
  | 'archivist'
  | 'ribbon'
  | 'sleeper'
  | 'draught'
  | 'moth'
  | 'shawl'
  | 'inkcloud'

/**
 * Особые условия привидения в структурированном виде: алгоритм проверяет
 * именно эти поля, а не свободный текст из `note`.
 */
export interface GhostConditions {
  /** Нужен чердак. */
  needsAttic: boolean
  /** Боится зеркал. */
  fearsMirrors: boolean
  /** Нельзя селить рядом с людьми. */
  avoidsHumans: boolean
  /** Не переносит тикающих часов. */
  noTickingClocks: boolean
  /** Не переносит колоколов. */
  noBells: boolean
  /** Нужен сквозняк. */
  needsDraught: boolean
  /** Любит сырость (предпочтение, а не жёсткое условие). */
  lovesDamp: boolean
  /** Максимально допустимая освещённость, 0–10. `null` — без ограничения. */
  maxLight: number | null
  /** Максимально допустимый шум, 0–10. `null` — без ограничения. */
  maxNoise: number | null
  /** Типы мест, в которые селить нельзя. */
  forbiddenTypes: PlaceType[]
}

/** Род имени: нужен, чтобы подписи вроде «Расселён / Расселена / Расселено» были грамотными. */
export type GhostGender = 'm' | 'f' | 'n'

export interface Ghost {
  id: string
  /** Номер дела, под которым заявка проходит по бюро. */
  caseNumber: string
  /** Имя. */
  name: string
  gender: GhostGender
  avatar: GhostAvatar
  /** Уровень тревожности, 1–10. */
  anxiety: number
  /** Любимая температура, °C. */
  preferredTemp: number
  /** Крайний срок переселения, формат YYYY-MM-DD. */
  deadline: string
  conditions: GhostConditions
  /** Справочная заметка. Алгоритм её не читает. */
  note: string
}

/** Ограничения места, которые оно накладывает на жильцов. */
export interface PlaceRestrictions {
  /** Не принимает привидений с тревожностью выше указанной. `null` — принимает любых. */
  maxAnxiety: number | null
  /** Место временно закрыто на приём. */
  closedForIntake: boolean
}

export interface Place {
  id: string
  name: string
  type: PlaceType
  /** Вместимость. */
  capacity: number
  /** Температура, °C. */
  temperature: number
  /** Освещённость, 0–10. */
  light: number
  /** Уровень шума, 0–10. */
  noise: number
  /** Влажность, 0–100 %. */
  humidity: number
  /** Наличие людей. */
  hasHumans: boolean
  /** Наличие чердака. */
  hasAttic: boolean
  /** Наличие зеркал. */
  hasMirrors: boolean
  /** В здании тикают часы. */
  hasTickingClocks: boolean
  /** В здании есть колокола. */
  hasBells: boolean
  /** В помещении гуляет сквозняк. */
  hasDraught: boolean
  restrictions: PlaceRestrictions
  /** Справочная заметка. Алгоритм её не читает. */
  note: string
}

export type AssignmentSource = 'auto' | 'manual'

export interface Assignment {
  ghostId: string
  placeId: string
  source: AssignmentSource
  /** Итоговый балл совместимости на момент размещения, 0–100. */
  score: number
  /** Размещение принято оператором вопреки нарушенным жёстким условиям. */
  forced: boolean
  assignedAt: string
}

export interface BureauData {
  version: number
  /** Дата генерации демо-данных: от неё отсчитываются дедлайны. */
  seededAt: string
  ghosts: Ghost[]
  places: Place[]
  assignments: Assignment[]
}

/** Коды жёстких проверок — по ним строятся объяснения в интерфейсе. */
export type HardRuleCode =
  | 'capacity'
  | 'closedForIntake'
  | 'attic'
  | 'mirrors'
  | 'humans'
  | 'clocks'
  | 'bells'
  | 'draught'
  | 'light'
  | 'noise'
  | 'forbiddenType'
  | 'maxAnxiety'

/** Коды мягких критериев, участвующих в подсчёте баллов. */
export type SoftRuleCode = 'temperature' | 'humidity' | 'quiet' | 'darkness'

export interface HardRuleResult {
  code: HardRuleCode
  passed: boolean
  /** Человекочитаемое объяснение, собранное из реальных значений. */
  message: string
}

export interface SoftRuleResult {
  code: SoftRuleCode
  /** Насколько место подходит по критерию, 0–1. */
  fit: number
  /** Вес критерия в итоговом балле, в сумме по всем критериям — 100. */
  weight: number
  message: string
}

/** Разбор одной пары «привидение — место». */
export interface PlaceEvaluation {
  placeId: string
  eligible: boolean
  score: number
  hardRules: HardRuleResult[]
  softRules: SoftRuleResult[]
  /** Только непройденные жёсткие проверки. */
  violations: HardRuleResult[]
  freeSlots: number
}
