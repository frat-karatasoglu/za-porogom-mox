import { Component, type ErrorInfo, type ReactNode } from 'react'
import { STORAGE_KEY } from '../state/storage'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Страховка от неожиданной ошибки: вместо белого экрана оператор получает
 * объяснение и кнопку восстановления, которая сбрасывает сохранённое
 * состояние и перезагружает страницу.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Сбой интерфейса бюро:', error, info.componentStack)
  }

  private recover = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* если хранилище недоступно, восстанавливать нечего */
    }
    window.location.reload()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="app">
        <main className="shell" style={{ paddingTop: 32 }}>
          <div className="card" style={{ padding: 26, maxWidth: 640 }}>
            <h1 className="page-head__title" style={{ fontSize: 24, marginBottom: 10 }}>
              Бюро временно не отвечает
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 14 }}>
              Произошла непредвиденная ошибка, и экран не удалось отрисовать. Данные в
              браузере сохранены, но, возможно, они и стали причиной сбоя.
            </p>
            <pre className="worklog__prompt" style={{ marginBottom: 16 }}>
              {error.message}
            </pre>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
                Перезагрузить страницу
              </button>
              <button type="button" className="btn btn--danger" onClick={this.recover}>
                Очистить данные и начать заново
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }
}
