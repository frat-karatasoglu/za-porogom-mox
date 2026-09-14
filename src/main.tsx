import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './ui/App'
import { ErrorBoundary } from './ui/ErrorBoundary'
import './styles/global.css'

const container = document.getElementById('root')
if (!container) throw new Error('Не найден корневой элемент #root')

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
