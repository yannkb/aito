import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/fonts.css'
import './styles/global.css'
import './styles/themes/dark-gym.css'
import './styles/themes/polynesian.css'
import './styles/themes/berserk.css'
import './styles/themes/dragon-ball.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { ProgramProvider } from './context/ProgramContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ProgramProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ProgramProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
