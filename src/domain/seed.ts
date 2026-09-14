import { addDays, todayIso } from './dates'
import type { BureauData, Ghost, GhostConditions, Place } from './types'

export const DATA_VERSION = 2

const NO_CONDITIONS: GhostConditions = {
  needsAttic: false,
  fearsMirrors: false,
  avoidsHumans: false,
  noTickingClocks: false,
  noBells: false,
  needsDraught: false,
  lovesDamp: false,
  maxLight: null,
  maxNoise: null,
  forbiddenTypes: [],
}

/**
 * Демо-данные подобраны так, чтобы все обязательные состояния встречались
 * сразу после первого автоподбора:
 *  - «Пыльный Архивариус» просрочен и при этом не проходит ни в одно место;
 *  - «Шорох Почтовый» подходит только в башню, а её к его очереди уже заняли;
 *  - «Шёпот в Ленте» не проходит нигде из-за колоколов и требования тишины;
 *  - «Часовня у брода» закрыта на приём, хотя условия там подходящие.
 */

function buildPlaces(): Place[] {
  return [
    {
      id: 'place-tower',
      name: 'Башня без стрелок',
      type: 'tower',
      capacity: 1,
      temperature: 7,
      light: 2,
      noise: 2,
      humidity: 55,
      hasHumans: false,
      hasAttic: true,
      hasMirrors: false,
      hasTickingClocks: false,
      hasBells: true,
      hasDraught: true,
      restrictions: { maxAnxiety: null, closedForIntake: false },
      note: 'Стрелки сняли сто лет назад, поэтому часы молчат. Колокол наверху остался.',
    },
    {
      id: 'place-station',
      name: 'Пустой вокзал',
      type: 'station',
      capacity: 2,
      temperature: 9,
      light: 4,
      noise: 5,
      humidity: 45,
      hasHumans: false,
      hasAttic: false,
      hasMirrors: true,
      hasTickingClocks: true,
      hasBells: false,
      hasDraught: true,
      restrictions: { maxAnxiety: null, closedForIntake: false },
      note: 'Поезда не ходят, но вокзальные часы исправно тикают над перроном.',
    },
    {
      id: 'place-greenhouse',
      name: 'Лунная оранжерея',
      type: 'greenhouse',
      capacity: 2,
      temperature: 13,
      light: 7,
      noise: 2,
      humidity: 80,
      hasHumans: false,
      hasAttic: false,
      hasMirrors: true,
      hasTickingClocks: false,
      hasBells: false,
      hasDraught: false,
      restrictions: { maxAnxiety: 6, closedForIntake: false },
      note: 'Тепло и сыро, но стеклянная крыша светится всю ночь — беспокойных сюда не селят.',
    },
    {
      id: 'place-toyhouse',
      name: 'Дом забытых игрушек',
      type: 'house',
      capacity: 2,
      temperature: 17,
      light: 5,
      noise: 4,
      humidity: 40,
      hasHumans: false,
      hasAttic: true,
      hasMirrors: false,
      hasTickingClocks: true,
      hasBells: false,
      hasDraught: false,
      restrictions: { maxAnxiety: null, closedForIntake: false },
      note: 'Просторный чердак, но в гостиной до сих пор идут напольные часы.',
    },
    {
      id: 'place-chapel',
      name: 'Часовня у брода',
      type: 'chapel',
      capacity: 2,
      temperature: 4,
      light: 1,
      noise: 0,
      humidity: 70,
      hasHumans: false,
      hasAttic: false,
      hasMirrors: false,
      hasTickingClocks: false,
      hasBells: true,
      hasDraught: false,
      restrictions: { maxAnxiety: null, closedForIntake: true },
      note: 'Тихо и темно, но своды укрепляют до конца сезона: приём закрыт.',
    },
  ]
}

