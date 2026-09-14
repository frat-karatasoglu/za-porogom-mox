import { describe, expect, it } from 'vitest'
import {
  allocate,
  computeOccupancy,
  evaluatePlace,
  evaluatePlacesForGhost,
  occupancyExcludingGhost,
  prioritizeGhosts,
  softWeights,
} from './allocation'
import { createSeedData } from './seed'
import type { Assignment, Ghost, Place } from './types'

const TODAY = '2026-09-14'

function makeGhost(overrides: Partial<Ghost> & { id: string }): Ghost {
  return {
    name: overrides.id,
    anxiety: 5,
    preferredTemp: 5,
    deadline: '2026-09-30',
    note: '',
    ...overrides,
    conditions: {
      needsAttic: false,
      fearsMirrors: false,
      avoidsHumans: false,
      lovesDamp: false,
      maxLight: null,
      maxNoise: null,
      forbiddenTypes: [],
      ...overrides.conditions,
    },
  }
}

function makePlace(overrides: Partial<Place> & { id: string }): Place {
  return {
    name: overrides.id,
    type: 'castle',
    capacity: 2,
    temperature: 5,
    light: 3,
    noise: 3,
    humidity: 50,
    hasHumans: false,
    hasAttic: false,
    hasMirrors: false,
    note: '',
    ...overrides,
    restrictions: {
      maxAnxiety: null,
      closedForIntake: false,
      ...overrides.restrictions,
    },
  }
}

function assignmentOf(result: { assignments: Assignment[] }, ghostId: string) {
  return result.assignments.find((assignment) => assignment.ghostId === ghostId)
}

describe('жёсткие условия', () => {
  it('отсеивают место по каждому виду ограничения', () => {
    const cases: Array<{ ghost: Ghost; place: Place; code: string }> = [
      {
        ghost: makeGhost({ id: 'g', conditions: { needsAttic: true } as Ghost['conditions'] }),
        place: makePlace({ id: 'p', hasAttic: false }),
        code: 'attic',
      },
      {
        ghost: makeGhost({ id: 'g', conditions: { fearsMirrors: true } as Ghost['conditions'] }),
        place: makePlace({ id: 'p', hasMirrors: true }),
        code: 'mirrors',
      },
      {
        ghost: makeGhost({ id: 'g', conditions: { avoidsHumans: true } as Ghost['conditions'] }),
        place: makePlace({ id: 'p', hasHumans: true }),
        code: 'humans',
      },
      {
        ghost: makeGhost({ id: 'g', conditions: { maxLight: 2 } as Ghost['conditions'] }),
        place: makePlace({ id: 'p', light: 9 }),
        code: 'light',
      },
      {
        ghost: makeGhost({ id: 'g', conditions: { maxNoise: 2 } as Ghost['conditions'] }),
        place: makePlace({ id: 'p', noise: 8 }),
        code: 'noise',
      },
      {
        ghost: makeGhost({
          id: 'g',
          conditions: { forbiddenTypes: ['library'] } as Ghost['conditions'],
        }),
        place: makePlace({ id: 'p', type: 'library' }),
        code: 'forbiddenType',
      },
      {
        ghost: makeGhost({ id: 'g', anxiety: 9 }),
        place: makePlace({ id: 'p', restrictions: { maxAnxiety: 6, closedForIntake: false } }),
        code: 'maxAnxiety',
      },
      {
        ghost: makeGhost({ id: 'g' }),
        place: makePlace({ id: 'p', restrictions: { maxAnxiety: null, closedForIntake: true } }),
        code: 'closedForIntake',
      },
    ]

    for (const { ghost, place, code } of cases) {
      const evaluation = evaluatePlace(ghost, place, new Map())
      expect(evaluation.eligible, `правило ${code} должно блокировать место`).toBe(false)
      expect(evaluation.violations.map((rule) => rule.code)).toContain(code)
    }
  })

  it('не показывает оператору правила, которые к заявке не относятся', () => {
    const ghost = makeGhost({ id: 'g' })
    const place = makePlace({ id: 'p', hasMirrors: true, hasHumans: true })

    const codes = evaluatePlace(ghost, place, new Map()).hardRules.map((rule) => rule.code)

    expect(codes).toEqual(['capacity'])
  })
})

describe('баллы совместимости', () => {
  it('повышают вес тишины и темноты для тревожных привидений', () => {
    const calm = softWeights(1)
    const anxious = softWeights(10)

    expect(anxious.quiet).toBeGreaterThan(calm.quiet)
    expect(anxious.darkness).toBeGreaterThan(calm.darkness)
    expect(anxious.temperature).toBeLessThan(calm.temperature)
    expect(Math.round(calm.quiet + calm.temperature + calm.humidity + calm.darkness)).toBe(100)
  })

  it('ставят выше место с более близкой температурой', () => {
    const ghost = makeGhost({ id: 'g', preferredTemp: 10 })
    const near = makePlace({ id: 'near', temperature: 10 })
    const far = makePlace({ id: 'far', temperature: -5 })

    const [best] = evaluatePlacesForGhost(ghost, [far, near], new Map())

    expect(best?.placeId).toBe('near')
  })
})

