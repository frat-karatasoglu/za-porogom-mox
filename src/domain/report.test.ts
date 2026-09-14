import { describe, expect, it } from 'vitest'
import { allocate } from './allocation'
import { buildReport } from './report'
import { createSeedData } from './seed'

const TODAY = '2026-09-14'

describe('отчёт бюро', () => {
  it('не считает пустые места закрытого на приём места свободными', () => {
    const data = createSeedData(TODAY)
    const { assignments } = allocate(data.ghosts, data.places, [], TODAY, 'fixed')

    const report = buildReport({ ...data, assignments }, TODAY)
    const chapel = report.placeLoads.find((load) => load.place.id === 'place-chapel')

    // «Часовня у брода» пуста (0 из 2), но заселить туда нельзя.
    expect(chapel?.closed).toBe(true)
    expect(chapel?.free).toBe(0)
    expect(report.closedSlotsTotal).toBe(2)
    // Свободны только одно место на вокзале и одно в доме игрушек.
    expect(report.freeSlotsTotal).toBe(2)
  })

  it('сводит итоги демо-подбора', () => {
    const data = createSeedData(TODAY)
    const { assignments } = allocate(data.ghosts, data.places, [], TODAY, 'fixed')

    const report = buildReport({ ...data, assignments }, TODAY)

    expect(report.total).toBe(8)
    expect(report.placed).toBe(5)
    expect(report.unplaced).toBe(3)
    expect(report.overdue).toBe(1)
    expect(report.overloadedPlaces).toEqual([])
  })
})
