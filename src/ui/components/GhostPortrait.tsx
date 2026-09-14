import type { GhostAvatar } from '../../domain/types'

/**
 * Рисунки привидений лежат в `public/ghosts` и привязаны к постоянному полю
 * `avatar` заявки, а не к её позиции в списке: после сортировки, фильтра или
 * поиска за делом остаётся тот же персонаж.
 */
const PORTRAIT_FILE: Record<GhostAvatar, string> = {
  postman: 'p-041',
  archivist: 'p-042',
  ribbon: 'p-043',
  sleeper: 'p-044',
  draught: 'p-045',
  moth: 'p-046',
  shawl: 'p-047',
  inkcloud: 'p-048',
}

export const GHOST_AVATARS = Object.keys(PORTRAIT_FILE) as GhostAvatar[]

export function portraitSrc(kind: GhostAvatar): string {
  const file = PORTRAIT_FILE[kind] ?? PORTRAIT_FILE.postman
  return `${import.meta.env.BASE_URL}ghosts/${file}.png`
}

export function GhostPortrait({
  kind,
  size = 64,
  alt = '',
}: {
  kind: GhostAvatar
  size?: number
  /** Пустая строка — рисунок декоративный, имя привидения и так рядом в тексте. */
  alt?: string
}) {
  return (
    <span className="portrait" style={{ width: size, height: size }}>
      <img src={portraitSrc(kind)} alt={alt} aria-hidden={alt === ''} loading="lazy" />
    </span>
  )
}
