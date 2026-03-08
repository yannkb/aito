import { useEffect, useRef, useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import styles from './Modal.module.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  if (open && !visible) {
    setVisible(true)
  }

  const closing = visible && !open

  function handleAnimationEnd() {
    if (closing) {
      setVisible(false)
    }
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (!open) return

    const active = document.activeElement
    previousFocusRef.current = active instanceof HTMLElement ? active : null
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    const timer = requestAnimationFrame(() => {
      panelRef.current?.focus()
    })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      cancelAnimationFrame(timer)
      previousFocusRef.current?.focus()
    }
  }, [open, handleKeyDown])

  if (!visible) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const backdropClass = closing
    ? `${styles.backdrop} ${styles.backdropClosing}`
    : styles.backdrop

  const panelClass = closing
    ? `${styles.panel} ${styles.panelClosing}`
    : styles.panel

  return (
    <div
      className={backdropClass}
      onClick={handleBackdropClick}
      onAnimationEnd={handleAnimationEnd}
      role="presentation"
    >
      <div
        ref={panelRef}
        className={panelClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            {title}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close dialog"
            type="button"
          >
            ✕
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}
