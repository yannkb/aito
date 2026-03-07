import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './styles/themes/dark-gym.css'
import './styles/themes/polynesian.css'
import App from './App.tsx'
import { ProgramProvider } from './context/ProgramContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProgramProvider>
      <App />
    </ProgramProvider>
  </StrictMode>,
)
