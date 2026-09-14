import { useState } from 'react'
import { useBureau } from '../state/useBureau'
import { Alert } from './components/Primitives'
import { ApplicationsTab } from './tabs/ApplicationsTab'
import { PlacesTab } from './tabs/PlacesTab'
import { ReportTab } from './tabs/ReportTab'
import { WorklogTab } from './tabs/WorklogTab'
import {
  IconAlert,
  IconBot,
  IconChart,
  IconClose,
  IconFile,
  IconPin,
  type IconProps,
} from './components/icons'

type TabId = 'applications' | 'places' | 'report' | 'worklog'

const TABS: Array<{ id: TabId; label: string; Icon: (props: IconProps) => React.ReactElement }> = [
  { id: 'applications', label: 'Заявки', Icon: IconFile },
  { id: 'places', label: 'Места', Icon: IconPin },
  { id: 'report', label: 'Отчёт', Icon: IconChart },
  { id: 'worklog', label: 'AI Worklog', Icon: IconBot },
]

/** Оператор бюро: подпись в правом верхнем углу. */
const OPERATOR_NAME = 'Фырат'

export function App() {
  const bureau = useBureau()
  const [tab, setTab] = useState<TabId>('applications')
  const { notice, actions } = bureau

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <img
              className="brand__logo"
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt=""
              aria-hidden="true"
              width={40}
              height={40}
            />
            <div>
              <div className="brand__name">За порогом</div>
              <div className="brand__tagline">Бюро переселения привидений</div>
            </div>
          </div>

          <nav className="nav" aria-label="Разделы бюро">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                className="nav__item"
                aria-current={tab === id ? 'page' : undefined}
                onClick={() => setTab(id)}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>

          <div className="topbar__user">
            <span className="avatar-initial">{OPERATOR_NAME.charAt(0)}</span>
            <span>{OPERATOR_NAME}</span>
          </div>
        </div>
      </header>

      <main className="shell">
        {notice ? (
          <Alert
            kind={notice.kind}
            icon={<IconAlert size={18} />}
            className="notice-bar"
            action={
              <button
                type="button"
                className="icon-btn"
                style={{ width: 28, height: 28 }}
                onClick={actions.dismissNotice}
                aria-label="Скрыть сообщение"
              >
                <IconClose size={15} />
              </button>
            }
          >
            {notice.text}
          </Alert>
        ) : null}

        {tab === 'applications' ? <ApplicationsTab {...bureau} /> : null}
        {tab === 'places' ? <PlacesTab {...bureau} /> : null}
        {tab === 'report' ? <ReportTab {...bureau} /> : null}
        {tab === 'worklog' ? <WorklogTab /> : null}
      </main>

      <footer className="app__footer">
        Демонстрационный проект. Данные хранятся только в этом браузере (localStorage) и не
        отправляются на сервер.
      </footer>
    </div>
  )
}
