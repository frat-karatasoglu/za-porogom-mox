import { useState, type FormEvent } from 'react'
import { addDays, parseIsoDate } from '../../domain/dates'
import { PLACE_TYPES, PLACE_TYPE_LABELS } from '../../domain/labels'
import { nextCaseNumber } from '../../domain/seed'
import type { Ghost, GhostAvatar, GhostGender, PlaceType } from '../../domain/types'
import { GHOST_AVATARS, GhostPortrait } from './GhostPortrait'

interface Props {
  /** `null` — создание новой заявки. */
  ghost: Ghost | null
  ghosts: Ghost[]
  today: string
  onSave: (ghost: Ghost) => void
  onCancel: () => void
}

const GENDER_LABELS: Record<GhostGender, string> = {
  m: 'Он (расселён)',
  f: 'Она (расселена)',
  n: 'Оно (расселено)',
}

interface Draft {
  name: string
  gender: GhostGender
  avatar: GhostAvatar
  anxiety: string
  preferredTemp: string
  deadline: string
  note: string
  needsAttic: boolean
  fearsMirrors: boolean
  avoidsHumans: boolean
  noTickingClocks: boolean
  noBells: boolean
  needsDraught: boolean
  lovesDamp: boolean
  limitLight: boolean
  maxLight: string
  limitNoise: boolean
  maxNoise: string
  forbiddenTypes: PlaceType[]
}

function toDraft(ghost: Ghost | null, today: string): Draft {
  if (!ghost) {
    return {
      name: '',
      gender: 'm',
      avatar: 'postman',
      anxiety: '5',
      preferredTemp: '10',
      deadline: addDays(today, 14),
      note: '',
      needsAttic: false,
      fearsMirrors: false,
      avoidsHumans: false,
      noTickingClocks: false,
      noBells: false,
      needsDraught: false,
      lovesDamp: false,
      limitLight: false,
      maxLight: '3',
      limitNoise: false,
      maxNoise: '3',
      forbiddenTypes: [],
    }
  }
  return {
    name: ghost.name,
    gender: ghost.gender,
    avatar: ghost.avatar,
    anxiety: String(ghost.anxiety),
    preferredTemp: String(ghost.preferredTemp),
    deadline: ghost.deadline,
    note: ghost.note,
    needsAttic: ghost.conditions.needsAttic,
    fearsMirrors: ghost.conditions.fearsMirrors,
    avoidsHumans: ghost.conditions.avoidsHumans,
    noTickingClocks: ghost.conditions.noTickingClocks,
    noBells: ghost.conditions.noBells,
    needsDraught: ghost.conditions.needsDraught,
    lovesDamp: ghost.conditions.lovesDamp,
    limitLight: ghost.conditions.maxLight !== null,
    maxLight: String(ghost.conditions.maxLight ?? 3),
    limitNoise: ghost.conditions.maxNoise !== null,
    maxNoise: String(ghost.conditions.maxNoise ?? 3),
    forbiddenTypes: ghost.conditions.forbiddenTypes,
  }
}

function validate(draft: Draft): Record<string, string> {
  const errors: Record<string, string> = {}
  if (draft.name.trim().length < 2) errors.name = 'Укажите имя не короче двух символов.'

  const anxiety = Number(draft.anxiety)
  if (!Number.isInteger(anxiety) || anxiety < 1 || anxiety > 10) {
    errors.anxiety = 'Тревожность — целое число от 1 до 10.'
  }

  const temp = Number(draft.preferredTemp)
  if (!Number.isFinite(temp) || temp < -30 || temp > 40) {
    errors.preferredTemp = 'Температура должна быть в пределах от −30 до 40 °C.'
  }

  if (!parseIsoDate(draft.deadline)) errors.deadline = 'Укажите корректную дату переселения.'

  if (draft.limitLight) {
    const value = Number(draft.maxLight)
    if (!Number.isInteger(value) || value < 0 || value > 10) {
      errors.maxLight = 'Освещённость — целое число от 0 до 10.'
    }
  }
  if (draft.limitNoise) {
    const value = Number(draft.maxNoise)
    if (!Number.isInteger(value) || value < 0 || value > 10) {
      errors.maxNoise = 'Шум — целое число от 0 до 10.'
    }
  }
  return errors
}

