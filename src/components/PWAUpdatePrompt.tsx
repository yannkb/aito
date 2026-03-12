import { useEffect, useRef } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import styles from './PWAUpdatePrompt.module.css'

export function PWAUpdatePrompt(): React.JSX.Element | null {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)
  const intervalRef = useRef<number | null>(null)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        registrationRef.current = registration
      }
    },
  })

  useEffect(() => {
    const registration = registrationRef.current
    if (!registration) return

    intervalRef.current = window.setInterval(() => {
      registration.update()
    }, 60 * 60 * 1000)

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [needRefresh])

  if (!needRefresh) return null

  const handleUpdate = () => {
    updateServiceWorker(true)
  }

  const handleDismiss = () => {
    setNeedRefresh(false)
  }

  return (
    <div className={styles.toast} role="alert">
      <span className={styles.message}>New version available</span>
      <div className={styles.actions}>
        <button
          className={styles.updateButton}
          onClick={handleUpdate}
          type="button"
        >
          Update
        </button>
        <button
          className={styles.dismissButton}
          onClick={handleDismiss}
          type="button"
          aria-label="Dismiss update notification"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
