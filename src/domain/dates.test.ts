import { describe, expect, it } from 'vitest'
import { addDays, daysUntil, formatDays, isOverdue } from './dates'

describe('работа с датами', () => {
  it('считает остаток дней до дедлайна', () => {
    expect(daysUntil('2026-09-20', '2026-09-14')).toBe(6)
    expect(daysUntil('2026-09-14', '2026-09-14')).toBe(0)
    expect(daysUntil('2026-09-10', '2026-09-14')).toBe(-4)
  })

  it('не считает сегодняшний дедлайн просроченным', () => {
    expect(isOverdue('2026-09-14', '2026-09-14')).toBe(false)
    expect(isOverdue('2026-09-13', '2026-09-14')).toBe(true)
  })

  it('корректно переходит через границу месяца', () => {
    expect(addDays('2026-09-28', 5)).toBe('2026-10-03')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('склоняет слово «день» по-русски', () => {
    expect(formatDays(1)).toBe('1 день')
    expect(formatDays(3)).toBe('3 дня')
    expect(formatDays(5)).toBe('5 дней')
    expect(formatDays(11)).toBe('11 дней')
    expect(formatDays(21)).toBe('21 день')
  })
})