export function GhostForm({ ghost, ghosts, today, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(ghost, today))
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  const toggleType = (type: PlaceType) =>
    setDraft((current) => ({
      ...current,
      forbiddenTypes: current.forbiddenTypes.includes(type)
        ? current.forbiddenTypes.filter((item) => item !== type)
        : [...current.forbiddenTypes, type],
    }))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const found = validate(draft)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    onSave({
      id: ghost?.id ?? `ghost-${Date.now().toString(36)}`,
      caseNumber: ghost?.caseNumber ?? nextCaseNumber(ghosts),
      name: draft.name.trim(),
      gender: draft.gender,
      avatar: draft.avatar,
      anxiety: Number(draft.anxiety),
      preferredTemp: Number(draft.preferredTemp),
      deadline: draft.deadline,
      note: draft.note.trim(),
      conditions: {
        needsAttic: draft.needsAttic,
        fearsMirrors: draft.fearsMirrors,
        avoidsHumans: draft.avoidsHumans,
        noTickingClocks: draft.noTickingClocks,
        noBells: draft.noBells,
        needsDraught: draft.needsDraught,
        lovesDamp: draft.lovesDamp,
        maxLight: draft.limitLight ? Number(draft.maxLight) : null,
        maxNoise: draft.limitNoise ? Number(draft.maxNoise) : null,
        forbiddenTypes: draft.forbiddenTypes,
      },
    })
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2 className="form__title">
        {ghost ? `Дело ${ghost.caseNumber}: изменение заявки` : 'Новая заявка на переселение'}
      </h2>

      <div className="form__grid">
        <label className={`field${errors.name ? ' field--error' : ''}`}>
          <span className="field__label">Имя привидения</span>
          <input
            type="text"
            value={draft.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="Например, Шорох Почтовый"
          />
          {errors.name ? <span className="field__error">{errors.name}</span> : null}
        </label>

        <div className="field">
          <span className="field__label">Род в подписях</span>
          <div className="select">
            <select
              value={draft.gender}
              onChange={(event) => update('gender', event.target.value as GhostGender)}
              aria-label="Род имени"
            >
              {(Object.keys(GENDER_LABELS) as GhostGender[]).map((key) => (
                <option key={key} value={key}>
                  {GENDER_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
          <span className="field__hint">Влияет только на подписи вида «Расселён / Расселена».</span>
        </div>

        <label className={`field${errors.anxiety ? ' field--error' : ''}`}>
          <span className="field__label">Уровень тревожности (1–10)</span>
          <input
            type="number"
            min={1}
            max={10}
            value={draft.anxiety}
            onChange={(event) => update('anxiety', event.target.value)}
          />
          <span className="field__hint">Чем выше, тем важнее тишина и темнота в баллах.</span>
          {errors.anxiety ? <span className="field__error">{errors.anxiety}</span> : null}
        </label>

        <label className={`field${errors.preferredTemp ? ' field--error' : ''}`}>
          <span className="field__label">Любимая температура, °C</span>
          <input
            type="number"
            value={draft.preferredTemp}
            onChange={(event) => update('preferredTemp', event.target.value)}
          />
          {errors.preferredTemp ? (
            <span className="field__error">{errors.preferredTemp}</span>
          ) : null}
        </label>

        <label className={`field${errors.deadline ? ' field--error' : ''}`}>
          <span className="field__label">Крайний срок переселения</span>
          <input
            type="date"
            value={draft.deadline}
            onChange={(event) => update('deadline', event.target.value)}
          />
          <span className="field__hint">Чем ближе срок, тем раньше заявку берут в работу.</span>
          {errors.deadline ? <span className="field__error">{errors.deadline}</span> : null}
        </label>
      </div>

      <div>
        <div className="section-label">Портрет в карточке</div>
        <div className="avatar-picker">
          {GHOST_AVATARS.map((avatar) => (
            <button
              key={avatar}
              type="button"
              className="avatar-picker__option"
              aria-pressed={draft.avatar === avatar}
              aria-label={`Портрет ${avatar}`}
              onClick={() => update('avatar', avatar)}
            >
              <GhostPortrait kind={avatar} size={52} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="section-label">Особые условия</div>
        <div className="checks">
          <label className="check">
            <input
              type="checkbox"
              checked={draft.noTickingClocks}
              onChange={(event) => update('noTickingClocks', event.target.checked)}
            />
            Без тикающих часов
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={draft.noBells}
              onChange={(event) => update('noBells', event.target.checked)}
            />
            Без колоколов
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={draft.needsDraught}
              onChange={(event) => update('needsDraught', event.target.checked)}
            />
            Нужен сквозняк
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={draft.avoidsHumans}
              onChange={(event) => update('avoidsHumans', event.target.checked)}
            />
            Без людей рядом
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={draft.needsAttic}
              onChange={(event) => update('needsAttic', event.target.checked)}
            />
            Нужен чердак
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={draft.fearsMirrors}
              onChange={(event) => update('fearsMirrors', event.target.checked)}
            />
            Боится зеркал
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={draft.lovesDamp}
              onChange={(event) => update('lovesDamp', event.target.checked)}
            />
            Любит сырость (предпочтение)
          </label>
        </div>
      </div>

      <div className="form__grid">
        <div className={`field${errors.maxLight ? ' field--error' : ''}`}>
          <label className="check">
            <input
              type="checkbox"
              checked={draft.limitLight}
              onChange={(event) => update('limitLight', event.target.checked)}
            />
            Ограничить освещённость
          </label>
          {draft.limitLight ? (
            <input
              type="number"
              min={0}
              max={10}
              value={draft.maxLight}
              onChange={(event) => update('maxLight', event.target.value)}
              aria-label="Максимальная освещённость"
            />
          ) : null}
          {errors.maxLight ? <span className="field__error">{errors.maxLight}</span> : null}
        </div>

        <div className={`field${errors.maxNoise ? ' field--error' : ''}`}>
          <label className="check">
            <input
              type="checkbox"
              checked={draft.limitNoise}
              onChange={(event) => update('limitNoise', event.target.checked)}
            />
            Ограничить уровень шума
          </label>
          {draft.limitNoise ? (
            <input
              type="number"
              min={0}
              max={10}
              value={draft.maxNoise}
              onChange={(event) => update('maxNoise', event.target.value)}
              aria-label="Максимальный уровень шума"
            />
          ) : null}
          {errors.maxNoise ? <span className="field__error">{errors.maxNoise}</span> : null}
        </div>
      </div>

      <div>
        <div className="section-label">Типы мест, которые заявка не примет</div>
        <div className="checks">
          {PLACE_TYPES.map((type) => (
            <label key={type} className="check">
              <input
                type="checkbox"
                checked={draft.forbiddenTypes.includes(type)}
                onChange={() => toggleType(type)}
              />
              {PLACE_TYPE_LABELS[type]}
            </label>
          ))}
        </div>
      </div>

      <label className="field">
        <span className="field__label">Заметка оператора</span>
        <textarea
          rows={2}
          value={draft.note}
          onChange={(event) => update('note', event.target.value)}
          placeholder="Свободный текст — алгоритм его не учитывает"
        />
        <span className="field__hint">
          Подбор опирается только на поля выше: заметка нужна людям, а не алгоритму.
        </span>
      </label>

      <div className="form__footer">
        <button type="button" className="btn" onClick={onCancel}>
          Отмена
        </button>
        <button type="submit" className="btn btn--primary">
          {ghost ? 'Сохранить изменения' : 'Создать заявку'}
        </button>
      </div>
    </form>
  )
}
