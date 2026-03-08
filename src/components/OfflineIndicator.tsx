import { useState, useEffect } from 'react'
import { WifiOffIcon } from './icons'
import styles from './OfflineIndicator.module.css'

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)

    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)

    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <WifiOffIcon />
      <span>Offline — changes saved locally</span>
    </div>
  )
}
