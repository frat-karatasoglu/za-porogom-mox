import type { PlaceType } from '../../domain/types'
import { PLACE_TYPE_ICON } from './icons'

/**
 * Иллюстрации привязаны к типу места: любой вокзал выглядит как вокзал.
 * Если рисунка для типа нет, в той же рамке показывается линейный значок,
 * чтобы карточки не разъезжались по высоте.
 */
const ILLUSTRATION: Partial<Record<PlaceType, string>> = {
  tower: 'tower',
  station: 'station',
  greenhouse: 'greenhouse',
  house: 'house',
  chapel: 'chapel',
}

export function PlaceIllustration({
  type,
  size = 76,
  alt = '',
}: {
  type: PlaceType
  size?: number
  alt?: string
}) {
  const file = ILLUSTRATION[type]
  const Icon = PLACE_TYPE_ICON[type]

  return (
    <span className="place-art" style={{ width: size, height: size }}>
      {file ? (
        <img
          src={`${import.meta.env.BASE_URL}places/${file}.png`}
          alt={alt}
          aria-hidden={alt === ''}
          loading="lazy"
        />
      ) : (
        <Icon size={Math.round(size * 0.42)} />
      )}
    </span>
  )
}
