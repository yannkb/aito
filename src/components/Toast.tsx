import { useState, useEffect, useCallback } from 'react'
import styles from './Toast.module.css'

interface ToastAction {
  label: string
  onClick: () => void
}

type ToastVariant = 'default' | 'success' | 'error'

export interface ToastData {
  message: string
  duration: number
  action?: ToastAction
  variant: ToastVariant
}

interface ToastProps {
  toast: ToastData
  onDismiss: () => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const [closing, setClosing] = useState(false)

  const startClose = useCallback(() => {
    setClosing(true)
    const timer = setTimeout(() => {
      onDismiss()
    }, 200)
    return () => clearTimeout(timer)
  }, [onDismiss])

  useEffect(() => {
    const timer = setTimeout(() => {
      startClose()
    }, toast.duration)
    return () => clearTimeout(timer)
  }, [toast, startClose])

  const handleAction = () => {
    toast.action?.onClick()
    startClose()
  }

  const isError = toast.variant === 'error'

  const toastClasses = [
    styles.toast,
    closing ? styles.closing : '',
    toast.variant !== 'default' ? styles[toast.variant] : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.container}>
      <div
        className={toastClasses}
        role={isError ? 'alert' : 'status'}
        aria-live={isError ? 'assertive' : 'polite'}
      >
        <span className={styles.message}>{toast.message}</span>
        {toast.action && (
          <button
            type="button"
            className={styles.action}
            onClick={handleAction}
          >
            {toast.action.label}
          </button>
        )}
      </div>
    </div>
  )
}
