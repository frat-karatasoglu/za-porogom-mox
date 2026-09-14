import type { GhostAvatar } from '../../domain/types'

/**
 * Небольшие рисунки привидений. У каждой заявки свой силуэт — по нему
 * оператор узнаёт дело в списке быстрее, чем по имени.
 */

const BODY =
  'M20 7c-6 0-10.8 4.8-10.8 10.8v12.4c0 1.3 1.5 2 2.5 1.1l1.8-1.6c.6-.5 1.4-.5 2 0l1.7 1.5c.6.5 1.4.5 2 0l1.7-1.5c.6-.5 1.4-.5 2 0l1.8 1.6c1 .9 2.5.2 2.5-1.1V17.8C30.8 11.8 26 7 20 7z'

function Eyes({ x1 = 16.4, x2 = 23.6, y = 18.2, r = 1.5 }) {
  return (
    <>
      <circle cx={x1} cy={y} r={r} fill="currentColor" stroke="none" />
      <circle cx={x2} cy={y} r={r} fill="currentColor" stroke="none" />
    </>
  )
}

function ClosedEyes({ y = 18.4 }) {
  return (
    <>
      <path d={`M14.6 ${y}q1.8 1.8 3.6 0`} />
      <path d={`M21.8 ${y}q1.8 1.8 3.6 0`} />
    </>
  )
}

function Art({ kind }: { kind: GhostAvatar }) {
  switch (kind) {
    case 'postman':
      return (
        <>
          <path d={BODY} />
          <Eyes y={19.4} />
          {/* фуражка почтальона */}
          <path d="M11.4 14.2h17.2M13 14.2v-2.4c0-1.6 1.3-2.9 2.9-2.9h8.2c1.6 0 2.9 1.3 2.9 2.9v2.4" />
          {/* конверт в руках */}
          <rect x="15.5" y="23.5" width="9" height="6" rx="1" />
          <path d="M15.5 24.4l4.5 3 4.5-3" />
        </>
      )
    case 'archivist':
      return (
        <>
          <path d={BODY} />
          {/* круглые очки */}
          <circle cx="16.2" cy="18.4" r="3" />
          <circle cx="23.8" cy="18.4" r="3" />
          <path d="M19.2 18.4h1.6" />
          {/* раскрытая книга */}
          <path d="M13.5 26.5c2.4-1.2 4.4-1.2 6.5 0 2.1-1.2 4.1-1.2 6.5 0v4c-2.4-1.2-4.4-1.2-6.5 0-2.1-1.2-4.1-1.2-6.5 0zM20 26.5v4" />
        </>
      )
    case 'ribbon':
      return (
        <>
          {/* лента вместо плотного силуэта */}
          <path d="M14.6 7.2c-2.6 2.4-2.6 5.2 0 7.6s2.6 5.2 0 7.6 -2.6 5.2 0 7.6" />
          <path d="M25.4 7.2c2.6 2.4 2.6 5.2 0 7.6s-2.6 5.2 0 7.6 2.6 5.2 0 7.6" />
          <path d="M14.6 7.2h10.8M14.6 30h10.8" />
          <Eyes x1={17.2} x2={22.8} y={16.4} r={1.3} />
          <path d="M17.6 21.4q2.4 1.6 4.8 0" />
        </>
      )
    case 'sleeper':
      return (
        <>
          <path d={BODY} />
          <ClosedEyes y={19} />
          {/* сонные «зет» */}
          <path d="M26.6 8.5h4l-4 4.4h4M31.4 4.4h2.8l-2.8 3h2.8" />
        </>
      )
    case 'draught':
      return (
        <>
          <path d={BODY} />
          <Eyes y={18.6} />
          <path d="M17.4 23.4q2.6 2 5.2 0" />
          {/* потоки воздуха */}
          <path d="M4.6 14h4.4M3.2 18.4h5.8M5 22.8h4M31 14h4.4M31 18.4h5.8M31 22.8h4" />
        </>
      )
    case 'moth':
      return (
        <>
          {/* крылья ночной моли */}
          <path d="M20 12.5c-2.6-4-6.4-5.6-9-4.2-2.6 1.4-2.4 5.4.4 8.4 2 2.2 5.2 3.6 8.6 3.8" />
          <path d="M20 12.5c2.6-4 6.4-5.6 9-4.2 2.6 1.4 2.4 5.4-.4 8.4-2 2.2-5.2 3.6-8.6 3.8" />
          <path d="M20 20.5c-3 .4-5.4 2.2-6.2 4.8-.8 2.8 1 5.4 3.6 5.8 1.6.2 2.6-.6 2.6-2M20 20.5c3 .4 5.4 2.2 6.2 4.8.8 2.8-1 5.4-3.6 5.8-1.6.2-2.6-.6-2.6-2" />
          <path d="M20 12v16" />
          {/* усики */}
          <path d="M18.6 11.2c-1.4-2-3-3.2-4.6-3.6M21.4 11.2c1.4-2 3-3.2 4.6-3.6" />
        </>
      )
    case 'shawl':
      return (
        <>
          <path d={BODY} />
          <Eyes y={17} />
          {/* шаль, наброшенная на плечи */}
          <path d="M10.4 21c2.6 2.2 5.8 3.4 9.6 3.4s7-1.2 9.6-3.4" />
          <path d="M12.4 22.6c.4 3.2 1.8 5.6 4 7.2M27.6 22.6c-.4 3.2-1.8 5.6-4 7.2" />
          <path d="M16.4 30.6q3.6 2 7.2 0" />
        </>
      )
    case 'inkcloud':
      return (
        <>
          {/* чернильное облачко */}
          <path d="M13.4 27.6c-3.2 0-5.8-2.5-5.8-5.6 0-2.7 2-5 4.7-5.5.6-4 4.2-7 8.5-7 4 0 7.4 2.7 8.3 6.3 2.7.5 4.7 2.8 4.7 5.5 0 3.1-2.6 5.6-5.8 5.6z" />
          <Eyes x1={16.8} x2={23.2} y={19.6} r={1.4} />
          <path d="M17.6 23.4q2.4 1.8 4.8 0" />
          {/* капли чернил */}
          <path d="M15 30.4v2.2M20 31v3M25 30.4v2.2" />
        </>
      )
    case 'plain':
    default:
      return (
        <>
          <path d={BODY} />
          <Eyes />
          <path d="M17.4 23q2.6 1.8 5.2 0" />
        </>
      )
  }
}

export function GhostPortrait({
  kind,
  size = 40,
}: {
  kind: GhostAvatar
  size?: number
}) {
  return (
    <span
      className="portrait"
      style={{ width: size, height: size, color: 'var(--brand)' }}
      aria-hidden="true"
    >
      <svg
        width={size - 6}
        height={size - 6}
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        <Art kind={kind} />
      </svg>
    </span>
  )
}
