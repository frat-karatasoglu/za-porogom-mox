import { createSeedData, DATA_VERSION } from '../domain/seed'
import { todayIso } from '../domain/dates'
import type { Assignment, BureauData, Ghost, Place } from '../domain/types'

export const STORAGE_KEY = 'mox-ghost-bureau/v2'

/**
 * Хранилище вынесено за интерфейс, чтобы логику загрузки можно было
 * проверять тестами без браузера.
 */
export interface StorageAdapter {
  read(): string | null
  write(value: string): void
  clear(): void
}

export function createMemoryAdapter(initial: string | null = null): StorageAdapter {
  let value = initial
  return {
    read: () => value,
    write: (next) => {
      value = next
    },
    clear: () => {
      value = null
    },
  }
}

/**
 * localStorage может быть недоступен (приватный режим, отключённые куки),
 * поэтому каждое обращение защищено.
 */
export function createLocalStorageAdapter(key: string = STORAGE_KEY): StorageAdapter {
  return {
    read: () => {
      try {
        return window.localStorage.getItem(key)
      } catch {
        return null
      }
    },
    write: (value) => {
      window.localStorage.setItem(key, value)
    },
    clear: () => {
      try {
        window.localStorage.removeItem(key)
      } catch {
        /* нечего восстанавливать */
      }
    },
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isGhost(value: unknown): value is Ghost {
  if (!isObject(value)) return false
  const conditions = value.conditions
  return (
    typeof value.id === 'string' &&
    typeof value.caseNumber === 'string' &&
    typeof value.name === 'string' &&
    (value.gender === 'm' || value.gender === 'f' || value.gender === 'n') &&
    typeof value.avatar === 'string' &&
    typeof value.anxiety === 'number' &&
    typeof value.preferredTemp === 'number' &&
    typeof value.deadline === 'string' &&
    isObject(conditions) &&
    typeof conditions.needsAttic === 'boolean' &&
    typeof conditions.fearsMirrors === 'boolean' &&
    typeof conditions.avoidsHumans === 'boolean' &&
    typeof conditions.noTickingClocks === 'boolean' &&
    typeof conditions.noBells === 'boolean' &&
    typeof conditions.needsDraught === 'boolean' &&
    typeof conditions.lovesDamp === 'boolean' &&
    Array.isArray(conditions.forbiddenTypes)
  )
}

function isPlace(value: unknown): value is Place {
  if (!isObject(value)) return false
  const restrictions = value.restrictions
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.type === 'string' &&
    typeof value.capacity === 'number' &&
    typeof value.temperature === 'number' &&
    typeof value.light === 'number' &&
    typeof value.noise === 'number' &&
    typeof value.humidity === 'number' &&
    typeof value.hasHumans === 'boolean' &&
    typeof value.hasAttic === 'boolean' &&
    typeof value.hasMirrors === 'boolean' &&
    typeof value.hasTickingClocks === 'boolean' &&
    typeof value.hasBells === 'boolean' &&
    typeof value.hasDraught === 'boolean' &&
    isObject(restrictions) &&
    typeof restrictions.closedForIntake === 'boolean'
  )
}

function isAssignment(value: unknown): value is Assignment {
  return (
    isObject(value) &&
    typeof value.ghostId === 'string' &&
    typeof value.placeId === 'string' &&
    (value.source === 'auto' || value.source === 'manual')
  )
}

export function parseBureauData(raw: string): BureauData {
  const parsed: unknown = JSON.parse(raw)
  if (!isObject(parsed)) throw new Error('Сохранённые данные повреждены: ожидался объект.')
  if (parsed.version !== DATA_VERSION) {
    throw new Error(
      `Версия сохранённых данных (${String(parsed.version)}) не совпадает с текущей (${DATA_VERSION}).`,
    )
  }
  if (!Array.isArray(parsed.ghosts) || !parsed.ghosts.every(isGhost)) {
    throw new Error('Сохранённые данные повреждены: некорректный список заявок.')
  }
  if (!Array.isArray(parsed.places) || !parsed.places.every(isPlace)) {
    throw new Error('Сохранённые данные повреждены: некорректный список мест.')
  }
  if (!Array.isArray(parsed.assignments) || !parsed.assignments.every(isAssignment)) {
    throw new Error('Сохранённые данные повреждены: некорректный список размещений.')
  }

  const ghosts = parsed.ghosts
  const places = parsed.places
  const knownGhosts = new Set(ghosts.map((ghost) => ghost.id))
  const knownPlaces = new Set(places.map((place) => place.id))

  return {
    version: DATA_VERSION,
    seededAt: typeof parsed.seededAt === 'string' ? parsed.seededAt : todayIso(),
    ghosts,
    places,
    // Размещения, ссылающиеся на удалённые сущности, отбрасываем молча:
    // это не повреждение данных, а нормальное следствие удаления заявки.
    assignments: parsed.assignments.filter(
      (assignment) =>
        knownGhosts.has(assignment.ghostId) && knownPlaces.has(assignment.placeId),
    ),
  }
}

export interface LoadResult {
  data: BureauData
  /** Заполняется, если данные пришлось восстановить: показывается оператору. */
  recoveryNotice: string | null
}

export function loadBureauData(
  adapter: StorageAdapter,
  today: string = todayIso(),
): LoadResult {
  const raw = adapter.read()
  if (raw === null) {
    return { data: createSeedData(today), recoveryNotice: null }
  }
  try {
    return { data: parseBureauData(raw), recoveryNotice: null }
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Неизвестная ошибка чтения.'
    return {
      data: createSeedData(today),
      recoveryNotice: `${reason} Загружены демо-данные, прежнее состояние восстановить не удалось.`,
    }
  }
}

export function saveBureauData(adapter: StorageAdapter, data: BureauData): string | null {
  try {
    adapter.write(JSON.stringify(data))
    return null
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'неизвестная ошибка'
    return `Не удалось сохранить изменения в localStorage (${reason}). Данные живут только до перезагрузки страницы.`
  }
}
