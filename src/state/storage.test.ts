import { describe, expect, it } from 'vitest'
import {
  createMemoryAdapter,
  loadBureauData,
  saveBureauData,
} from './storage'
import { createSeedData } from '../domain/seed'

describe('хранилище состояния', () => {
  it('отдаёт демо-данные, если в хранилище пусто', () => {
    const { data, recoveryNotice } = loadBureauData(createMemoryAdapter(), '2026-09-14')

    expect(recoveryNotice).toBeNull()
    expect(data.ghosts.length).toBeGreaterThan(0)
    expect(data.places.length).toBeGreaterThan(0)
    expect(data.assignments).toEqual([])
  })

  it('сохраняет и восстанавливает состояние без потерь', () => {
    const adapter = createMemoryAdapter()
    const original = createSeedData('2026-09-14')
    const firstGhost = original.ghosts[0]
    const firstPlace = original.places[0]
    if (!firstGhost || !firstPlace) throw new Error('Демо-данные пусты')

    original.assignments.push({
      ghostId: firstGhost.id,
      placeId: firstPlace.id,
      source: 'manual',
      score: 71,
      forced: false,
      assignedAt: '2026-09-14T10:00:00.000Z',
    })

    expect(saveBureauData(adapter, original)).toBeNull()
    expect(loadBureauData(adapter, '2026-09-14').data).toEqual(original)
  })

  it('восстанавливается после повреждённых данных и объясняет причину', () => {
    const adapter = createMemoryAdapter('{ это не JSON')

    const { data, recoveryNotice } = loadBureauData(adapter, '2026-09-14')

    expect(recoveryNotice).toContain('Загружены демо-данные')
    // Техническое сообщение парсера не должно попадать в русскоязычный интерфейс.
    expect(recoveryNotice).toContain('файл состояния не читается')
    expect(recoveryNotice).not.toMatch(/JSON at position/)
    expect(data.ghosts.length).toBeGreaterThan(0)
  })

  it('отбрасывает размещения, ссылающиеся на удалённые заявки или места', () => {
    const adapter = createMemoryAdapter()
    const data = createSeedData('2026-09-14')
    data.assignments.push({
      ghostId: 'ghost-которого-нет',
      placeId: 'place-castle',
      source: 'auto',
      score: 50,
      forced: false,
      assignedAt: '2026-09-14T10:00:00.000Z',
    })
    saveBureauData(adapter, data)

    expect(loadBureauData(adapter, '2026-09-14').data.assignments).toEqual([])
  })
})
