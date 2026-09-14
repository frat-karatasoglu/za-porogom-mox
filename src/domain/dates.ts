/**
 * Даты хранятся строками YYYY-MM-DD и разбираются как локальные,
 * чтобы дедлайн не «съезжал» на сутки из-за часового пояса.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayIso(): string {
  return toIsoDate(new Date())
}

export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return Number.isNaN(date.getTime()) ? null : date
}

export function addDays(isoDate: string, days: number): string {
  const date = parseIsoDate(isoDate)
  if (!date) return isoDate
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}

/** Сколько дней осталось до `deadline` относительно `today`. Отрицательное — просрочено. */
export function daysUntil(deadline: string, today: string): number {
  const end = parseIsoDate(deadline)
  const start = parseIsoDate(today)
  if (!end || !start) return 0
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY)
}

export function isOverdue(deadline: string, today: string): boolean {
  return daysUntil(deadline, today) < 0
}

/** «3 дня», «1 день», «5 дней» — для подписей в интерфейсе. */
export function formatDays(count: number): string {
  const abs = Math.abs(count)
  const lastTwo = abs % 100
  const last = abs % 10
  if (lastTwo >= 11 && lastTwo <= 14) return `${abs} дней`
  if (last === 1) return `${abs} день`
  if (last >= 2 && last <= 4) return `${abs} дня`
  return `${abs} дней`
}

/**
 * Короткая дата для тесных мест интерфейса: год показывается только тогда,
 * когда он отличается от текущего, иначе подпись зря переносится на две строки.
 */
export function formatDateShort(isoDate: string, today: string): string {
  const date = parseIsoDate(isoDate)
  const now = parseIsoDate(today)
  if (!date) return isoDate
  if (now && date.getFullYear() !== now.getFullYear()) return formatDate(isoDate)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

/** Полная дата в компактной записи: «19 сент. 2026» — помещается в одну строку. */
export function formatDateFull(isoDate: string): string {
  const date = parseIsoDate(isoDate)
  if (!date) return isoDate
  const short = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  return `${short} ${date.getFullYear()}`
}

export function formatDate(isoDate: string): string {
  const date = parseIsoDate(isoDate)
  if (!date) return isoDate
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
