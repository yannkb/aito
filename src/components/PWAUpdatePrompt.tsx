import { useRegisterSW } from 'virtual:pwa-register/react'
import styles from './PWAUpdatePrompt.module.css'

export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000)
      }
    },
  })

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