describe('очерёдность заявок', () => {
  it('ставит просроченные заявки в начало, затем сортирует по срочности', () => {
    const ghosts = [
      makeGhost({ id: 'späte', name: 'Поздняя', deadline: '2026-10-20' }),
      makeGhost({ id: 'overdue', name: 'Просроченная', deadline: '2026-09-10' }),
      makeGhost({ id: 'soon', name: 'Скорая', deadline: '2026-09-16' }),
    ]

    expect(prioritizeGhosts(ghosts, TODAY).map((ghost) => ghost.id)).toEqual([
      'overdue',
      'soon',
      'späte',
    ])
  })

  it('при равном дедлайне пропускает вперёд более тревожное привидение', () => {
    const ghosts = [
      makeGhost({ id: 'calm', name: 'Спокойный', anxiety: 2, deadline: '2026-09-20' }),
      makeGhost({ id: 'anxious', name: 'Тревожный', anxiety: 9, deadline: '2026-09-20' }),
    ]

    expect(prioritizeGhosts(ghosts, TODAY).map((ghost) => ghost.id)).toEqual([
      'anxious',
      'calm',
    ])
  })
})

describe('автоподбор', () => {
  it('никогда не превышает вместимость места', () => {
    const places = [makePlace({ id: 'single', capacity: 1 })]
    const ghosts = [
      makeGhost({ id: 'a', name: 'А', deadline: '2026-09-16' }),
      makeGhost({ id: 'b', name: 'Б', deadline: '2026-09-17' }),
    ]

    const result = allocate(ghosts, places, [], TODAY)
    const occupancy = computeOccupancy(result.assignments)

    expect(occupancy.get('single')).toBe(1)
    expect(result.outcomes.filter((outcome) => outcome.placeId === null)).toHaveLength(1)
  })

  it('различает «нет подходящих мест» и «подходящие места заняты»', () => {
    const places = [makePlace({ id: 'tiny', capacity: 1, hasMirrors: true })]
    const tolerant = makeGhost({ id: 'tolerant', name: 'Терпимый', deadline: '2026-09-16' })
    const second = makeGhost({ id: 'second', name: 'Второй', deadline: '2026-09-17' })
    const afraid = makeGhost({
      id: 'afraid',
      name: 'Боящийся',
      deadline: '2026-09-18',
      conditions: { fearsMirrors: true } as Ghost['conditions'],
    })

    const { outcomes } = allocate([tolerant, second, afraid], places, [], TODAY)
    const byId = new Map(outcomes.map((outcome) => [outcome.ghostId, outcome]))

    expect(byId.get('tolerant')?.reason).toBe('placed')
    expect(byId.get('second')?.reason).toBe('all-eligible-full')
    expect(byId.get('afraid')?.reason).toBe('no-eligible-place')
  })

  it('повторный запуск не удваивает занятость и даёт тот же результат', () => {
    const data = createSeedData(TODAY)
    const first = allocate(data.ghosts, data.places, [], TODAY, 'fixed')
    const second = allocate(data.ghosts, data.places, first.assignments, TODAY, 'fixed')

    expect(second.assignments).toEqual(first.assignments)
    for (const [placeId, count] of computeOccupancy(second.assignments)) {
      const place = data.places.find((item) => item.id === placeId)
      expect(count).toBeLessThanOrEqual(place?.capacity ?? 0)
    }
  })

  it('сохраняет ручные размещения и достраивает только автоматические', () => {
    const data = createSeedData(TODAY)
    const manual: Assignment = {
      ghostId: 'ghost-timothy',
      placeId: 'place-lighthouse',
      source: 'manual',
      score: 25,
      forced: false,
      assignedAt: 'fixed',
    }

    const result = allocate(data.ghosts, data.places, [manual], TODAY, 'fixed')

    expect(assignmentOf(result, 'ghost-timothy')).toEqual(manual)
  })
})

describe('демо-сценарий', () => {
  it('оставляет без места ровно те заявки, ради которых собраны демо-данные', () => {
    const data = createSeedData(TODAY)
    const { outcomes } = allocate(data.ghosts, data.places, [], TODAY, 'fixed')
    const byId = new Map(outcomes.map((outcome) => [outcome.ghostId, outcome]))

    // Требует чердак, но все чердаки либо с зеркалами, либо слишком светлые.
    expect(byId.get('ghost-penelope')?.reason).toBe('no-eligible-place')
    // Подходит только подвал, а он к её очереди уже занят.
    expect(byId.get('ghost-marfa')?.reason).toBe('all-eligible-full')
    // Просроченная заявка обрабатывается первой и место получает.
    expect(byId.get('ghost-barnaby')?.reason).toBe('placed')
  })

  it('приводит демо-данные к описанному в README состоянию', () => {
    const data = createSeedData(TODAY)
    const { assignments, outcomes } = allocate(data.ghosts, data.places, [], TODAY, 'fixed')
    const occupancy = computeOccupancy(assignments)

    expect(outcomes.filter((outcome) => outcome.reason === 'placed')).toHaveLength(7)
    expect(assignments).toHaveLength(7)
    // Подвал — единственное тёмное и сырое место, поэтому он заполняется целиком.
    expect(occupancy.get('place-basement')).toBe(2)
    // Крипта закрыта на приём, поэтому остаётся пустой несмотря на идеальные условия.
    expect(occupancy.get('place-crypt')).toBeUndefined()
  })

  it('освобождает прежнее место при подсчёте альтернатив для той же заявки', () => {
    const data = createSeedData(TODAY)
    const { assignments } = allocate(data.ghosts, data.places, [], TODAY, 'fixed')
    const barnaby = assignmentOf({ assignments }, 'ghost-barnaby')
    if (!barnaby) throw new Error('Барнаби должен быть расселён')

    const withGhost = computeOccupancy(assignments).get(barnaby.placeId) ?? 0
    const withoutGhost =
      occupancyExcludingGhost(assignments, 'ghost-barnaby').get(barnaby.placeId) ?? 0

    expect(withoutGhost).toBe(withGhost - 1)
  })
})
