import {
  AI_DECISIONS,
  AI_MISTAKES,
  CHECKLIST,
  HUMAN_DECISIONS,
  IMPROVEMENTS,
  MANUAL_REWRITES,
  WORKLOG_STAGES,
  WORKLOG_TIME,
  WORKLOG_TOKENS,
  WORKLOG_TOOLS,
  type PendingValue,
} from '../../content/worklog'
import { PageHead } from '../components/PageHead'

function PendingBlock({ title, value }: { title: string; value: PendingValue }) {
  return (
    <section className="card panel">
      <h3 className="panel__title">
        {title} {value.pending ? <span className="todo-flag">нужно уточнить</span> : null}
      </h3>
      <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 8 }}>{value.text}</p>
    </section>
  )
}

function ListPanel({
  title,
  hint,
  items,
}: {
  title: string
  hint?: string
  items: string[]
}) {
  return (
    <section className="card panel">
      <h3 className="panel__title">{title}</h3>
      {hint ? <p className="panel__hint">{hint}</p> : null}
      <ul className="worklog__list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export function WorklogTab() {
  return (
    <>
      <PageHead
        eyebrow="Как это сделано"
        title="AI Worklog"
        subtitle="Кто что делал на каждом этапе, где AI ошибся и что осталось за кадром"
      />
      <div className="worklog">
      <section className="card panel">
        <p className="worklog__intro">
          Журнал ведётся честно: незаполненные поля помечены отдельно, вместо правдоподобных, но
          выдуманных чисел. Решения человека и решения AI разведены по разным спискам.
        </p>
      </section>

      <section className="card panel">
        <h3 className="panel__title">Инструменты</h3>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Инструмент</th>
                <th>Роль в работе</th>
              </tr>
            </thead>
            <tbody>
              {WORKLOG_TOOLS.map((tool) => (
                <tr key={tool.name}>
                  <td>{tool.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{tool.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <PendingBlock title="Время разработки" value={WORKLOG_TIME} />
      <PendingBlock title="Израсходованные токены" value={WORKLOG_TOKENS} />

      <section className="card panel">
        <h3 className="panel__title">Этапы работы</h3>
        <p className="panel__hint">
          Для каждого этапа: что делал человек, что делал AI и суть ключевого запроса.
        </p>
      </section>

      {WORKLOG_STAGES.map((stage) => (
        <article key={stage.id} className="card worklog__stage">
          <div className="worklog__stage-head">
            <span className="worklog__stage-name">{stage.title}</span>
          </div>
          <div className="worklog__roles">
            <div className="worklog__role">
              <div className="worklog__role-title">Человек</div>
              {stage.human}
            </div>
            <div className="worklog__role">
              <div className="worklog__role-title">AI</div>
              {stage.ai}
            </div>
          </div>
          <div className="worklog__role-title">Ключевой запрос</div>
          <p className="worklog__prompt">{stage.prompt}</p>
        </article>
      ))}

      <ListPanel
        title="Решения, которые принял человек"
        hint="Рамки, заданные автором работы: именно они определили форму продукта."
        items={HUMAN_DECISIONS}
      />

      <ListPanel
        title="Решения, которые принял AI"
        hint="Вынесены отдельно, чтобы не приписывать их человеку."
        items={AI_DECISIONS}
      />

      <ListPanel
        title="Где AI ошибся"
        hint="Реальные ошибки этой сессии, а не общие слова про «галлюцинации»."
        items={AI_MISTAKES}
      />

      <PendingBlock title="Что доработано вручную" value={MANUAL_REWRITES} />

      <ListPanel
        title="Что улучшить, будь это реальный продукт"
        items={IMPROVEMENTS}
      />

      <section className="card panel">
        <h3 className="panel__title">Чеклист самопроверки</h3>
        <p className="panel__hint">
          Сценарии, пройденные перед сдачей. Их можно повторить прямо в этом приложении.
        </p>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Сценарий</th>
                <th>Ожидаемый результат</th>
              </tr>
            </thead>
            <tbody>
              {CHECKLIST.map((item) => (
                <tr key={item.scenario}>
                  <td>{item.scenario}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.expected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      </div>
    </>
  )
}
