import { createContext, useContext, useState, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import { Toast } from '../components/Toast'
import type { ToastData } from '../components/Toast'

interface ToastOptions {
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'success' | 'error'
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void
  dismissToast: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (dismissTimerRef.current !== null) {
      clearTimeout(dismissTimerRef.current)
      dismissTimerRef.current = null
    }
  }, [])

  const dismissToast = useCallback(() => {
    clearTimer()
    setToast(null)
  }, [clearTimer])

  const showToast = useCallback(
    (options: ToastOptions) => {
      clearTimer()
      setToast({
        message: options.message,
        duration: options.duration ?? 4000,
        action: options.action,
        variant: options.variant ?? 'default',
      })
    },
    [clearTimer]
  )

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {toast && <Toast toast={toast} onDismiss={dismissToast} />}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
