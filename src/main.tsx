import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './styles/themes/dark-gym.css'
import './styles/themes/polynesian.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { ProgramProvider } from './context/ProgramContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ProgramProvider>
          <App />
        </ProgramProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
