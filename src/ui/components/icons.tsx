import type { SVGProps } from 'react'
import type { ConditionIcon } from '../../domain/labels'
import type { PlaceType } from '../../domain/types'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: number
}

function Svg({ size = 18, ...rest }: IconProps & { children?: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="icon"
      {...rest}
    />
  )
}

export const IconFile = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </Svg>
)

export const IconPin = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.6" />
  </Svg>
)

export const IconChart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 20V11M12 20V5M19 20v-6" />
  </Svg>
)

export const IconBot = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="8" width="16" height="12" rx="3" />
    <path d="M12 4v4M8.5 14v.01M15.5 14v.01M9.5 17.5h5" />
    <circle cx="12" cy="3" r="1.2" />
  </Svg>
)

export const IconDoor = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20h16M6 20V4h9a3 3 0 0 1 3 3v13" />
    <circle cx="14.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
  </Svg>
)

export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
)

export const IconBell = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 15V10a6 6 0 1 0-12 0v5l-1.5 2.5h15L18 15z" />
    <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
  </Svg>
)

export const IconWind = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 8h10a2.6 2.6 0 1 0-2.6-2.6M3 12h14a2.8 2.8 0 1 1-2.8 2.8M3 16h7" />
  </Svg>
)

export const IconUsers = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8.5" r="3" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6.2a3 3 0 0 1 0 5.6M17.5 19a5.4 5.4 0 0 0-2-4.2" />
  </Svg>
)

export const IconMirror = (p: IconProps) => (
  <Svg {...p}>
    <rect x="6" y="3" width="12" height="15" rx="6" />
    <path d="M9 20h6" />
  </Svg>
)

export const IconAttic = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 11.5 12 4l8 7.5V20H4z" />
    <path d="M10 20v-4.5h4V20" />
  </Svg>
)

export const IconDrop = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5s5.5 6 5.5 9.5a5.5 5.5 0 1 1-11 0C6.5 9.5 12 3.5 12 3.5z" />
  </Svg>
)

export const IconMoon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4 8.4 8.4 0 1 0 20 14.2z" />
  </Svg>
)

export const IconSound = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 9.5v5h3l4 3.5v-12L8 9.5H5z" />
    <path d="M16 9.5a3.6 3.6 0 0 1 0 5M18.5 7a7 7 0 0 1 0 10" />
  </Svg>
)

export const IconBan = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M6.2 6.2l11.6 11.6" />
  </Svg>
)

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4 4" />
  </Svg>
)

export const IconSliders = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </Svg>
)

export const IconPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const IconSparkles = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" />
    <path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
  </Svg>
)

export const IconCheck = (p: IconProps) => (
  <Svg strokeWidth={2.4} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
)

export const IconWarning = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4.5 2.8 20h18.4z" />
    <path d="M12 10v4M12 17v.01" />
  </Svg>
)

export const IconAlert = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.8v4.6M12 16v.01" />
  </Svg>
)

export const IconThermometer = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13.5 13.6V5a1.9 1.9 0 0 0-3.8 0v8.6a4 4 0 1 0 3.8 0z" />
  </Svg>
)

export const IconPulse = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 12h3.5l2-5.5 3.5 11 2.5-5.5H21" />
  </Svg>
)

export const IconCalendar = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Svg>
)

export const IconPencil = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20h4L19.2 8.8a2.1 2.1 0 0 0-3-3L5 17v3z" />
  </Svg>
)

export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 9.5l6 6 6-6" />
  </Svg>
)

export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Svg>
)

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
)

export const IconDots = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="5.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="18.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
  </Svg>
)

export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M9.5 7V5h5v2M6.5 7l1 13h9l1-13M10.5 11v5M13.5 11v5" />
  </Svg>
)

export const IconRotate = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 6v5h-5" />
    <path d="M19.4 11a7.6 7.6 0 1 0-1.4 5.6" />
  </Svg>
)

/* ---------- Значки мест ---------- */

const IconTower = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 21V8l5-4 5 4v13" />
    <path d="M4.5 21h15M10 21v-4.5h4V21" />
    <circle cx="12" cy="10.5" r="2" />
  </Svg>
)

const IconStation = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 21h18M5 21V9l7-5 7 5v12" />
    <path d="M9 21v-6h6v6M9.5 10.5h5" />
  </Svg>
)

const IconGreenhouse = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 21V10l8-6 8 6v11z" />
    <path d="M12 4v17M4 12.5h16M4 17h16" />
  </Svg>
)

const IconHouse = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 10.5 12 4l8 6.5V21H4z" />
    <path d="M9.5 21v-6h5v6" />
  </Svg>
)

const IconChapel = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2.5v4M10 4.5h4" />
    <path d="M5 21V11l7-4.5 7 4.5v10z" />
    <path d="M10 21v-5.5h4V21" />
  </Svg>
)

export const PLACE_TYPE_ICON: Record<PlaceType, (props: IconProps) => React.ReactElement> = {
  tower: IconTower,
  station: IconStation,
  greenhouse: IconGreenhouse,
  house: IconHouse,
  chapel: IconChapel,
}

export const CONDITION_ICON: Record<ConditionIcon, (props: IconProps) => React.ReactElement> = {
  clock: IconClock,
  bell: IconBell,
  wind: IconWind,
  people: IconUsers,
  mirror: IconMirror,
  attic: IconAttic,
  drop: IconDrop,
  moon: IconMoon,
  sound: IconSound,
  ban: IconBan,
}
