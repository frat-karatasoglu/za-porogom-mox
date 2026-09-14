import type { HardRuleCode, PlaceType, SoftRuleCode } from './types'

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  castle: 'Замок',
  lighthouse: 'Маяк',
  library: 'Библиотека',
  theatre: 'Театр',
  basement: 'Подвал',
  crypt: 'Крипта',
}

export const PLACE_TYPE_ICONS: Record<PlaceType, string> = {
  castle: '🏰',
  lighthouse: '🗼',
  library: '📚',
  theatre: '🎭',
  basement: '🕯️',
  crypt: '⚰️',
}

export const PLACE_TYPES = Object.keys(PLACE_TYPE_LABELS) as PlaceType[]

/** Короткие названия жёстких правил для интерфейса. */
export const HARD_RULE_LABELS: Record<HardRuleCode, string> = {
  capacity: 'Свободные места',
  closedForIntake: 'Приём заявок',
  attic: 'Чердак',
  mirrors: 'Зеркала',
  humans: 'Соседство с людьми',
  light: 'Освещённость',
  noise: 'Уровень шума',
  forbiddenType: 'Тип места',
  maxAnxiety: 'Предел тревожности места',
}

export const SOFT_RULE_LABELS: Record<SoftRuleCode, string> = {
  temperature: 'Температура',
  humidity: 'Влажность',
  quiet: 'Тишина',
  darkness: 'Темнота',
}

/** Шкала 0–10 в словах: используется в карточках мест. */
export function describeLevel(value: number): string {
  if (value <= 1) return 'почти нет'
  if (value <= 3) return 'низкий'
  if (value <= 6) return 'средний'
  if (value <= 8) return 'высокий'
  return 'очень высокий'
}

export function describeHumidity(value: number): string {
  if (value < 30) return 'сухо'
  if (value < 55) return 'умеренно'
  if (value < 75) return 'сыро'
  return 'очень сыро'
}

export function describeAnxiety(value: number): string {
  if (value <= 3) return 'спокойное'
  if (value <= 6) return 'настороженное'
  if (value <= 8) return 'тревожное'
  return 'крайне тревожное'
}