function buildGhosts(today: string): Ghost[] {
  return [
    {
      id: 'ghost-archivist',
      caseNumber: 'П-042',
      name: 'Пыльный Архивариус',
      gender: 'm',
      avatar: 'archivist',
      anxiety: 4,
      preferredTemp: 16,
      deadline: addDays(today, -3),
      conditions: { ...NO_CONDITIONS, noTickingClocks: true, noBells: true, maxLight: 3 },
      note: 'Срок вышел ещё на прошлой неделе: читальный зал разобрали раньше плана.',
    },
    {
      id: 'ghost-inkcloud',
      caseNumber: 'П-048',
      name: 'Облачко Чернил',
      gender: 'n',
      avatar: 'inkcloud',
      anxiety: 1,
      preferredTemp: 15,
      deadline: addDays(today, 2),
      conditions: { ...NO_CONDITIONS, needsDraught: true },
      note: 'Без движения воздуха оседает на пол и теряет форму.',
    },
    {
      id: 'ghost-postman',
      caseNumber: 'П-041',
      name: 'Шорох Почтовый',
      gender: 'm',
      avatar: 'postman',
      anxiety: 7,
      preferredTemp: 7,
      deadline: addDays(today, 5),
      conditions: {
        ...NO_CONDITIONS,
        noTickingClocks: true,
        needsDraught: true,
        avoidsHumans: true,
      },
      note: 'Разносит письма, которые некому получить. От тиканья сбивается с маршрута.',
    },
    {
      id: 'ghost-ribbon',
      caseNumber: 'П-043',
      name: 'Шёпот в Ленте',
      gender: 'm',
      avatar: 'ribbon',
      anxiety: 8,
      preferredTemp: 5,
      deadline: addDays(today, 6),
      conditions: { ...NO_CONDITIONS, noBells: true, maxNoise: 1 },
      note: 'Говорит тише всех в бюро и от любого звона рассыпается на нити.',
    },
    {
      id: 'ghost-creak',
      caseNumber: 'П-044',
      name: 'Сонный Скрип',
      gender: 'm',
      avatar: 'sleeper',
      anxiety: 2,
      preferredTemp: 11,
      deadline: addDays(today, 8),
      conditions: { ...NO_CONDITIONS, lovesDamp: true },
      note: 'Просыпается раз в сутки, чтобы скрипнуть половицей, и засыпает обратно.',
    },
    {
      id: 'ghost-draught',
      caseNumber: 'П-045',
      name: 'Господин Сквозняк',
      gender: 'm',
      avatar: 'draught',
      anxiety: 3,
      preferredTemp: 9,
      deadline: addDays(today, 10),
      conditions: { ...NO_CONDITIONS, needsDraught: true },
      note: 'Живёт только там, где есть чему дуть.',
    },
    {
      id: 'ghost-moth',
      caseNumber: 'П-046',
      name: 'Ночная Моль',
      gender: 'f',
      avatar: 'moth',
      anxiety: 5,
      preferredTemp: 19,
      deadline: addDays(today, 12),
      conditions: { ...NO_CONDITIONS, needsAttic: true },
      note: 'Селится только под крышей, среди старых сундуков.',
    },
    {
      id: 'ghost-shawl',
      caseNumber: 'П-047',
      name: 'Туманная Шаль',
      gender: 'f',
      avatar: 'shawl',
      anxiety: 2,
      preferredTemp: 13,
      deadline: addDays(today, 14),
      conditions: { ...NO_CONDITIONS, lovesDamp: true },
      note: 'В сухом воздухе сворачивается и перестаёт выходить к людям.',
    },
  ]
}

/**
 * Демо-данные генерируются относительно переданной даты, поэтому дедлайны
 * остаются осмысленными и через неделю после первого открытия.
 */
export function createSeedData(today: string = todayIso()): BureauData {
  return {
    version: DATA_VERSION,
    seededAt: today,
    ghosts: buildGhosts(today),
    places: buildPlaces(),
    assignments: [],
  }
}

/** Следующий свободный номер дела для новой заявки. */
export function nextCaseNumber(ghosts: Ghost[]): string {
  const numbers = ghosts
    .map((ghost) => Number(/^П-(\d+)$/.exec(ghost.caseNumber)?.[1] ?? Number.NaN))
    .filter((value) => Number.isFinite(value))
  const max = numbers.length > 0 ? Math.max(...numbers) : 40
  return `П-${String(max + 1).padStart(3, '0')}`
}
