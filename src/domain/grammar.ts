import type { GhostGender } from './types'

/**
 * Согласование подписей по роду имени. Без этого интерфейс скатывается
 * к «размещён(а)», а бюро выглядит недоделанным.
 */

export const PLACED_LABEL: Record<GhostGender, string> = {
  m: 'Расселён',
  f: 'Расселена',
  n: 'Расселено',
}

export const MOVED_VERB: Record<GhostGender, string> = {
  m: 'переселён',
  f: 'переселена',
  n: 'переселено',
}

export const PLACED_VERB: Record<GhostGender, string> = {
  m: 'размещён',
  f: 'размещена',
  n: 'размещено',
}
