import type { Ghost, HardRuleCode, PlaceType, SoftRuleCode } from './types'

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  tower: 'Башня',
  station: 'Вокзал',
  greenhouse: 'Оранжерея',
  house: 'Дом',
  chapel: 'Часовня',
}

export const PLACE_TYPES = Object.keys(PLACE_TYPE_LABELS) as PlaceType[]

/** Короткие названия жёстких правил для интерфейса. */
export const HARD_RULE_LABELS: Record<HardRuleCode, string> = {
  capacity: 'Свободные места',
  closedForIntake: 'Приём заявок',
  attic: 'Чердак',
  mirrors: 'Зеркала',
  humans: 'Соседство с людьми',
  clocks: 'Тикающие часы',
  bells: 'Колокола',
  draught: 'Сквозняк',
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

export interface ConditionLabel {
  /** Короткая подпись для тесной карточки списка. */
  short: string
  /** Полная подпись для карточки заявки. */
  full: string
  /** Имя значка рядом с подписью. */
  icon: ConditionIcon
}

export type ConditionIcon =
  | 'clock'
  | 'bell'
  | 'wind'
  | 'people'
  | 'mirror'
  | 'attic'
  | 'drop'
  | 'moon'
  | 'sound'
  | 'ban'

/**
 * Особые условия заявки в виде читаемых подписей. Список строится ровно
 * из тех полей, которые проверяет алгоритм, — придумать подпись «из головы»
 * здесь нельзя.
 */
export function conditionLabels(ghost: Ghost): ConditionLabel[] {
  const { conditions } = ghost
  const labels: ConditionLabel[] = []

  if (conditions.noTickingClocks) {
    labels.push({ short: 'Без часов', full: 'Без тикающих часов', icon: 'clock' })
  }
  if (conditions.noBells) {
    labels.push({ short: 'Без колоколов', full: 'Без колоколов', icon: 'bell' })
  }
  if (conditions.needsDraught) {
    labels.push({ short: 'Сквозняк', full: 'Нужен сквозняк', icon: 'wind' })
  }
  if (conditions.avoidsHumans) {
    labels.push({ short: 'Без людей', full: 'Без людей рядом', icon: 'people' })
  }
  if (conditions.needsAttic) {
    labels.push({ short: 'Чердак', full: 'Нужен чердак', icon: 'attic' })
  }
  if (conditions.fearsMirrors) {
    labels.push({ short: 'Без зеркал', full: 'Боится зеркал', icon: 'mirror' })
  }
  if (conditions.maxLight !== null) {
    const short = conditions.maxLight <= 3 ? 'Полумрак' : `Свет ≤ ${conditions.maxLight}`
    labels.push({
      short,
      full: `Освещённость не выше ${conditions.maxLight} из 10`,
      icon: 'moon',
    })
  }
  if (conditions.maxNoise !== null) {
    labels.push({
      short: conditions.maxNoise <= 2 ? 'Тишина' : `Шум ≤ ${conditions.maxNoise}`,
      full: `Уровень шума не выше ${conditions.maxNoise} из 10`,
      icon: 'sound',
    })
  }
  if (conditions.lovesDamp) {
    labels.push({ short: 'Сырость', full: 'Любит сырость (предпочтение)', icon: 'drop' })
  }
  for (const type of conditions.forbiddenTypes) {
    labels.push({
      short: `Не ${PLACE_TYPE_LABELS[type].toLowerCase()}`,
      full: `Не селить: ${PLACE_TYPE_LABELS[type].toLowerCase()}`,
      icon: 'ban',
    })
  }

  return labels
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
